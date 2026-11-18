import { Router, Request, Response } from 'express';
import Recipe from '../models/Recipe.js';
import Comment from '../models/Comment.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const recipes = await Recipe.find() 
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.get('/my-recipes', protect, async (req: any, res: Response) => {
  try {
    const recipes = await Recipe.find({ author: req.user?._id }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'username');
    if (!recipe) return res.status(404).json({ message: 'Không tìm thấy công thức' });

    const comments = await Comment.find({ recipe: recipe._id }).populate('user', 'username').sort({ createdAt: -1 });
    res.json({ recipe, comments });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.post('/', protect, async (req: any, res: Response) => {
  try {
    const { title, description, ingredients, steps, image } = req.body;
    const newRecipe = new Recipe({
      title,
      description,
      ingredients,
      steps,
      image,
      author: req.user?._id
    });
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (error: any) {
    res.status(400).json({ message: 'Lỗi dữ liệu', error: error.message });
  }
});

router.put('/:id', protect, async (req: any, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Không tìm thấy công thức' });

    if (recipe.author.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa bài viết này' });
    }

    const updated = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: 'Lỗi cập nhật', error: error.message });
  }
});

router.delete('/:id', protect, async (req: any, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Không tìm thấy công thức' });

    if (recipe.author.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa bài viết này' });
    }

    await recipe.deleteOne();
    await Comment.deleteMany({ recipe: recipe._id });
    res.json({ message: 'Đã xóa thành công' });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.put('/:id/like', protect, async (req: any, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Không tìm thấy công thức' });

    const userId = req.user?._id;
    const index = recipe.likes.findIndex((id: any) => id.toString() === userId.toString());

    if (index > -1) {
      recipe.likes.splice(index, 1);
    } else {
      recipe.likes.push(userId);
    }

    await recipe.save();
    res.json(recipe);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;

