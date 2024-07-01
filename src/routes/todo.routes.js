import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { createTodo, getAllTodos, getTodos } from '../controllers/TodoSchema.js';

const router = Router();

router.route('/create').post(verifyJWT, createTodo);
router.route('/').get(verifyJWT, getTodos);
router.route('/all').get(verifyJWT, getAllTodos);

export default router;
