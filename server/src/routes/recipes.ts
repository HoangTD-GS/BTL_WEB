import { Router } from 'express';
import {
  createRecipe,
  deleteRecipe,
  getAllRecipes,
  getMyRecipes,
  getRecipeById,
  toggleLikeRecipe,
  updateRecipe,
} from '../controllers/recipe.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllRecipes);
router.get('/my-recipes', protect, getMyRecipes);
router.get('/:id', getRecipeById);
router.post('/', protect, createRecipe);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);
router.put('/:id/like', protect, toggleLikeRecipe);

export default router;
