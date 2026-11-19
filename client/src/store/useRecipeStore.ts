import { create } from 'zustand';

interface RecipeStore {
  search: string;
  category: string;
  page: number;
  savedIds: string[];
  setSearch: (search: string) => void;
  setCategory: (category: string) => void;
  setPage: (page: number) => void;
  setSavedIds: (savedIds: string[]) => void;
  toggleSaved: (id: string) => void;
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  search: '',
  category: '',
  page: 1,
  savedIds: [],
  setSearch: (search) => set({ search, page: 1 }),
  setCategory: (category) => set({ category, page: 1 }),
  setPage: (page) => set({ page }),
  setSavedIds: (savedIds) => set({ savedIds }),
  toggleSaved: (id) =>
    set((s) => ({
      savedIds: s.savedIds.includes(id)
        ? s.savedIds.filter((x) => x !== id)
        : [...s.savedIds, id],
    })),
}));
