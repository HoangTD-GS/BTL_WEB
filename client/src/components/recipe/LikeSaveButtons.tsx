import { useLike, useSave } from '../../hooks/useRecipeActions';
import Icon from '../ui/Icon';

export function LikeButton({ recipeId, likes }: { recipeId: string; likes: string[] }) {
  const { liked, count, busy, toggle } = useLike(recipeId, likes);
  return (
    <button
      type="button"
      className={`icon-btn like ${liked ? 'is-on' : ''}`}
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      aria-label={liked ? `Bỏ thích (${count} lượt thích)` : `Thích (${count} lượt thích)`}
    >
      <Icon name="heart" size={16} />
      <span>{count}</span>
    </button>
  );
}

interface SaveButtonProps {
  recipeId: string;
  /** true: có chữ "Lưu"/"Đã lưu" (dùng ở trang chi tiết); false: chỉ biểu tượng (dùng ở thẻ) */
  withLabel?: boolean;
  onChange?: (saved: boolean) => void;
}

export function SaveButton({ recipeId, withLabel = false, onChange }: SaveButtonProps) {
  const { saved, busy, toggle } = useSave(recipeId, onChange);
  return (
    <button
      type="button"
      className={`icon-btn save ${saved ? 'is-on' : ''} ${withLabel ? '' : 'icon-only'}`}
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? 'Bỏ lưu công thức' : 'Lưu công thức'}
      title={saved ? 'Bỏ lưu' : 'Lưu công thức'}
    >
      <Icon name="bookmark" size={16} />
      {withLabel && <span>{saved ? 'Đã lưu' : 'Lưu'}</span>}
    </button>
  );
}
