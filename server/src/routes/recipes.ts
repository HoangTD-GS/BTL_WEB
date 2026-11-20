import { Router } from 'express';
import {
  createRecipe,
  deleteRecipe,
  getAllRecipes,
  getMyRecipes,
  getRecipeById,
  getSavedIds,
  getSavedRecipes,
  toggleLikeRecipe,
  toggleSaveRecipe,
  updateRecipe,
} from '../controllers/recipe.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllRecipes);
// Các đường dẫn cố định phải đặt trước '/:id'
router.get('/my-recipes', protect, getMyRecipes);
router.get('/saved', protect, getSavedRecipes);
router.get('/saved/ids', protect, getSavedIds);
router.get('/:id', getRecipeById);
router.post('/', protect, createRecipe);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);
router.put('/:id/like', protect, toggleLikeRecipe);
router.put('/:id/save', protect, toggleSaveRecipe);

export default router;
