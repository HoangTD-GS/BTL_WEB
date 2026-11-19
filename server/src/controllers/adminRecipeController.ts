import type { RequestHandler } from 'express';
import type { Types } from 'mongoose';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import { fail, requireObjectId } from '../utils/http.js';
import { buildPage, escapeRegex, parsePagination, queryString } from '../utils/query.js';

// GET /api/admin/recipes?search=&category=<id|none>&page=&limit=
export const listRecipes: RequestHandler = async (req, res) => {
  const paging = parsePagination(req.query);
  const search = queryString(req.query.search);
  const category = queryString(req.query.category);

  const filter: Record<string, unknown> = {};
  if (search) filter.title = new RegExp(escapeRegex(search), 'i');
  if (category === 'none') {
    filter.category = null;
  } else if (category) {
    filter.category = requireObjectId(res, category, 'ID danh mục');
  }

  const [recipes, total] = await Promise.all([
    Recipe.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(paging.skip)
      .limit(paging.limit)
      .populate<{ author: { _id: Types.ObjectId; name: string; email: string } | null }>(
        'author',
        'name email'
      )
      .populate<{ category: { _id: Types.ObjectId; name: string } | null }>('category', 'name')
      .lean(),
    Recipe.countDocuments(filter),
  ]);

  const ids = recipes.map((r) => r._id);
  const rows = await Comment.aggregate<{ _id: Types.ObjectId; n: number }>([
    { $match: { recipe: { $in: ids } } },
    { $group: { _id: '$recipe', n: { $sum: 1 } } },
  ]);
  const commentCount = new Map(rows.map((r) => [String(r._id), r.n]));

  const items = recipes.map((r) => ({
    _id: r._id,
    title: r.title,
    image: r.image,
    author: r.author,
    category: r.category,
    likesCount: r.likes?.length ?? 0,
    commentCount: commentCount.get(String(r._id)) ?? 0,
    createdAt: r.createdAt,
  }));

  res.json(buildPage(items, total, paging));
};

// DELETE /api/admin/recipes/:id   (xóa bài vi phạm kèm bình luận và lượt lưu)
export const deleteRecipe: RequestHandler<{ id: string }> = async (req, res) => {
  const id = requireObjectId(res, req.params.id, 'ID công thức');

  const recipe = await Recipe.findById(id);
  if (!recipe) fail(res, 404, 'Không tìm thấy công thức');

  const removedComments = await Comment.deleteMany({ recipe: recipe._id });
  await User.updateMany({ savedRecipes: recipe._id }, { $pull: { savedRecipes: recipe._id } });
  await recipe.deleteOne();

  res.json({
    message: 'Đã xóa công thức',
    _id: recipe._id,
    deleted: { comments: removedComments.deletedCount },
  });
};
