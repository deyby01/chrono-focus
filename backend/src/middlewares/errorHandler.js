import { ApiView } from '../views/ApiView.js';
import { AppError } from '../utils/AppError.js';

/**
 * Catch-all for unmatched routes. Forwards a 404 `AppError` to `errorHandler`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
export function notFoundHandler(req, res, next) {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
}

/**
 * Centralized error middleware. Maps known error types to HTTP responses:
 * - `AppError` → its own status code and message
 * - Unique constraint violation → 409
 * - Foreign key violation → 400
 * - Sequelize validation error → 400 with field messages
 * - Anything else → logged and returned as a generic 500
 *
 * @param {Error & { code?: string, errors?: Array<{ message: string }> }} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next - Required so Express detects an error handler.
 * @returns {import('express').Response}
 */
export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return ApiView.error(res, err.message, err.statusCode, err.details);
  }

  if (err.name === 'SequelizeUniqueConstraintError' || err.code === '23505') {
    return ApiView.error(res, 'A record with this unique value already exists.', 409);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError' || err.code === '23503') {
    return ApiView.error(res, 'Referenced resource does not exist or is still in use.', 400);
  }

  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors ? err.errors.map((e) => e.message).join(', ') : err.message;
    return ApiView.error(res, `Validation error: ${messages}`, 400);
  }

  console.error('Unhandled error:', err);
  return ApiView.error(res, 'Internal server error', 500);
}
