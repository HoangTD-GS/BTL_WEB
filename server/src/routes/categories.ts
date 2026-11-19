import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getCategories); // ai cũng xem được (form đăng công thức, bộ lọc)
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
