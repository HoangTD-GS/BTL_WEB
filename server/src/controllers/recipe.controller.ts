import type { RequestHandler } from 'express';
import Comment from '../models/Comment.js';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';

type RecipeInput = {
  title?: unknown;
  description?: unknown;
  ingredients?: unknown;
  steps?: unknown;
  image?: unknown;
  cookTime?: unknown;
  servings?: unknown;
  category?: unknown;
};

export const getAllRecipes: RequestHandler = async (_req, res) => {
  const recipes = await Recipe.find()
    .populate('author', 'name email')
    .populate('category', 'name')
    .sort({ createdAt: -1 });
  res.json(recipes);
};

export const getMyRecipes: RequestHandler = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
  const recipes = await Recipe.find({ author: req.user._id })
    .populate('author', 'name email')
    .populate('category', 'name')
    .sort({ createdAt: -1 });
  res.json(recipes);
};

export const getRecipeById: RequestHandler<{ id: string }> = async (req, res) => {
  const recipe = await Recipe.findById(req.params.id)
    .populate('author', 'name email')
    .populate('category', 'name');
  if (!recipe) return res.status(404).json({ message: 'Không tìm thấy công thức' });

  const comments = await Comment.find({ recipe: recipe._id })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
  res.json({ recipe, comments });
};

export const createRecipe: RequestHandler = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
  const input = req.body as RecipeInput;
  if (
    typeof input.title !== 'string' ||
    !input.title.trim() ||
    !Array.isArray(input.ingredients) ||
    !input.ingredients.every((item) => typeof item === 'string') ||
    !Array.isArray(input.steps) ||
    !input.steps.every((step) => typeof step === 'string')
  ) {
    return res.status(400).json({ message: 'Thông tin công thức không hợp lệ' });
  }

  const recipe = await Recipe.create({
    title: input.title.trim(),
    description: typeof input.description === 'string' ? input.description.trim() : '',
    ingredients: input.ingredients,
    steps: input.steps,
    image: typeof input.image === 'string' ? input.image.trim() : '',
    cookTime: typeof input.cookTime === 'number' ? input.cookTime : 0,
    servings: typeof input.servings === 'number' ? input.servings : 1,
    category: typeof input.category === 'string' && input.category ? input.category : null,
    author: req.user._id,
  });
  res.status(201).json(recipe);
};

export const updateRecipe: RequestHandler<{ id: string }> = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Không tìm thấy công thức' });
  if (String(recipe.author) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Bạn không có quyền sửa công thức này' });
  }

  const input = req.body as RecipeInput;
  const updates: RecipeInput = {};
  for (const key of ['title', 'description', 'ingredients', 'steps', 'image', 'cookTime', 'servings'] as const) {
    if (key in input) updates[key] = input[key];
  }
  if ('category' in input) {
    updates.category = typeof input.category === 'string' && input.category ? input.category : null;
  }
  if (typeof updates.title === 'string') updates.title = updates.title.trim();
  if (typeof updates.description === 'string') updates.description = updates.description.trim();
  if (typeof updates.image === 'string') updates.image = updates.image.trim();

  const updated = await Recipe.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!updated) return res.status(404).json({ message: 'Không tìm thấy công thức' });
  res.json(updated);
};

export const deleteRecipe: RequestHandler<{ id: string }> = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Không tìm thấy công thức' });
  if (String(recipe.author) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Bạn không có quyền xóa công thức này' });
  }

  await Promise.all([
    Comment.deleteMany({ recipe: recipe._id }),
    User.updateMany({ savedRecipes: recipe._id }, { $pull: { savedRecipes: recipe._id } }),
  ]);
  await recipe.deleteOne();
  res.json({ message: 'Đã xóa công thức' });
};

export const toggleLikeRecipe: RequestHandler<{ id: string }> = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Không tìm thấy công thức' });

  const userId = String(req.user._id);
  const index = recipe.likes.findIndex((likeId) => String(likeId) === userId);
  if (index >= 0) recipe.likes.splice(index, 1);
  else recipe.likes.push(req.user._id);

  await recipe.save();
  res.json(recipe);
};
