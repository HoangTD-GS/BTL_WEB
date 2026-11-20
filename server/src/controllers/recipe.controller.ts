import type { RequestHandler } from 'express';
import type { Types } from 'mongoose';
import Comment from '../models/Comment.js';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import { fail, requireObjectId, requireUser } from '../utils/http.js';
import { parseRecipeInput } from '../utils/recipeInput.js';
import { buildPage, escapeRegex, parsePagination, queryString } from '../utils/query.js';

// Công khai: chỉ lộ tên tác giả, không lộ email
type Populated = {
  author: { _id: Types.ObjectId; name: string } | null;
  category: { _id: Types.ObjectId; name: string } | null;
};

/** Gắn số bình luận cho từng công thức (cho thẻ công thức ở danh sách). */
async function withCommentCounts<T extends { _id: Types.ObjectId }>(recipes: T[]) {
  const rows = await Comment.aggregate<{ _id: Types.ObjectId; n: number }>([
    { $match: { recipe: { $in: recipes.map((r) => r._id) } } },
    { $group: { _id: '$recipe', n: { $sum: 1 } } },
  ]);
  const counts = new Map(rows.map((r) => [String(r._id), r.n]));
  return recipes.map((r) => ({ ...r, commentCount: counts.get(String(r._id)) ?? 0 }));
}

const SORTS = ['newest', 'oldest', 'popular'] as const;
type Sort = (typeof SORTS)[number];

// GET /api/recipes?q=&category=<id|none>&maxTime=&sort=newest|oldest|popular&page=&limit=
export const getAllRecipes: RequestHandler = async (req, res) => {
  const paging = parsePagination(req.query, 12, 48);
  const q = queryString(req.query.q) || queryString(req.query.search);
  const category = queryString(req.query.category);
  const maxTime = Number(queryString(req.query.maxTime));
  const sortParam = queryString(req.query.sort);
  const sort: Sort = (SORTS as readonly string[]).includes(sortParam) ? (sortParam as Sort) : 'newest';

  const filter: Record<string, unknown> = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { description: rx }, { ingredients: rx }];
  }
  if (category === 'none') filter.category = null;
  else if (category) filter.category = requireObjectId(res, category, 'ID danh mục');
  if (Number.isFinite(maxTime) && maxTime > 0) filter.cookTime = { $gt: 0, $lte: maxTime };

  let total: number;
  let docs;
  if (sort === 'popular') {
    // Xếp theo lượt thích: đếm trong JS để chạy được trên mọi CSDL (dữ liệu bài tập lớn nhỏ).
    const rows = await Recipe.find(filter).select('likes createdAt').lean();
    rows.sort(
      (a, b) =>
        (b.likes?.length ?? 0) - (a.likes?.length ?? 0) ||
        b.createdAt.getTime() - a.createdAt.getTime()
    );
    total = rows.length;
    const ids = rows.slice(paging.skip, paging.skip + paging.limit).map((r) => r._id);
    const found = await Recipe.find({ _id: { $in: ids } })
      .populate('author', 'name')
      .populate('category', 'name')
      .lean();
    const byId = new Map((found as unknown as { _id: Types.ObjectId }[]).map((d) => [String(d._id), d]));
    docs = ids.map((id) => byId.get(String(id))).filter((d): d is NonNullable<typeof d> => Boolean(d));
  } else {
    total = await Recipe.countDocuments(filter);
    docs = await Recipe.find(filter)
      .sort({ createdAt: sort === 'oldest' ? 1 : -1, _id: sort === 'oldest' ? 1 : -1 })
      .skip(paging.skip)
      .limit(paging.limit)
      .populate('author', 'name')
      .populate('category', 'name')
      .lean();
  }

  const items = await withCommentCounts(docs as unknown as { _id: Types.ObjectId }[]);
  res.json(buildPage(items, total, paging));
};

// GET /api/recipes/my-recipes
export const getMyRecipes: RequestHandler = async (req, res) => {
  const user = requireUser(req, res);
  const docs = await Recipe.find({ author: user._id })
    .sort({ createdAt: -1, _id: -1 })
    .populate('author', 'name')
    .populate('category', 'name')
    .lean();
  res.json(await withCommentCounts(docs as unknown as { _id: Types.ObjectId }[]));
};

// GET /api/recipes/saved   (mới lưu xếp trước)
export const getSavedRecipes: RequestHandler = async (req, res) => {
  const user = requireUser(req, res);
  const me = await User.findById(user._id).select('savedRecipes').lean();
  const savedIds = (me?.savedRecipes ?? []).map(String).reverse();
  const docs = await Recipe.find({ _id: { $in: savedIds } })
    .populate('author', 'name')
    .populate('category', 'name')
    .lean();
  const order = new Map(savedIds.map((id, index) => [id, index]));
  const sorted = (docs as unknown as { _id: Types.ObjectId }[]).sort(
    (a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0)
  );
  res.json(await withCommentCounts(sorted));
};

