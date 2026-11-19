import type { Request } from 'express';

type Query = Request['query'];

/** Lấy một tham số query dạng chuỗi (bỏ qua mảng/object), đã trim. */
export function queryString(value: Query[string]): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Thoát ký tự đặc biệt để dùng chuỗi người dùng nhập trong RegExp. */
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface PageParams {
  page: number;
  limit: number;
  skip: number;
}

/** Đọc ?page= và ?limit= (mặc định trang 1, 10 dòng, tối đa 50). */
export function parsePagination(query: Query, defaultLimit = 10, maxLimit = 50): PageParams {
  const page = Math.max(1, Math.floor(Number(query.page)) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Math.floor(Number(query.limit)) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export interface Paged<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function buildPage<T>(items: T[], total: number, { page, limit }: PageParams): Paged<T> {
  return { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/** So sánh chuỗi theo thứ tự chữ cái tiếng Việt (Ă, Đ... đứng đúng chỗ). */
export const compareVi = (a: string, b: string): number => a.localeCompare(b, 'vi');
