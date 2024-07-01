import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    createComment,
    getCommentsOnTodo,
} from '../controllers/comment.controller.js';

const router = Router();

router.route('/create/:todoId').post(verifyJWT, createComment);
router.route('/get/:todoId').get(verifyJWT, getCommentsOnTodo);

export default router;
