import { sequelize } from '../config/database.js';
import { ApiView } from '../views/ApiView.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

/**
 * Liveness and database connectivity probe.
 */
export class HealthController {
  /**
   * Verifies the API is running and PostgreSQL is reachable.
   *
   * @route GET /api/health
   * @param {import('express').Request} _req
   * @param {import('express').Response} res - Responds with service, ORM, and DB status.
   */
  static check = asyncHandler(async (_req, res) => {
    await sequelize.authenticate();
    return ApiView.success(res, {
      service: 'chrono-focus-api',
      orm: 'Sequelize',
      database: 'connected',
      serverTime: new Date().toISOString(),
    });
  });
}