// GET /api/recipes/saved/ids   (để đánh dấu nút "Lưu" trên mọi thẻ công thức)
export const getSavedIds: RequestHandler = async (req, res) => {
  const user = requireUser(req, res);
  const me = await User.findById(user._id).select('savedRecipes').lean();
  res.json((me?.savedRecipes ?? []).map(String));
};

// GET /api/recipes/:id
export const getRecipeById: RequestHandler<{ id: string }> = async (req, res) => {
  const id = requireObjectId(res, req.params.id, 'ID công thức');
  const recipe = await Recipe.findById(id)
    .populate<Populated>('author', 'name')
    .populate<Populated>('category', 'name')
    .lean();
  if (!recipe) fail(res, 404, 'Không tìm thấy công thức');

  const comments = await Comment.find({ recipe: id })
    .populate('user', 'name')
    .sort({ createdAt: -1, _id: -1 })
    .lean();

  // Gợi ý thêm: cùng danh mục (nếu có), bài khác
  const relatedFilter: Record<string, unknown> = { _id: { $ne: id } };
  if (recipe.category) relatedFilter.category = recipe.category._id;
  const related = await Recipe.find(relatedFilter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(3)
    .populate('author', 'name')
    .populate('category', 'name')
    .lean();

  res.json({
    recipe,
    comments,
    related: await withCommentCounts(related as unknown as { _id: Types.ObjectId }[]),
  });
};

// POST /api/recipes
export const createRecipe: RequestHandler = async (req, res) => {
  const user = requireUser(req, res);
  const input = await parseRecipeInput(res, req.body);
  const recipe = await Recipe.create({ ...input, author: user._id });
  res.status(201).json(recipe);
};

// PUT /api/recipes/:id   (chỉ tác giả)
export const updateRecipe: RequestHandler<{ id: string }> = async (req, res) => {
  const user = requireUser(req, res);
  const id = requireObjectId(res, req.params.id, 'ID công thức');
  const recipe = await Recipe.findById(id);
  if (!recipe) fail(res, 404, 'Không tìm thấy công thức');
  if (String(recipe.author) !== String(user._id)) {
    fail(res, 403, 'Bạn không có quyền sửa công thức này');
  }

  const input = await parseRecipeInput(res, req.body, true);
  recipe.set(input);
  await recipe.save();
  res.json(recipe);
};

// DELETE /api/recipes/:id   (chỉ tác giả; admin xóa bài vi phạm ở /api/admin/recipes/:id)
export const deleteRecipe: RequestHandler<{ id: string }> = async (req, res) => {
  const user = requireUser(req, res);
  const id = requireObjectId(res, req.params.id, 'ID công thức');
  const recipe = await Recipe.findById(id);
  if (!recipe) fail(res, 404, 'Không tìm thấy công thức');
  if (String(recipe.author) !== String(user._id)) {
    fail(res, 403, 'Bạn không có quyền xóa công thức này');
  }

  await Comment.deleteMany({ recipe: recipe._id });
  await User.updateMany({ savedRecipes: recipe._id }, { $pull: { savedRecipes: recipe._id } });
  await recipe.deleteOne();
  res.json({ message: 'Đã xóa công thức' });
};

// PUT /api/recipes/:id/like   (bật/tắt thích)
export const toggleLikeRecipe: RequestHandler<{ id: string }> = async (req, res) => {
  const user = requireUser(req, res);
  const id = requireObjectId(res, req.params.id, 'ID công thức');

  const already = await Recipe.exists({ _id: id, likes: user._id });
  if (!already && !(await Recipe.exists({ _id: id }))) fail(res, 404, 'Không tìm thấy công thức');

  await Recipe.updateOne(
    { _id: id },
    already ? { $pull: { likes: user._id } } : { $addToSet: { likes: user._id } }
  );
  const fresh = await Recipe.findById(id).select('likes').lean();
  res.json({ liked: !already, likesCount: fresh?.likes?.length ?? 0 });
};

// PUT /api/recipes/:id/save   (bật/tắt lưu vào bộ sưu tập)
export const toggleSaveRecipe: RequestHandler<{ id: string }> = async (req, res) => {
  const user = requireUser(req, res);
  const id = requireObjectId(res, req.params.id, 'ID công thức');

  const already = await User.exists({ _id: user._id, savedRecipes: id });
  if (!already && !(await Recipe.exists({ _id: id }))) fail(res, 404, 'Không tìm thấy công thức');

  await User.updateOne(
    { _id: user._id },
    already ? { $pull: { savedRecipes: id } } : { $addToSet: { savedRecipes: id } }
  );
  res.json({ saved: !already });
};
