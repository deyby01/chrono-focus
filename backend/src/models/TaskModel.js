import { Op } from 'sequelize';
import { Task, Category } from './entities.js';

/**
 * Sort weight per status: active work first, archived last.
 * @type {Record<import('../types.js').TaskStatus, number>}
 */
const STATUS_WEIGHT = {
  in_progress: 1,
  pending: 2,
  completed: 3,
  archived: 4,
};

/**
 * Sort weight per priority: most urgent first.
 * @type {Record<import('../types.js').TaskPriority, number>}
 */
const PRIORITY_WEIGHT = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
};

/**
 * Flattens a Sequelize `Task` (with its eager-loaded `category`) into the API shape.
 *
 * @param {import('sequelize').Model|Object} taskInstance - Sequelize instance or plain object.
 * @returns {import('../types.js').SerializedTask}
 */
function serializeTask(taskInstance) {
  const plain = taskInstance.get ? taskInstance.get({ plain: true }) : taskInstance;
  const cat = plain.category || {};
  return {
    id: plain.id,
    title: plain.title,
    description: plain.description,
    category_id: plain.category_id,
    category_name: cat.name || '',
    category_slug: cat.slug || '',
    category_color: cat.color || '#3B82F6',
    category_icon: cat.icon || 'folder',
    priority: plain.priority,
    status: plain.status,
    planned_duration_minutes: Number(plain.planned_duration_minutes),
    actual_duration_seconds: Number(plain.actual_duration_seconds),
    scheduled_date: plain.scheduled_date,
    scheduled_start_time: plain.scheduled_start_time,
    checklist: Array.isArray(plain.checklist) ? plain.checklist : [],
    completed_at: plain.completed_at,
    created_at: plain.created_at,
    updated_at: plain.updated_at,
  };
}

/**
 * Data-access layer for scheduled tasks.
 */
export class TaskModel {
  /**
   * Lists tasks matching the given filters, sorted by status, time slot
   * (tasks without a slot last), priority, and then newest first.
   *
   * @param {import('../types.js').TaskFilters} [filters={}]
   * @returns {Promise<import('../types.js').SerializedTask[]>}
   */
  static async findAll(filters = {}) {
    const whereClause = {};

    if (filters.date) {
      whereClause.scheduled_date = filters.date;
    }

    if (filters.categoryId) {
      whereClause.category_id = Number(filters.categoryId);
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.priority) {
      whereClause.priority = filters.priority;
    }

    if (filters.search && String(filters.search).trim()) {
      const pattern = `%${String(filters.search).trim()}%`;
      whereClause[Op.or] = [
        { title: { [Op.iLike]: pattern } },
        { description: { [Op.iLike]: pattern } },
      ];
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'color', 'icon'],
        },
      ],
    });

    return tasks
      .map(serializeTask)
      .sort((a, b) => {
        const statusDiff = (STATUS_WEIGHT[a.status] || 9) - (STATUS_WEIGHT[b.status] || 9);
        if (statusDiff !== 0) return statusDiff;

        if (a.scheduled_start_time && b.scheduled_start_time) {
          const timeCmp = a.scheduled_start_time.localeCompare(b.scheduled_start_time);
          if (timeCmp !== 0) return timeCmp;
        } else if (a.scheduled_start_time) {
          return -1;
        } else if (b.scheduled_start_time) {
          return 1;
        }

        const prioDiff = (PRIORITY_WEIGHT[a.priority] || 9) - (PRIORITY_WEIGHT[b.priority] || 9);
        if (prioDiff !== 0) return prioDiff;

        return b.id - a.id;
      });
  }

  /**
   * Finds a task by primary key, including its category fields.
   *
   * @param {number} id
   * @returns {Promise<import('../types.js').SerializedTask|null>} The task, or `null` if not found.
   */
  static async findById(id) {
    const task = await Task.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'color', 'icon'],
        },
      ],
    });
    return task ? serializeTask(task) : null;
  }

  /**
   * Creates a task with defaults (medium priority, pending, 25 min, today).
   * Sets `completed_at` when the task is created already completed.
   *
   * @param {import('../types.js').TaskInput & { title: string, category_id: number|string }} data
   * @returns {Promise<import('../types.js').SerializedTask>} The created task.
   * @throws {Error} SequelizeForeignKeyConstraintError if `category_id` does not exist.
   */
  static async create(data) {
    const status = data.status || 'pending';
    const completedAt = status === 'completed' ? new Date() : null;
    const todayStr = new Date().toISOString().slice(0, 10);

    const created = await Task.create({
      title: data.title.trim(),
      description: data.description?.trim() || '',
      category_id: Number(data.category_id),
      priority: data.priority || 'medium',
      status,
      planned_duration_minutes: Number(data.planned_duration_minutes || 25),
      actual_duration_seconds: Number(data.actual_duration_seconds || 0),
      scheduled_date: data.scheduled_date || todayStr,
      scheduled_start_time: data.scheduled_start_time || null,
      checklist: Array.isArray(data.checklist) ? data.checklist : [],
      completed_at: completedAt,
    });

    return TaskModel.findById(created.id);
  }

  /**
   * Partially updates a task. Manages `completed_at` automatically:
   * set when transitioning into `completed`, cleared when leaving it.
   *
   * @param {number} id
   * @param {import('../types.js').TaskInput} data - Omitted fields keep their current values.
   * @returns {Promise<import('../types.js').SerializedTask|null>} The updated task, or `null` if not found.
   */
  static async update(id, data) {
    const existing = await Task.findByPk(id);
    if (!existing) return null;

    const nextStatus = data.status ?? existing.status;
    let nextCompletedAt = existing.completed_at;
    if (nextStatus === 'completed' && existing.status !== 'completed') {
      nextCompletedAt = new Date();
    } else if (nextStatus !== 'completed') {
      nextCompletedAt = null;
    }

    await existing.update({
      title: data.title !== undefined ? data.title.trim() : existing.title,
      description:
        data.description !== undefined ? data.description.trim() : existing.description,
      category_id:
        data.category_id !== undefined ? Number(data.category_id) : existing.category_id,
      priority: data.priority ?? existing.priority,
      status: nextStatus,
      planned_duration_minutes:
        data.planned_duration_minutes !== undefined
          ? Number(data.planned_duration_minutes)
          : existing.planned_duration_minutes,
      actual_duration_seconds:
        data.actual_duration_seconds !== undefined
          ? Number(data.actual_duration_seconds)
          : existing.actual_duration_seconds,
      scheduled_date: data.scheduled_date ?? existing.scheduled_date,
      scheduled_start_time:
        data.scheduled_start_time !== undefined
          ? data.scheduled_start_time
          : existing.scheduled_start_time,
      checklist: data.checklist !== undefined ? data.checklist : existing.checklist,
      completed_at: nextCompletedAt,
    });

    return TaskModel.findById(id);
  }

  /**
   * Deletes a task. Related focus sessions are removed by the CASCADE association.
   *
   * @param {number} id
   * @returns {Promise<boolean>} `true` if a row was deleted.
   */
  static async delete(id) {
    const deletedCount = await Task.destroy({ where: { id } });
    return deletedCount > 0;
  }
}
