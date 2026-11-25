import mongoose from 'mongoose';
import type { Request, Response } from 'express';

/**
 * Đặt mã trạng thái rồi ném lỗi. `errorHandler` (middleware/error.ts) sẽ trả
 * JSON `{ message }` với đúng mã đó. Express 5 tự chuyển lỗi của hàm async
 * sang errorHandler nên controller không cần try/catch.
 */
export function fail(res: Response, status: number, message: string): never {
  res.status(status);
  throw new Error(message);
}

/** Kiểm tra chuỗi có phải ObjectId hợp lệ không, sai thì trả 400. */
export function requireObjectId(res: Response, value: unknown, label = 'ID'): string {
  if (typeof value !== 'string' || !mongoose.isValidObjectId(value)) {
    fail(res, 400, `${label} không hợp lệ`);
  }
  return value;
}

/** Lấy người dùng đã đăng nhập (do middleware protect gắn vào), chưa đăng nhập thì trả 401. */
export function requireUser(req: Request, res: Response) {
  if (!req.user) fail(res, 401, 'Chưa đăng nhập');
  return req.user;
}
