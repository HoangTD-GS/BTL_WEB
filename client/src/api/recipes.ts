import api from './axios';
import type { Paged } from './admin';
import type { Comment, Recipe, RecipeDetails, RecipeInput, RecipeListItem, SortKey } from '../types';

export interface RecipeQuery {
  q?: string;
  category?: string;
  maxTime?: number;
  sort?: SortKey;
  page?: number;
  limit?: number;
}

export const listRecipes = (params: RecipeQuery = {}) =>
  api.get<Paged<RecipeListItem>>('/recipes', { params }).then((r) => r.data);

export const listMyRecipes = () =>
  api.get<RecipeListItem[]>('/recipes/my-recipes').then((r) => r.data);

export const listSavedRecipes = () =>
  api.get<RecipeListItem[]>('/recipes/saved').then((r) => r.data);

export const listSavedIds = () => api.get<string[]>('/recipes/saved/ids').then((r) => r.data);

export const getRecipe = (id: string) =>
  api.get<RecipeDetails>(`/recipes/${id}`).then((r) => r.data);

export const createRecipe = (input: RecipeInput) =>
  api.post<Recipe>('/recipes', input).then((r) => r.data);

export const updateRecipe = (id: string, input: RecipeInput) =>
  api.put<Recipe>(`/recipes/${id}`, input).then((r) => r.data);

export const deleteRecipe = (id: string) =>
  api.delete<{ message: string }>(`/recipes/${id}`).then((r) => r.data);

export const toggleLike = (id: string) =>
  api.put<{ liked: boolean; likesCount: number }>(`/recipes/${id}/like`).then((r) => r.data);

export const toggleSave = (id: string) =>
  api.put<{ saved: boolean }>(`/recipes/${id}/save`).then((r) => r.data);

export const addComment = (recipeId: string, content: string) =>
  api.post<Comment>(`/comments/${recipeId}`, { content }).then((r) => r.data);

export const deleteComment = (commentId: string) =>
  api.delete<{ message: string }>(`/comments/${commentId}`).then((r) => r.data);
