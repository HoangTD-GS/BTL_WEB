import type { RequestHandler } from 'express';
import type { Types } from 'mongoose';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import Comment from '../models/Comment.js';
import Category from '../models/Category.js';
import { compareVi } from '../utils/query.js';

// GET /api/admin/stats
export const getStats: RequestHandler = async (_req, res) => {
  const [users, admins, recipes, comments, categories] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    Recipe.countDocuments(),
    Comment.countDocuments(),
    Category.countDocuments(),
  ]);

  // Top 5 công thức được thích nhiều nhất (chỉ tính công thức đã có lượt thích)
  const likeRows = await Recipe.aggregate<{ _id: Types.ObjectId; likesCount: number }>([
    { $unwind: '$likes' },
    { $group: { _id: '$_id', likesCount: { $sum: 1 } } },
    { $sort: { likesCount: -1, _id: 1 } },
    { $limit: 5 },
  ]);
  const topDocs = await Recipe.find({ _id: { $in: likeRows.map((r) => r._id) } })
    .select('title author')
    .populate<{ author: { name: string } | null }>('author', 'name')
    .lean();
  const docById = new Map(topDocs.map((d) => [String(d._id), d]));
  const topRecipes = likeRows.flatMap((row) => {
    const doc = docById.get(String(row._id));
    return doc
      ? [{ _id: doc._id, title: doc.title, authorName: doc.author?.name ?? 'Không rõ', likesCount: row.likesCount }]
      : [];
  });

  // Số công thức theo từng danh mục (kể cả danh mục chưa có bài nào)
  const grouped = await Recipe.aggregate<{ _id: Types.ObjectId | null; count: number }>([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countOf = new Map(grouped.map((g) => [String(g._id), g.count]));
  const cats = (await Category.find().lean()).sort((a, b) => compareVi(a.name, b.name));
  const byCategory: { _id: Types.ObjectId | null; name: string; count: number }[] = cats.map(
    (c) => ({ _id: c._id, name: c.name, count: countOf.get(String(c._id)) ?? 0 })
  );
  const uncategorized = countOf.get('null') ?? 0;
  if (uncategorized > 0) byCategory.push({ _id: null, name: 'Chưa phân loại', count: uncategorized });

  res.json({ totals: { users, admins, recipes, comments, categories }, topRecipes, byCategory });
};
