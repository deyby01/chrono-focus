import { Router } from 'express';
import { TaskController } from '../controllers/TaskController.js';

/**
 * Task routes, mounted at `/api/tasks`. PUT and PATCH both perform partial updates.
 * @type {import('express').Router}
 */
const router = Router();

router.get('/', TaskController.list);
router.get('/:id', TaskController.getById);
router.post('/', TaskController.create);
router.put('/:id', TaskController.update);
router.patch('/:id', TaskController.update);
router.delete('/:id', TaskController.remove);

export default router;

