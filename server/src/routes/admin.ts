import { Router } from 'express';
import { adminOnly, protect } from '../middleware/auth.js';
import { deleteComment, listComments } from '../controllers/adminCommentController.js';
import { deleteRecipe, listRecipes } from '../controllers/adminRecipeController.js';
import { getStats } from '../controllers/adminStatsController.js';
import { deleteUser, listUsers, updateUserRole } from '../controllers/adminUserController.js';

const router = Router();

router.use(protect, adminOnly);
router.get('/stats', getStats);
router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/recipes', listRecipes);
router.delete('/recipes/:id', deleteRecipe);
router.get('/comments', listComments);
router.delete('/comments/:id', deleteComment);

export default router;
