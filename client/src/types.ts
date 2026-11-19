export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  _id: string;
  name: string;
}

export interface PersonRef {
  _id: string;
  name: string;
  email?: string;
}

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  image: string;
  cookTime: number;
  servings: number;
  author: PersonRef | string | null;
  category: Category | string | null;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RecipeInput {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  image?: string;
  cookTime?: number;
  servings?: number;
  category?: string;
}

export interface Comment {
  _id: string;
  content: string;
  user: PersonRef | string | null;
  recipe: string;
  createdAt: string;
}

export interface RecipeDetails {
  recipe: Recipe;
  comments: Comment[];
}
