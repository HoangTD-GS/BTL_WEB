import type { ErrorRequestHandler, RequestHandler } from 'express';

export const notFound: RequestHandler = (req, res, next) => {
  res.status(404);
  next(new Error(`Không tìm thấy: ${req.originalUrl}`));
};

type MongoishError = Error & {
  status?: number;
  type?: string;
  code?: number;
  errors?: Record<string, { message: string }>;
};

export const errorHandler: ErrorRequestHandler = (err: MongoishError, _req, res, _next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message;

  if (err.type === 'entity.parse.failed') {
    // Body JSON gửi lên bị sai cú pháp
    status = 400;
    message = 'Dữ liệu gửi lên không phải JSON hợp lệ';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Dữ liệu gửi lên quá lớn';
  } else if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join('; ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Giá trị không hợp lệ';
  } else if (err.code === 11000) {
    status = 409;
    message = 'Dữ liệu đã tồn tại';
  }

  res.status(status).json({
    message,
    stack: process.env.NODE_ENV === 'production' || status < 500 ? undefined : err.stack,
  });
};
