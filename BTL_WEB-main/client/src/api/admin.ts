import api from './axios';
import type { Category, User } from '../types';

export type Role = User['role'];

export interface Paged<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PageQuery {
  page?: number;
  limit?: number;
  search?: string;
}

interface PersonRef {
  _id: string;
  name: string;
  email: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  recipeCount: number;
  commentCount: number;
}

export interface AdminRecipe {
  _id: string;
  title: string;
  image: string;
  author: PersonRef | null;
  category: Category | null;
  likesCount: number;
  commentCount: number;
  createdAt: string;
}

export interface AdminComment {
  _id: string;
  content: string;
  user: PersonRef | null;
  recipe: { _id: string; title: string } | null;
  createdAt: string;
}

export interface AdminStats {
  totals: { users: number; admins: number; recipes: number; comments: number; categories: number };
  topRecipes: { _id: string; title: string; authorName: string; likesCount: number }[];
  byCategory: { _id: string | null; name: string; count: number }[];
}

// ---- Thống kê ----
export const getStats = () => api.get<AdminStats>('/admin/stats').then((r) => r.data);

// ---- Người dùng ----
export const listUsers = (q: PageQuery & { role?: Role }) =>
  api.get<Paged<AdminUser>>('/admin/users', { params: q }).then((r) => r.data);

export const updateUserRole = (id: string, role: Role) =>
  api.patch<{ _id: string; role: Role }>(`/admin/users/${id}/role`, { role }).then((r) => r.data);

export const deleteUser = (id: string) =>
  api
    .delete<{ message: string; deleted: { recipes: number; comments: number } }>(`/admin/users/${id}`)
    .then((r) => r.data);

// ---- Công thức ----
export const listRecipes = (q: PageQuery & { category?: string }) =>
  api.get<Paged<AdminRecipe>>('/admin/recipes', { params: q }).then((r) => r.data);

export const deleteRecipe = (id: string) =>
  api
    .delete<{ message: string; deleted: { comments: number } }>(`/admin/recipes/${id}`)
    .then((r) => r.data);

// ---- Bình luận ----
export const listComments = (q: PageQuery) =>
  api.get<Paged<AdminComment>>('/admin/comments', { params: q }).then((r) => r.data);

export const deleteComment = (id: string) =>
  api.delete<{ message: string }>(`/admin/comments/${id}`).then((r) => r.data);

// ---- Danh mục (xem: công khai; thêm/sửa/xóa: chỉ admin) ----
export const listCategories = () => api.get<Category[]>('/categories').then((r) => r.data);

export const createCategory = (name: string) =>
  api.post<Category>('/categories', { name }).then((r) => r.data);

export const updateCategory = (id: string, name: string) =>
  api.put<Category>(`/categories/${id}`, { name }).then((r) => r.data);

export const deleteCategory = (id: string) =>
  api.delete<{ message: string }>(`/categories/${id}`).then((r) => r.data);
