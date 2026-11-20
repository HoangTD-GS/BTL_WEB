import mongoose from 'mongoose';
import type { Response } from 'express';
import Category from '../models/Category.js';
import { fail } from './http.js';

export interface CleanRecipeInput {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  image: string;
  cookTime: number;
  servings: number;
  category: string | null;
}

const has = (body: Record<string, unknown>, key: string) => Object.hasOwn(body, key);

function cleanList(res: Response, value: unknown, label: string, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    fail(res, 400, `${label} không hợp lệ`);
  }
  const items = (value as string[]).map((item) => item.trim()).filter(Boolean);
  if (items.length === 0) fail(res, 400, `Vui lòng nhập ít nhất một mục cho ${label.toLowerCase()}`);
  if (items.length > maxItems) fail(res, 400, `${label} tối đa ${maxItems} mục`);
  if (items.some((item) => item.length > maxLen)) {
    fail(res, 400, `Mỗi mục của ${label.toLowerCase()} tối đa ${maxLen} ký tự`);
  }
  return items;
}

function cleanInt(res: Response, value: unknown, label: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    fail(res, 400, `${label} phải là số nguyên từ ${min} đến ${max}`);
  }
  return value;
}

/**
 * Kiểm tra và làm sạch dữ liệu công thức từ client.
 * `partial = true` (khi sửa): chỉ kiểm tra những trường có gửi lên.
 * Sai thì trả 400 kèm thông báo cụ thể.
 */
export async function parseRecipeInput(
  res: Response,
  raw: unknown,
  partial = false
): Promise<Partial<CleanRecipeInput>> {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out: Partial<CleanRecipeInput> = {};

  if (!partial || has(body, 'title')) {
    if (typeof body.title !== 'string' || body.title.trim().length < 3 || body.title.trim().length > 120) {
      fail(res, 400, 'Tên món ăn phải từ 3 đến 120 ký tự');
    }
    out.title = body.title.trim();
  }

  if (has(body, 'description')) {
    if (typeof body.description !== 'string' || body.description.trim().length > 1000) {
      fail(res, 400, 'Mô tả tối đa 1000 ký tự');
    }
    out.description = body.description.trim();
  } else if (!partial) {
    out.description = '';
  }

  if (!partial || has(body, 'ingredients')) out.ingredients = cleanList(res, body.ingredients, 'Nguyên liệu', 50, 200);
  if (!partial || has(body, 'steps')) out.steps = cleanList(res, body.steps, 'Các bước thực hiện', 50, 1000);

  if (has(body, 'image')) {
    const image = typeof body.image === 'string' ? body.image.trim() : null;
    if (image === null || image.length > 500) fail(res, 400, 'Đường dẫn hình ảnh không hợp lệ');
    if (image) {
      let url: URL | null = null;
      try {
        url = new URL(image);
      } catch {
        url = null;
      }
      if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:')) {
        fail(res, 400, 'Đường dẫn hình ảnh phải bắt đầu bằng http:// hoặc https://');
      }
    }
    out.image = image;
  } else if (!partial) {
    out.image = '';
  }

  if (has(body, 'cookTime')) out.cookTime = cleanInt(res, body.cookTime, 'Thời gian nấu (phút)', 0, 1440);
  else if (!partial) out.cookTime = 0;

  if (has(body, 'servings')) out.servings = cleanInt(res, body.servings, 'Khẩu phần', 1, 100);
  else if (!partial) out.servings = 1;

  if (has(body, 'category')) {
    const category = body.category;
    if (category === null || category === '' || category === undefined) {
      out.category = null;
    } else {
      if (typeof category !== 'string' || !mongoose.isValidObjectId(category)) fail(res, 400, 'Danh mục không hợp lệ');
      if (!(await Category.exists({ _id: category }))) fail(res, 400, 'Danh mục không tồn tại');
      out.category = category;
    }
  } else if (!partial) {
    out.category = null;
  }

  return out;
}
