import type { RequestHandler } from 'express';
import type { Types } from 'mongoose';
import Comment from '../models/Comment.js';
import { fail, requireObjectId } from '../utils/http.js';
import { buildPage, escapeRegex, parsePagination, queryString } from '../utils/query.js';

// GET /api/admin/comments?search=&page=&limit=
export const listComments: RequestHandler = async (req, res) => {
  const paging = parsePagination(req.query);
  const search = queryString(req.query.search);

  const filter: Record<string, unknown> = {};
  if (search) filter.content = new RegExp(escapeRegex(search), 'i');

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(paging.skip)
      .limit(paging.limit)
      .populate<{ user: { _id: Types.ObjectId; name: string; email: string } | null }>(
        'user',
        'name email'
      )
      .populate<{ recipe: { _id: Types.ObjectId; title: string } | null }>('recipe', 'title')
      .lean(),
    Comment.countDocuments(filter),
  ]);

  res.json(buildPage(comments, total, paging));
};

// DELETE /api/admin/comments/:id
export const deleteComment: RequestHandler<{ id: string }> = async (req, res) => {
  const id = requireObjectId(res, req.params.id, 'ID bình luận');

  const comment = await Comment.findById(id);
  if (!comment) fail(res, 404, 'Không tìm thấy bình luận');

  await comment.deleteOne();
  res.json({ message: 'Đã xóa bình luận', _id: comment._id });
};
