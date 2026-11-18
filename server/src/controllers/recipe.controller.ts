import { Request, Response } from 'express';
import Recipe from '../models/Recipe.js';
import Comment from '../models/Comment.js';

// 1. Lấy tất cả công thức (có kèm thông tin tác giả, sắp xếp mới nhất)
export const getAllRecipes = async (_req: Request, res: Response) => {
  try {
    const recipes = await Recipe.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 2. Lấy công thức của riêng user đang đăng nhập (Trang cá nhân / My Recipes)
export const getMyRecipes = async (req: any, res: Response) => {
  try {
    const recipes = await Recipe.find({ author: req.user?._id }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 3. Xem chi tiết 1 công thức kèm theo danh sách bình luận
export const getRecipeById = async (req: Request, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'name email');
    if (!recipe) {
      return res.status(404).json({ message: 'Không tìm thấy công thức' });
    }

    const comments = await Comment.find({ recipe: recipe._id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ recipe, comments });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 4. Tạo bài viết công thức mới
export const createRecipe = async (req: any, res: Response) => {
  try {
    const { title, description, ingredients, steps, image } = req.body;
    const newRecipe = new Recipe({
      title,
      description,
      ingredients,
      steps,
      image,
      author: req.user?._id,
    });
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (error: any) {
    res.status(400).json({ message: 'Lỗi dữ liệu', error: error.message });
  }
};

// 5. Sửa bài viết (chỉ tác giả mới có quyền)
export const updateRecipe = async (req: any, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Không tìm thấy công thức' });
    }

    if (recipe.author.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa bài viết này' });
    }

    const updated = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: 'Lỗi cập nhật', error: error.message });
  }
};

// 6. Xóa bài viết và dọn dẹp các bình luận liên quan
export const deleteRecipe = async (req: any, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Không tìm thấy công thức' });
    }

    if (recipe.author.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa bài viết này' });
    }

    await recipe.deleteOne();
    await Comment.deleteMany({ recipe: recipe._id });
    res.json({ message: 'Đã xóa thành công bài viết và bình luận liên quan' });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 7. Thả tim / Bỏ tim bài viết (Like toggle)
export const toggleLikeRecipe = async (req: any, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Không tìm thấy công thức' });
    }

    const userId = req.user?._id;
    const index = recipe.likes.findIndex((id: any) => id.toString() === userId.toString());

    if (index > -1) {
      recipe.likes.splice(index, 1); // Đã thích trước đó -> bỏ thích
    } else {
      recipe.likes.push(userId); // Chưa thích -> thêm vào danh sách like
    }

    await recipe.save();
    res.json(recipe);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};