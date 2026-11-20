import { Router } from 'express';
import { addComment, deleteComment } from '../controllers/comment.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/:recipeId', protect, addComment);
router.delete('/:commentId', protect, deleteComment);

export default router;
