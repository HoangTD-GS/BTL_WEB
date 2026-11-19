import api from './axios';
import type { Comment, Recipe, RecipeDetails, RecipeInput } from '../types';

export const listRecipes = () => api.get<Recipe[]>('/recipes').then((r) => r.data);

export const listMyRecipes = () => api.get<Recipe[]>('/recipes/my-recipes').then((r) => r.data);

export const getRecipe = (id: string) =>
  api.get<RecipeDetails>(`/recipes/${id}`).then((r) => r.data);

export const createRecipe = (input: RecipeInput) =>
  api.post<Recipe>('/recipes', input).then((r) => r.data);

export const updateRecipe = (id: string, input: RecipeInput) =>
  api.put<Recipe>(`/recipes/${id}`, input).then((r) => r.data);

export const deleteRecipe = (id: string) =>
  api.delete<{ message: string }>(`/recipes/${id}`).then((r) => r.data);

export const addComment = (recipeId: string, content: string) =>
  api.post<Comment>(`/comments/${recipeId}`, { content }).then((r) => r.data);
