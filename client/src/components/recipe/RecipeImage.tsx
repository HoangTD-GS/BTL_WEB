import { useState } from 'react';
import Icon from '../ui/Icon';

interface RecipeImageProps {
  src?: string;
  title: string;
  /** Dùng để chọn màu nền khi chưa có ảnh (cùng một món luôn cùng một màu) */
  seed?: string;
  iconSize?: number;
  decorative?: boolean;
}

function hash(text: string): number {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** Ảnh món ăn; chưa có ảnh hoặc ảnh lỗi thì hiện khung màu kèm biểu tượng. */
export default function RecipeImage({ src, title, seed = title, iconSize = 40, decorative = false }: RecipeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;
  return (
    <div className="recipe-media">
      {showImage ? (
        <img
          src={src}
          alt={decorative ? '' : title}
          loading="lazy"
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : (
        <div className={`recipe-placeholder ph-${hash(seed) % 6}`} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : title}>
          <Icon name="utensils" size={iconSize} />
        </div>
      )}
    </div>
  );
}
