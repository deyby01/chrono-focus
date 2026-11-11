import { TaskModel } from '../models/TaskModel.js';
import { ApiView } from '../views/ApiView.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

/** @type {import('../types.js').TaskPriority[]} */
const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];

/** @type {import('../types.js').TaskStatus[]} */
const VALID_STATUSES = ['pending', 'in_progress', 'completed', 'archived'];

/**
 * Handles CRUD for scheduled tasks.
 */
export class TaskController {
  /**
   * Lists tasks, ordered by status, time slot, priority, then newest.
   *
   * @route GET /api/tasks
   * @param {import('express').Request} req - Query: {@link import('../types.js').TaskFilters}.
   * @param {import('express').Response} res - Responds with `SerializedTask[]`.
   */
  static list = asyncHandler(async (req, res) => {
    const tasks = await TaskModel.findAll({
      date: req.query.date,
      categoryId: req.query.categoryId,
      status: req.query.status,
      priority: req.query.priority,
      search: req.query.search,
    });
    return ApiView.success(res, tasks);
  });

  /**
   * Returns a single task with its category fields.
   *
   * @route GET /api/tasks/:id
   * @param {import('express').Request} req - Params: `id`.
   * @param {import('express').Response} res
   * @throws {AppError} 404 if the task does not exist.
   */
  static getById = asyncHandler(async (req, res) => {
    const task = await TaskModel.findById(Number(req.params.id));
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    return ApiView.success(res, task);
  });

  /**
   * Creates and schedules a task.
   *
   * @route POST /api/tasks
   * @param {import('express').Request} req - Body: {@link import('../types.js').TaskInput} (`title` and `category_id` required).
   * @param {import('express').Response} res - Responds `201` with the created `SerializedTask`.
   * @throws {AppError} 400 on missing title/category, invalid priority/status, or non-positive duration.
   */
  static create = asyncHandler(async (req, res) => {
    const { title, category_id, priority, status, planned_duration_minutes } = req.body;

    if (!title || !String(title).trim()) {
      throw new AppError('Task title is required', 400);
    }
    if (!category_id) {
      throw new AppError('Task category_id is required', 400);
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      throw new AppError(`Invalid priority. Allowed: ${VALID_PRIORITIES.join(', ')}`, 400);
    }
    if (status && !VALID_STATUSES.includes(status)) {
      throw new AppError(`Invalid status. Allowed: ${VALID_STATUSES.join(', ')}`, 400);
    }
    if (planned_duration_minutes !== undefined && Number(planned_duration_minutes) <= 0) {
      throw new AppError('Planned duration must be greater than 0 minutes', 400);
    }

    const created = await TaskModel.create(req.body);
    return ApiView.created(res, created);
  });

  /**
   * Partially updates a task. Also used for status toggles and checklist progress.
   *
   * @route PUT /api/tasks/:id
   * @route PATCH /api/tasks/:id
   * @param {import('express').Request} req - Params: `id`. Body: {@link import('../types.js').TaskInput}.
   * @param {import('express').Response} res - Responds with the updated `SerializedTask`.
   * @throws {AppError} 400 on invalid priority/status or non-positive duration.
   * @throws {AppError} 404 if the task does not exist.
   */
  static update = asyncHandler(async (req, res) => {
    const { priority, status, planned_duration_minutes } = req.body;

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      throw new AppError(`Invalid priority. Allowed: ${VALID_PRIORITIES.join(', ')}`, 400);
    }
    if (status && !VALID_STATUSES.includes(status)) {
      throw new AppError(`Invalid status. Allowed: ${VALID_STATUSES.join(', ')}`, 400);
    }
    if (planned_duration_minutes !== undefined && Number(planned_duration_minutes) <= 0) {
      throw new AppError('Planned duration must be greater than 0 minutes', 400);
    }

    const updated = await TaskModel.update(Number(req.params.id), req.body);
    if (!updated) {
      throw new AppError('Task not found', 404);
    }
    return ApiView.success(res, updated);
  });

  /**
   * Deletes a task. Its focus sessions are removed by cascade.
   *
   * @route DELETE /api/tasks/:id
   * @param {import('express').Request} req - Params: `id`.
   * @param {import('express').Response} res - Responds with `{ id, deleted: true }`.
   * @throws {AppError} 404 if the task does not exist.
   */
  static remove = asyncHandler(async (req, res) => {
    const deleted = await TaskModel.delete(Number(req.params.id));
    if (!deleted) {
      throw new AppError('Task not found', 404);
    }
    return ApiView.success(res, { id: Number(req.params.id), deleted: true });
  });
}
