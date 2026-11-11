import { Router } from 'express';
import { FocusSessionController } from '../controllers/FocusSessionController.js';

/**
 * Focus session routes, mounted at `/api/sessions`.
 * @type {import('express').Router}
 */
const router = Router();

router.get('/', FocusSessionController.list);
router.post('/', FocusSessionController.create);
router.delete('/:id', FocusSessionController.remove);

export default router;

