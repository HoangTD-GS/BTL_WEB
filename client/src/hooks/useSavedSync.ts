import { useEffect } from 'react';
import { listSavedIds } from '../api/recipes';
import { useAuth } from '../context/useAuth';
import { useRecipeStore } from '../store/useRecipeStore';

/** Tải danh sách công thức đã lưu mỗi khi đăng nhập, xóa sạch khi đăng xuất. */
export function useSavedSync() {
  const { user } = useAuth();
  const userId = user?._id;
  const setSavedIds = useRecipeStore((s) => s.setSavedIds);
  const reset = useRecipeStore((s) => s.reset);

  useEffect(() => {
    reset();
    if (!userId) return;
    let active = true;
    listSavedIds()
      .then((ids) => {
        if (active) setSavedIds(ids);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [userId, setSavedIds, reset]);
}
