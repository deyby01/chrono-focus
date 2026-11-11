import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import { FocusSession, Task, Category } from './entities.js';

/**
 * Flattens a Sequelize `FocusSession` (with nested `task.category`) into the API shape.
 *
 * @param {import('sequelize').Model|Object} sessionInstance - Sequelize instance or plain object.
 * @returns {import('../types.js').SerializedSession}
 */
function serializeSession(sessionInstance) {
  const plain = sessionInstance.get ? sessionInstance.get({ plain: true }) : sessionInstance;
  const task = plain.task || {};
  const cat = task.category || {};

  return {
    id: plain.id,
    task_id: plain.task_id,
    task_title: task.title || '',
    planned_duration_minutes: Number(task.planned_duration_minutes || 0),
    category_id: cat.id || task.category_id || 0,
    category_name: cat.name || '',
    category_color: cat.color || '#3B82F6',
    category_icon: cat.icon || 'folder',
    planned_seconds: Number(plain.planned_seconds),
    duration_seconds: Number(plain.duration_seconds),
    completed_countdown: Boolean(plain.completed_countdown),
    notes: plain.notes || '',
    started_at: plain.started_at,
    ended_at: plain.ended_at,
  };
}

/**
 * Data-access layer for focus sessions logged by the reverse chronometer.
 */
export class FocusSessionModel {
  /**
   * Lists sessions, newest first, with task and category details.
   * The `date` filter matches sessions whose `started_at` falls within that UTC day.
   *
   * @param {import('../types.js').SessionFilters} [filters={}]
   * @returns {Promise<import('../types.js').SerializedSession[]>}
   */
  static async findAll(filters = {}) {
    const whereClause = {};

    if (filters.date) {
      const startOfDay = new Date(`${filters.date}T00:00:00.000Z`);
      const endOfDay = new Date(`${filters.date}T23:59:59.999Z`);
      whereClause.started_at = {
        [Op.between]: [startOfDay, endOfDay],
      };
    }

    if (filters.taskId) {
      whereClause.task_id = Number(filters.taskId);
    }

    const limit = Math.min(Number(filters.limit || 50), 200);

    const sessions = await FocusSession.findAll({
      where: whereClause,
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'planned_duration_minutes', 'category_id'],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'color', 'icon'],
            },
          ],
        },
      ],
      order: [['started_at', 'DESC']],
      limit,
    });

    return sessions.map(serializeSession);
  }

  /**
   * Records a session and updates the parent task atomically in one transaction:
   * adds `duration_seconds` to the task, moves `pending` tasks to `in_progress`,
   * and marks the task `completed` when `mark_task_completed` is true.
   *
   * @param {import('../types.js').SessionInput} data
   * @returns {Promise<{ session: Object, task: Object }>} The created session and updated task.
   */
  static async create(data) {
    return sequelize.transaction(async (transaction) => {
      const durationSeconds = Math.max(1, Math.round(Number(data.duration_seconds)));
      const plannedSeconds = Math.max(
        1,
        Math.round(Number(data.planned_seconds || durationSeconds))
      );
      const completedCountdown = Boolean(data.completed_countdown);
      const endedAt = data.ended_at ? new Date(data.ended_at) : new Date();
      const startedAt = data.started_at
        ? new Date(data.started_at)
        : new Date(endedAt.getTime() - durationSeconds * 1000);

      const session = await FocusSession.create(
        {
          task_id: Number(data.task_id),
          planned_seconds: plannedSeconds,
          duration_seconds: durationSeconds,
          completed_countdown: completedCountdown,
          notes: data.notes?.trim() || '',
          started_at: startedAt,
          ended_at: endedAt,
        },
        { transaction }
      );

      const task = await Task.findByPk(Number(data.task_id), { transaction });
      const markCompleted = Boolean(data.mark_task_completed);

      const nextStatus = markCompleted
        ? 'completed'
        : task.status === 'pending'
        ? 'in_progress'
        : task.status;

      const nextCompletedAt =
        markCompleted && !task.completed_at ? new Date() : task.completed_at;

      await task.update(
        {
          actual_duration_seconds: Number(task.actual_duration_seconds || 0) + durationSeconds,
          status: nextStatus,
          completed_at: nextCompletedAt,
        },
        { transaction }
      );

      return {
        session: session.get({ plain: true }),
        task: task.get({ plain: true }),
      };
    });
  }

  /**
   * Deletes a session and subtracts its duration from the parent task (never below 0),
   * both inside one transaction.
   *
   * @param {number} id
   * @returns {Promise<boolean>} `true` if deleted, `false` if not found.
   */
  static async delete(id) {
    return sequelize.transaction(async (transaction) => {
      const session = await FocusSession.findByPk(id, { transaction });
      if (!session) {
        return false;
      }

      const task = await Task.findByPk(session.task_id, { transaction });
      if (task) {
        const nextActual = Math.max(
          0,
          Number(task.actual_duration_seconds || 0) - Number(session.duration_seconds || 0)
        );
        await task.update({ actual_duration_seconds: nextActual }, { transaction });
      }

      await session.destroy({ transaction });
      return true;
    });
  }
}
