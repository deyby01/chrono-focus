import { Category, Task, FocusSession } from './entities.js';
import { slugify } from '../utils/slugify.js';
import { AppError } from '../utils/AppError.js';

/**
 * Data-access layer for categories (task types).
 */
export class CategoryModel {
  /**
   * Returns every category with aggregated task and time statistics.
   *
   * @param {string|null} [targetDate=null] - Date (YYYY-MM-DD) used for `today_spent_seconds`; defaults to today.
   * @returns {Promise<import('../types.js').CategoryWithStats[]>} Categories ordered by id.
   */
  static async findAll(targetDate = null) {
    const resolvedDate = targetDate || new Date().toISOString().slice(0, 10);

    const categories = await Category.findAll({
      include: [
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'status', 'actual_duration_seconds'],
          include: [
            {
              model: FocusSession,
              as: 'sessions',
              attributes: ['duration_seconds', 'started_at'],
            },
          ],
        },
      ],
      order: [['id', 'ASC']],
    });

    return categories.map((cat) => {
      const plain = cat.get({ plain: true });
      const tasks = plain.tasks || [];

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === 'completed').length;
      const totalSpentSeconds = tasks.reduce(
        (sum, t) => sum + Number(t.actual_duration_seconds || 0),
        0
      );

      let todaySpentSeconds = 0;
      for (const task of tasks) {
        for (const session of task.sessions || []) {
          const sessionDate = new Date(session.started_at).toISOString().slice(0, 10);
          if (sessionDate === resolvedDate) {
            todaySpentSeconds += Number(session.duration_seconds || 0);
          }
        }
      }

      return {
        id: plain.id,
        name: plain.name,
        slug: plain.slug,
        color: plain.color,
        icon: plain.icon,
        description: plain.description,
        daily_target_minutes: plain.daily_target_minutes,
        created_at: plain.created_at,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        total_spent_seconds: totalSpentSeconds,
        today_spent_seconds: todaySpentSeconds,
      };
    });
  }

  /**
   * Finds a category by primary key.
   *
   * @param {number} id
   * @returns {Promise<Object|null>} Plain category object, or `null` if not found.
   */
  static async findById(id) {
    const category = await Category.findByPk(id);
    return category ? category.get({ plain: true }) : null;
  }

  /**
   * Creates a category, generating its slug from the name and applying defaults.
   *
   * @param {import('../types.js').CategoryInput & { name: string }} input
   * @returns {Promise<Object>} The created category.
   * @throws {Error} SequelizeUniqueConstraintError if the name or slug already exists.
   */
  static async create({ name, color, icon, description, daily_target_minutes }) {
    const created = await Category.create({
      name: name.trim(),
      slug: slugify(name),
      color: color || '#3B82F6',
      icon: icon || 'folder',
      description: description || '',
      daily_target_minutes: Number(daily_target_minutes ?? 60),
    });
    return created.get({ plain: true });
  }

  /**
   * Partially updates a category. The slug is regenerated only when the name changes.
   *
   * @param {number} id
   * @param {import('../types.js').CategoryInput} input - Omitted fields keep their current values.
   * @returns {Promise<Object|null>} The updated category, or `null` if not found.
   */
  static async update(id, { name, color, icon, description, daily_target_minutes }) {
    const category = await Category.findByPk(id);
    if (!category) return null;

    await category.update({
      name: name !== undefined ? name.trim() : category.name,
      slug: name !== undefined ? slugify(name) : category.slug,
      color: color ?? category.color,
      icon: icon ?? category.icon,
      description: description ?? category.description,
      daily_target_minutes:
        daily_target_minutes !== undefined
          ? Number(daily_target_minutes)
          : category.daily_target_minutes,
    });

    return category.get({ plain: true });
  }

  /**
   * Deletes a category only if no tasks reference it.
   *
   * @param {number} id
   * @returns {Promise<boolean>} `true` if deleted, `false` if not found.
   * @throws {AppError} 400 if tasks are still assigned to the category.
   */
  static async delete(id) {
    const category = await Category.findByPk(id);
    if (!category) return false;

    const assignedTasksCount = await Task.count({ where: { category_id: id } });
    if (assignedTasksCount > 0) {
      throw new AppError(
        'Cannot delete this task type because it still has tasks assigned to it.',
        400
      );
    }

    await category.destroy();
    return true;
  }
}
