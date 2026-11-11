/**
 * View layer of the MVC backend. Serializes every HTTP response into a
 * consistent JSON envelope so the frontend can parse all endpoints the same way.
 *
 * Success: `{ status: 'success', data, meta? }`
 * Error:   `{ status: 'error', message, details? }`
 */
export class ApiView {
  /**
   * Sends a successful JSON response.
   *
   * @param {import('express').Response} res
   * @param {*} data - Payload placed under `data`.
   * @param {number} [statusCode=200]
   * @param {Object} [meta] - Optional metadata (e.g. pagination).
   * @returns {import('express').Response}
   */
  static success(res, data, statusCode = 200, meta = undefined) {
    const payload = {
      status: 'success',
      data,
    };
    if (meta) {
      payload.meta = meta;
    }
    return res.status(statusCode).json(payload);
  }

  /**
   * Sends a `201 Created` response for newly persisted resources.
   *
   * @param {import('express').Response} res
   * @param {*} data - The created resource.
   * @returns {import('express').Response}
   */
  static created(res, data) {
    return ApiView.success(res, data, 201);
  }

  /**
   * Sends an error JSON response.
   *
   * @param {import('express').Response} res
   * @param {string} message - Client-facing error message.
   * @param {number} [statusCode=500]
   * @param {*} [details] - Optional extra error context.
   * @returns {import('express').Response}
   */
  static error(res, message, statusCode = 500, details = undefined) {
    const payload = {
      status: 'error',
      message,
    };
    if (details) {
      payload.details = details;
    }
    return res.status(statusCode).json(payload);
  }
}
