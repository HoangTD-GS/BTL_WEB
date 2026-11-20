import { useState } from 'react';
import { toggleLike, toggleSave } from '../api/recipes';
import { useAuth } from '../context/useAuth';
import { useRecipeStore } from '../store/useRecipeStore';
import { toast } from '../store/useToastStore';
import { getErrorMessage } from '../utils/errors';
import { useRequireLogin } from './useRequireLogin';

/** Thích công thức: cập nhật ngay trên giao diện, lỗi thì hoàn lại. */
export function useLike(recipeId: string, likes: string[]) {
  const { user } = useAuth();
  const requireLogin = useRequireLogin();
  const [override, setOverride] = useState<{ liked: boolean; count: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const liked = override?.liked ?? Boolean(user && likes.includes(user._id));
  const count = override?.count ?? likes.length;

  const toggle = async () => {
    if (busy || !requireLogin('Đăng nhập để thích công thức này')) return;
    const previous = { liked, count };
    setOverride({ liked: !liked, count: Math.max(0, count + (liked ? -1 : 1)) });
    setBusy(true);
    try {
      const res = await toggleLike(recipeId);
      setOverride({ liked: res.liked, count: res.likesCount });
    } catch (err) {
      setOverride(previous);
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return { liked, count, busy, toggle };
}

/** Lưu công thức vào bộ sưu tập (trạng thái nằm trong store nên đồng bộ ở mọi trang). */
export function useSave(recipeId: string, onChange?: (saved: boolean) => void) {
  const requireLogin = useRequireLogin();
  const saved = useRecipeStore((s) => s.savedIds.includes(recipeId));
  const setSaved = useRecipeStore((s) => s.setSaved);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy || !requireLogin('Đăng nhập để lưu công thức này')) return;
    setSaved(recipeId, !saved);
    setBusy(true);
    try {
      const res = await toggleSave(recipeId);
      setSaved(recipeId, res.saved);
      toast.success(res.saved ? 'Đã lưu vào bộ sưu tập' : 'Đã bỏ lưu');
      onChange?.(res.saved);
    } catch (err) {
      setSaved(recipeId, saved);
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return { saved, busy, toggle };
}
