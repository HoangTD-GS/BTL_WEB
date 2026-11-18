import { Router, Response } from 'express';
import Comment from '../models/Comment.js';
import Recipe from '../models/Recipe.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Thêm bình luận vào một bài viết
router.post('/:recipeId', protect, async (req: any, res: Response) => {
  try {
    const { recipeId } = req.params;
    const { content } = req.body;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: 'Không tìm thấy công thức' });

    const newComment = new Comment({
      recipe: recipeId,
      user: req.user?._id,
      content
    });

    await newComment.save();
    const populatedComment = await newComment.populate('user', 'username');
    
    res.status(201).json(populatedComment);
  } catch (error: any) {
    res.status(400).json({ message: 'Lỗi thêm bình luận', error: error.message });
  }
});

// Xóa bình luận
router.delete('/:commentId', protect, async (req: any, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Không tìm thấy bình luận' });

    if (comment.user.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa bình luận này' });
    }

    await comment.deleteOne();
    res.json({ message: 'Đã xóa bình luận thành công' });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;