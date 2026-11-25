import { useEffect, useState } from 'react';
import type { Paged } from '../api/admin';
import { listRecipes } from '../api/recipes';
import type { RecipeQuery } from '../api/recipes';
import type { RecipeListItem } from '../types';
import { getErrorMessage } from '../utils/errors';

/** Tải danh sách công thức theo bộ lọc; giữ kết quả cũ trong lúc tải kết quả mới. */
export function useRecipeList(query: RecipeQuery) {
  const [data, setData] = useState<Paged<RecipeListItem> | null>(null);
  const [settled, setSettled] = useState<{ key: string; error: string } | null>(null);
  const [version, setVersion] = useState(0);
  const key = JSON.stringify([query, version]);

  useEffect(() => {
    let cancelled = false;
    listRecipes(query)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setSettled({ key, error: '' });
      })
      .catch((err: unknown) => {
        if (!cancelled) setSettled({ key, error: getErrorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
    // `query` được so sánh qua `key` để không chạy lại khi chỉ đổi tham chiếu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    data,
    loading: settled?.key !== key,
    error: settled?.key === key ? settled.error : '',
    reload: () => setVersion((v) => v + 1),
  };
}
