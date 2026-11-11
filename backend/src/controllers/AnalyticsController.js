import { AnalyticsModel } from '../models/AnalyticsModel.js';
import { ApiView } from '../views/ApiView.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

/**
 * Exposes daily resume and all-time performance analytics.
 */
export class AnalyticsController {
  /**
   * Returns the end-of-day summary for a date.
   *
   * @route GET /api/analytics/daily-resume
   * @param {import('express').Request} req - Query: `date` (YYYY-MM-DD, optional, defaults to today).
   * @param {import('express').Response} res - Responds with a {@link import('../types.js').DailyResume}.
   */
  static getDailyResume = asyncHandler(async (req, res) => {
    const resume = await AnalyticsModel.getDailyResume(req.query.date || null);
    return ApiView.success(res, resume);
  });

  /**
   * Returns all-time productivity records (best session, best day, peak hour, 7-day trend).
   *
   * @route GET /api/analytics/performance
   * @param {import('express').Request} req
   * @param {import('express').Response} res - Responds with {@link import('../types.js').PerformanceMetrics}.
   */
  static getPerformance = asyncHandler(async (req, res) => {
    const performance = await AnalyticsModel.getPerformanceMetrics();
    return ApiView.success(res, performance);
  });
}
