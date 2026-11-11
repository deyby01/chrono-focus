/**
 * Operational error carrying an HTTP status code.
 * Throw it from controllers or models; `errorHandler` turns it into a JSON response.
 *
 * @extends Error
 * @example
 * throw new AppError('Task not found', 404);
 */
export class AppError extends Error {
  /**
   * @param {string} message - Client-facing error message.
   * @param {number} [statusCode=400] - HTTP status code to respond with.
   * @param {*} [details=null] - Optional extra context included in the response.
   */
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
