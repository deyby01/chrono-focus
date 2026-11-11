import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController.js';

/**
 * Category (task type) routes, mounted at `/api/categories`.
 * @type {import('express').Router}
 */
const router = Router();

router.get('/', CategoryController.list);
router.get('/:id', CategoryController.getById);
router.post('/', CategoryController.create);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.remove);

export default router;

