import type { RequestHandler } from 'express';
import Comment from '../models/Comment.js';
import Recipe from '../models/Recipe.js';
import { fail, requireObjectId, requireUser } from '../utils/http.js';

const MAX_LENGTH = 1000;

// POST /api/comments/:recipeId
export const addComment: RequestHandler<{ recipeId: string }> = async (req, res) => {
  const user = requireUser(req, res);
  const recipeId = requireObjectId(res, req.params.recipeId, 'ID công thức');

  const content = ((req.body ?? {}) as { content?: unknown }).content;
  if (typeof content !== 'string' || !content.trim()) {
    fail(res, 400, 'Nội dung bình luận không được để trống');
  }
  if (content.trim().length > MAX_LENGTH) {
    fail(res, 400, `Bình luận tối đa ${MAX_LENGTH} ký tự`);
  }

  const recipe = await Recipe.findById(recipeId).select('_id');
  if (!recipe) fail(res, 404, 'Không tìm thấy công thức');

  const comment = await Comment.create({ recipe: recipe._id, user: user._id, content: content.trim() });
  await comment.populate('user', 'name');
  res.status(201).json(comment);
};

// DELETE /api/comments/:commentId   (chủ bình luận hoặc admin)
export const deleteComment: RequestHandler<{ commentId: string }> = async (req, res) => {
  const user = requireUser(req, res);
  const commentId = requireObjectId(res, req.params.commentId, 'ID bình luận');

  const comment = await Comment.findById(commentId);
  if (!comment) fail(res, 404, 'Không tìm thấy bình luận');
  if (String(comment.user) !== String(user._id) && user.role !== 'admin') {
    fail(res, 403, 'Bạn không có quyền xóa bình luận này');
  }

  await comment.deleteOne();
  res.json({ message: 'Đã xóa bình luận' });
};
