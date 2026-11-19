import type { RequestHandler } from 'express';
import Category from '../models/Category.js';
import Recipe from '../models/Recipe.js';
import { fail, requireObjectId } from '../utils/http.js';
import { compareVi } from '../utils/query.js';

interface CategoryBody {
  name?: unknown;
}

const readName = (body: unknown): string =>
  typeof (body as CategoryBody | undefined)?.name === 'string'
    ? ((body as CategoryBody).name as string).trim()
    : '';

// Tên trùng không phân biệt hoa/thường ("Món chay" = "món chay").
// Danh mục chỉ vài chục dòng nên so sánh trong JS cho đơn giản.
const nameTaken = async (name: string, exceptId?: unknown): Promise<boolean> => {
  const all = await Category.find().select('name').lean();
  const target = name.toLowerCase();
  return all.some((c) => c.name.toLowerCase() === target && String(c._id) !== String(exceptId));
};

// GET /api/categories  (công khai)
export const getCategories: RequestHandler = async (_req, res) => {
  const categories = await Category.find();
  res.json(categories.sort((a, b) => compareVi(a.name, b.name)));
};

// POST /api/categories  (admin)
export const createCategory: RequestHandler = async (req, res) => {
  const name = readName(req.body);
  if (!name) fail(res, 400, 'Tên danh mục không được để trống');
  if (await nameTaken(name)) fail(res, 409, 'Danh mục đã tồn tại');

  const category = await Category.create({ name });
  res.status(201).json(category);
};

// PUT /api/categories/:id  (admin)
export const updateCategory: RequestHandler<{ id: string }> = async (req, res) => {
  const id = requireObjectId(res, req.params.id, 'ID danh mục');
  const name = readName(req.body);
  if (!name) fail(res, 400, 'Tên danh mục không được để trống');

  const category = await Category.findById(id);
  if (!category) fail(res, 404, 'Không tìm thấy danh mục');
  if (await nameTaken(name, category._id)) fail(res, 409, 'Đã có danh mục khác trùng tên');

  category.name = name;
  await category.save();
  res.json(category);
};

// DELETE /api/categories/:id  (admin)
export const deleteCategory: RequestHandler<{ id: string }> = async (req, res) => {
  const id = requireObjectId(res, req.params.id, 'ID danh mục');

  const category = await Category.findById(id);
  if (!category) fail(res, 404, 'Không tìm thấy danh mục');

  const used = await Recipe.countDocuments({ category: category._id });
  if (used > 0) {
    fail(res, 409, `Không thể xóa: còn ${used} công thức đang dùng danh mục này`);
  }

  await category.deleteOne();
  res.json({ message: 'Đã xóa danh mục', _id: category._id });
};
