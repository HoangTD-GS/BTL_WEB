import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Chuyển trang thì cuộn về đầu trang (đổi bộ lọc trên cùng một trang thì không). */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
