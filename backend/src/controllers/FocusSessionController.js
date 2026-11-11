import { FocusSessionModel } from '../models/FocusSessionModel.js';
import { TaskModel } from '../models/TaskModel.js';
import { ApiView } from '../views/ApiView.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

/**
 * Handles focus sessions recorded by the reverse chronometer.
 */
export class FocusSessionController {
  /**
   * Lists focus sessions, newest first.
   *
   * @route GET /api/sessions
   * @param {import('express').Request} req - Query: `date`, `taskId`, `limit` (all optional).
   * @param {import('express').Response} res - Responds with `SerializedSession[]`.
   */
  static list = asyncHandler(async (req, res) => {
    const sessions = await FocusSessionModel.findAll({
      date: req.query.date,
      taskId: req.query.taskId,
      limit: req.query.limit,
    });
    return ApiView.success(res, sessions);
  });

  /**
   * Logs a focus session and adds its duration to the parent task.
   *
   * @route POST /api/sessions
   * @param {import('express').Request} req - Body: {@link import('../types.js').SessionInput}.
   * @param {import('express').Response} res - Responds `201` with `{ session, task }`.
   * @throws {AppError} 400 if `task_id` is missing or `duration_seconds` is not positive.
   * @throws {AppError} 404 if the referenced task does not exist.
   */
  static create = asyncHandler(async (req, res) => {
    const { task_id, duration_seconds } = req.body;

    if (!task_id) {
      throw new AppError('task_id is required to log a focus session', 400);
    }
    if (!duration_seconds || Number(duration_seconds) <= 0) {
      throw new AppError('duration_seconds must be greater than 0', 400);
    }

    const existingTask = await TaskModel.findById(Number(task_id));
    if (!existingTask) {
      throw new AppError('Referenced task not found', 404);
    }

    const result = await FocusSessionModel.create(req.body);
    return ApiView.created(res, result);
  });

  /**
   * Deletes a session and subtracts its duration from the parent task.
   *
   * @route DELETE /api/sessions/:id
   * @param {import('express').Request} req - Params: `id`.
   * @param {import('express').Response} res - Responds with `{ id, deleted: true }`.
   * @throws {AppError} 404 if the session does not exist.
   */
  static remove = asyncHandler(async (req, res) => {
    const deleted = await FocusSessionModel.delete(Number(req.params.id));
    if (!deleted) {
      throw new AppError('Focus session not found', 404);
    }
    return ApiView.success(res, { id: Number(req.params.id), deleted: true });
  });
}
