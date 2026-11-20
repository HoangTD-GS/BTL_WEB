import type { Category, PersonRef, Recipe } from '../types';

type Ref<T> = T | string | null;

const asObject = <T extends object>(value: Ref<T>): T | null =>
  value && typeof value === 'object' ? value : null;

export const recipeAuthor = (r: Pick<Recipe, 'author'>): PersonRef | null => asObject<PersonRef>(r.author);
export const recipeCategory = (r: Pick<Recipe, 'category'>): Category | null => asObject<Category>(r.category);
export const authorName = (r: Pick<Recipe, 'author'>) => recipeAuthor(r)?.name ?? 'Không rõ';
export const categoryName = (r: Pick<Recipe, 'category'>) => recipeCategory(r)?.name ?? 'Chưa phân loại';

export function isOwner(r: Pick<Recipe, 'author'>, userId?: string): boolean {
  if (!userId) return false;
  const a = r.author;
  return (typeof a === 'string' ? a : a?._id) === userId;
}
