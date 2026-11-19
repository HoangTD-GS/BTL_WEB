import type { RequestHandler } from 'express';
import Comment from '../models/Comment.js';
import Recipe from '../models/Recipe.js';

export const addComment: RequestHandler<{ recipeId: string }> = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
  const { recipeId } = req.params;
  const content = (req.body as { content?: unknown }).content;
  if (typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ message: 'Nội dung bình luận không được để trống' });
  }

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) return res.status(404).json({ message: 'Không tìm thấy công thức' });

  const comment = await Comment.create({
    recipe: recipe._id,
    user: req.user._id,
    content: content.trim(),
  });
  await comment.populate('user', 'name');
  res.status(201).json(comment);
};

export const deleteComment: RequestHandler<{ commentId: string }> = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ message: 'Không tìm thấy bình luận' });
  if (String(comment.user) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Bạn không có quyền xóa bình luận này' });
  }

  await comment.deleteOne();
  res.json({ message: 'Đã xóa bình luận' });
};
