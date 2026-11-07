import { create } from 'zustand';

// Store cho bộ lọc tìm kiếm và danh sách công thức đã lưu
export const useRecipeStore = create((set) => ({
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
