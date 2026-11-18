import { Router, Request, Response } from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js';

const router = Router();

// Hàm hỗ trợ tạo JWT token (thẻ ra vào)
const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Thiếu cấu hình JWT_SECRET');
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

// 1. Đăng ký tài khoản mới: POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email này đã được sử dụng' });
    }

    // Tạo user mới (Mật khẩu sẽ tự động được băm nhờ pre-save hook trong Model User.ts)
    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString()), // Cấp token ngay khi đăng ký
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server khi đăng ký', error: error.message });
  }
});

// 2. Đăng nhập: POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user: any = await User.findOne({ email });

    // Kiểm tra user và so sánh mật khẩu bằng phương thức matchPassword trong Model User.ts
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString()), // Cấp token mới khi đăng nhập thành công
      });
    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server khi đăng nhập', error: error.message });
  }
});

// 3. Lấy thông tin user hiện tại (cần đăng nhập): GET /api/auth/me
router.get('/me', protect, async (req: any, res: Response) => {
  try {
    res.json(req.user);
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;