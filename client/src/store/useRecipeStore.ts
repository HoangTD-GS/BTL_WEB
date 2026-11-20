import { create } from 'zustand';

interface RecipeStore {
  /** Id các công thức người dùng đang đăng nhập đã lưu (để đánh dấu nút "Lưu" ở mọi nơi) */
  savedIds: string[];
  /**
   * Những thay đổi người dùng vừa thao tác. Danh sách từ server có thể về chậm hơn
   * một cú bấm "Lưu", nên khi áp danh sách đó phải giữ lại các thay đổi này.
   */
  pending: Record<string, boolean>;
  /** Áp danh sách lấy từ server */
  setSavedIds: (savedIds: string[]) => void;
  setSaved: (id: string, saved: boolean) => void;
  /** Xóa sạch khi đổi/đăng xuất tài khoản */
  reset: () => void;
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  savedIds: [],
  pending: {},
  setSavedIds: (savedIds) =>
    set((s) => {
      const merged = new Set(savedIds);
      for (const [id, saved] of Object.entries(s.pending)) {
        if (saved) merged.add(id);
        else merged.delete(id);
      }
      return { savedIds: [...merged] };
    }),
  setSaved: (id, saved) =>
    set((s) => {
      const has = s.savedIds.includes(id);
      const savedIds = saved ? (has ? s.savedIds : [...s.savedIds, id]) : s.savedIds.filter((x) => x !== id);
      return { savedIds, pending: { ...s.pending, [id]: saved } };
    }),
  reset: () => set({ savedIds: [], pending: {} }),
}));
