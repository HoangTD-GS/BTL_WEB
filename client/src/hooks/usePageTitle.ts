import { useEffect } from 'react';

const SUFFIX = 'CookBook';

/** Đặt tiêu đề tab trình duyệt theo từng trang. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : `${SUFFIX} - Chia sẻ công thức nấu ăn`;
  }, [title]);
}
