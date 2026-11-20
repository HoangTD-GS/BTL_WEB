import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = Router();

const createAuthResponse = (user: {
  _id: { toString(): string };
  name: string;
  email: string;
  role: 'user' | 'admin';
}) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Thiếu cấu hình JWT_SECRET');

  return {
    token: jwt.sign({ id: user._id.toString() }, secret, { expiresIn: '30d' }),
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
    };
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      password.length < 6
    ) {
      return res.status(400).json({ message: 'Thông tin đăng ký không hợp lệ' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: 'Email này đã được sử dụng' });
    }

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password });
    res.status(201).json(createAuthResponse(user));
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: unknown; password?: unknown };
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    res.json(createAuthResponse(user));
  } catch (error) {
    next(error);
  }
});

router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

export default router;
