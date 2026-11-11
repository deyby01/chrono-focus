import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController.js';

/**
 * Analytics routes, mounted at `/api/analytics`.
 * @type {import('express').Router}
 */
const router = Router();

router.get('/daily-resume', AnalyticsController.getDailyResume);
router.get('/performance', AnalyticsController.getPerformance);

export default router;

