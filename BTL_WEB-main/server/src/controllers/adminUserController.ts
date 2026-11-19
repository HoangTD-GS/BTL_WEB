import type { RequestHandler } from 'express';
import type { Types } from 'mongoose';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import Comment from '../models/Comment.js';
import { fail, requireObjectId } from '../utils/http.js';
import { buildPage, escapeRegex, parsePagination, queryString } from '../utils/query.js';

type CountRow = { _id: Types.ObjectId; n: number };
const toMap = (rows: CountRow[]) => new Map(rows.map((r) => [String(r._id), r.n]));

// GET /api/admin/users?search=&role=&page=&limit=
export const listUsers: RequestHandler = async (req, res) => {
  const paging = parsePagination(req.query);
  const search = queryString(req.query.search);
  const role = queryString(req.query.role);

  const filter: Record<string, unknown> = {};
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  if (role === 'user' || role === 'admin') filter.role = role;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1, _id: -1 })
      .skip(paging.skip)
      .limit(paging.limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  // Mỗi người đã đăng bao nhiêu công thức / bình luận
  const ids = users.map((u) => u._id);
  const [recipeRows, commentRows] = await Promise.all([
    Recipe.aggregate<CountRow>([
      { $match: { author: { $in: ids } } },
      { $group: { _id: '$author', n: { $sum: 1 } } },
    ]),
    Comment.aggregate<CountRow>([
      { $match: { user: { $in: ids } } },
      { $group: { _id: '$user', n: { $sum: 1 } } },
    ]),
  ]);
  const recipeCount = toMap(recipeRows);
  const commentCount = toMap(commentRows);

  const items = users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    recipeCount: recipeCount.get(String(u._id)) ?? 0,
    commentCount: commentCount.get(String(u._id)) ?? 0,
  }));

  res.json(buildPage(items, total, paging));
};

// PATCH /api/admin/users/:id/role   body: { role: 'user' | 'admin' }
export const updateUserRole: RequestHandler<{ id: string }> = async (req, res) => {
  const id = requireObjectId(res, req.params.id, 'ID người dùng');
  const role = ((req.body ?? {}) as { role?: unknown }).role;
  if (role !== 'user' && role !== 'admin') fail(res, 400, 'Vai trò không hợp lệ');
  if (String(req.user?._id) === id) fail(res, 400, 'Bạn không thể đổi vai trò của chính mình');

  const user = await User.findById(id).select('-password');
  if (!user) fail(res, 404, 'Không tìm thấy người dùng');

  user.role = role;
  await user.save();

  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
};

// DELETE /api/admin/users/:id
// Xóa kèm toàn bộ dữ liệu của người đó: công thức (và bình luận trên các công thức ấy),
// bình luận của họ ở nơi khác, lượt thích và lượt lưu liên quan.
export const deleteUser: RequestHandler<{ id: string }> = async (req, res) => {
  const id = requireObjectId(res, req.params.id, 'ID người dùng');
  if (String(req.user?._id) === id) fail(res, 400, 'Bạn không thể xóa chính mình');

  const user = await User.findById(id);
  if (!user) fail(res, 404, 'Không tìm thấy người dùng');
  if (user.role === 'admin') {
    fail(res, 409, 'Không thể xóa quản trị viên. Hãy hạ quyền xuống người dùng trước');
  }

  const recipeIds = (await Recipe.find({ author: user._id }).select('_id').lean()).map((r) => r._id);

  const removedComments = await Comment.deleteMany({
    $or: [{ recipe: { $in: recipeIds } }, { user: user._id }],
  });
  if (recipeIds.length > 0) {
    await User.updateMany(
      { savedRecipes: { $in: recipeIds } },
      { $pullAll: { savedRecipes: recipeIds } }
    );
    await Recipe.deleteMany({ author: user._id });
  }
  await Recipe.updateMany({ likes: user._id }, { $pull: { likes: user._id } });
  await user.deleteOne();

  res.json({
    message: 'Đã xóa người dùng',
    _id: user._id,
    deleted: { recipes: recipeIds.length, comments: removedComments.deletedCount },
  });
};
