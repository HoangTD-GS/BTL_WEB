import { useEffect, useState } from 'react';
import type { PageQuery, Paged } from '../api/admin';
import { getErrorMessage } from '../utils/errors';
import { useDebounce } from './useDebounce';

/**
 * Quản lý danh sách có tìm kiếm + bộ lọc + phân trang.
 * `fetcher` phải là hàm cố định (khai báo ở module, không tạo lại mỗi lần render).
 */
export function usePaginated<T, F extends object = Record<string, never>>(
  fetcher: (query: PageQuery & F) => Promise<Paged<T>>,
  initialFilters: F,
  limit = 10
) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<F>(initialFilters);
  const [version, setVersion] = useState(0);
  const search = useDebounce(searchInput);

  // `data` giữ kết quả thành công gần nhất (để bảng không nháy trắng khi chuyển trang);
  // `settled` ghi lại yêu cầu nào đã có kết quả (thành công hoặc lỗi).
  const [data, setData] = useState<Paged<T> | null>(null);
  const [settled, setSettled] = useState<{ key: string; error: string } | null>(null);
  const key = JSON.stringify([page, limit, search, filters, version]);

  useEffect(() => {
    let cancelled = false;
    fetcher({ page, limit, search, ...filters })
      .then((res) => {
        if (cancelled) return;
        // Xóa hết dòng cuối của trang thì lùi về trang trước
        if (res.items.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }
        setData(res);
        setSettled({ key, error: '' });
      })
      .catch((err: unknown) => {
        if (!cancelled) setSettled({ key, error: getErrorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [fetcher, page, limit, search, filters, version, key]);

  // Đang tải = kết quả chưa khớp với yêu cầu hiện tại
  const loading = settled?.key !== key;
  const error = settled?.key === key ? settled.error : '';

  return {
    data,
    loading,
    error,
    page,
    setPage,
    searchInput,
    setSearch: (value: string) => {
      setSearchInput(value);
      setPage(1);
    },
    filters,
    updateFilters: (patch: Partial<F>) => {
      setFilters((f) => ({ ...f, ...patch }));
      setPage(1);
    },
    reload: () => setVersion((v) => v + 1),
  };
}
