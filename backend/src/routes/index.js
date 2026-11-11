import { Router } from 'express';
import { HealthController } from '../controllers/HealthController.js';
import categoryRoutes from './categoryRoutes.js';
import taskRoutes from './taskRoutes.js';
import sessionRoutes from './sessionRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

/**
 * Root API router mounted at `/api`. Aggregates all resource routers.
 * @type {import('express').Router}
 */
const router = Router();

router.get('/health', HealthController.check);
router.use('/categories', categoryRoutes);
router.use('/tasks', taskRoutes);
router.use('/sessions', sessionRoutes);
router.use('/analytics', analyticsRoutes);

export default router;

