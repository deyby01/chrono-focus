import { CategoryModel } from '../models/CategoryModel.js';
import { ApiView } from '../views/ApiView.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

/**
 * Handles CRUD for categories (task types such as courses, projects, or hobbies).
 */
export class CategoryController {
  /**
   * Lists all categories with task counts and time statistics.
   *
   * @route GET /api/categories
   * @param {import('express').Request} req - Query: `date` (optional) for the "today" time stat.
   * @param {import('express').Response} res - Responds with `CategoryWithStats[]`.
   */
  static list = asyncHandler(async (req, res) => {
    const categories = await CategoryModel.findAll(req.query.date || null);
    return ApiView.success(res, categories);
  });

  /**
   * Returns a single category.
   *
   * @route GET /api/categories/:id
   * @param {import('express').Request} req - Params: `id`.
   * @param {import('express').Response} res
   * @throws {AppError} 404 if the category does not exist.
   */
  static getById = asyncHandler(async (req, res) => {
    const category = await CategoryModel.findById(Number(req.params.id));
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return ApiView.success(res, category);
  });

  /**
   * Creates a new category. The slug is derived from the name.
   *
   * @route POST /api/categories
   * @param {import('express').Request} req - Body: {@link import('../types.js').CategoryInput} (`name` required).
   * @param {import('express').Response} res - Responds `201` with the created category.
   * @throws {AppError} 400 if `name` is missing or blank.
   */
  static create = asyncHandler(async (req, res) => {
    const { name, color, icon, description, daily_target_minutes } = req.body;
    if (!name || !String(name).trim()) {
      throw new AppError('Category name is required', 400);
    }
    const created = await CategoryModel.create({
      name,
      color,
      icon,
      description,
      daily_target_minutes,
    });
    return ApiView.created(res, created);
  });

  /**
   * Partially updates a category. Omitted fields keep their current values.
   *
   * @route PUT /api/categories/:id
   * @param {import('express').Request} req - Params: `id`. Body: {@link import('../types.js').CategoryInput}.
   * @param {import('express').Response} res
   * @throws {AppError} 404 if the category does not exist.
   */
  static update = asyncHandler(async (req, res) => {
    const updated = await CategoryModel.update(Number(req.params.id), req.body);
    if (!updated) {
      throw new AppError('Category not found', 404);
    }
    return ApiView.success(res, updated);
  });

  /**
   * Deletes a category that has no tasks assigned.
   *
   * @route DELETE /api/categories/:id
   * @param {import('express').Request} req - Params: `id`.
   * @param {import('express').Response} res - Responds with `{ id, deleted: true }`.
   * @throws {AppError} 400 if tasks are still assigned (raised by the model).
   * @throws {AppError} 404 if the category does not exist.
   */
  static remove = asyncHandler(async (req, res) => {
    const deleted = await CategoryModel.delete(Number(req.params.id));
    if (!deleted) {
      throw new AppError('Category not found', 404);
    }
    return ApiView.success(res, { id: Number(req.params.id), deleted: true });
  });
}
