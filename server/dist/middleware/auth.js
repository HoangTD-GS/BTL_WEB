import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export const protect = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    try {
        const token = header.slice('Bearer '.length);
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('Thiếu cấu hình JWT_SECRET');
        }
        const decoded = jwt.verify(token, secret);
        if (typeof decoded === 'string' || typeof decoded.id !== 'string') {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user)
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        next();
    }
    catch {
        res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};
export const adminOnly = (req, res, next) => {
    if (req.user?.role === 'admin')
        return next();
    res.status(403).json({ message: 'Không có quyền truy cập' });
};
