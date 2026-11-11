/**
 * Wraps an async Express handler so rejected promises reach the error middleware
 * instead of becoming unhandled rejections. Removes repetitive try/catch blocks.
 *
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<unknown>} handler
 * @returns {import('express').RequestHandler} Express-compatible request handler.
 */
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
