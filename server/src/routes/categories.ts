import { Router } from 'express';
<<<<<<< HEAD

const router = Router();

// TODO: định nghĩa các endpoint cho /api/categories
router.get('/ping', (_req, res) => res.json({ ok: true, route: 'categories' }));
=======
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
>>>>>>> origin/jqk

export default router;
