import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listCategories } from '../api/admin';
import type { SortKey, Category } from '../types';
import RecipeCard from '../components/recipe/RecipeCard';
import RecipeGrid, { RecipeGridSkeleton } from '../components/recipe/RecipeGrid';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import Pagination from '../components/ui/Pagination';
import Select from '../components/ui/Select';
import { useAuth } from '../context/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { usePageTitle } from '../hooks/usePageTitle';
import { useRecipeList } from '../hooks/useRecipeList';

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Được thích nhiều nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
];
const TIMES = [
  { value: 0, label: 'Bất kỳ' },
  { value: 15, label: 'Dưới 15 phút' },
  { value: 30, label: 'Dưới 30 phút' },
  { value: 60, label: 'Dưới 1 giờ' },
];

type Patch = Record<string, string | number | undefined>;

export default function Home() {
  usePageTitle();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Bộ lọc nằm trên URL (?q=&category=&sort=&maxTime=&page=) nên chia sẻ link và nút Back đều hoạt động
  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const sortParam = params.get('sort');
  const sort: SortKey = SORTS.some((s) => s.value === sortParam) ? (sortParam as SortKey) : 'newest';
  const maxTime = Number(params.get('maxTime')) || 0;
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  const update = (patch: Patch, resetPage = true) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === '' || value === 0) next.delete(key);
      else next.set(key, String(value));
    }
    if (resetPage && !('page' in patch)) next.delete('page');
    // Gõ tìm kiếm không tạo thêm một mục trong lịch sử trình duyệt
    setParams(next, { replace: Object.keys(patch).length === 1 && 'q' in patch });
  };

  // Ô tìm kiếm: gõ xong ~0,4 giây mới cập nhật URL
  const [searchInput, setSearchInput] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    if (q !== searchInput.trim()) setSearchInput(q); // URL đổi từ bên ngoài (Back, xóa bộ lọc)
  }
  const debounced = useDebounce(searchInput, 400);
  useEffect(() => {
    if (debounced.trim() !== q) update({ q: debounced.trim() });
    // chỉ chạy khi người dùng gõ xong
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const { data, loading, error, reload } = useRecipeList({
    q: q || undefined,
    category: category || undefined,
    maxTime: maxTime || undefined,
    sort,
    page,
    limit: 12,
  });

  const filtered = Boolean(q || category || maxTime);
  const clearFilters = () => {
    setSearchInput('');
    setParams(new URLSearchParams(sort !== 'newest' ? { sort } : {}));
  };

  const items = data?.items ?? [];

  return (
    <div>
      <section className="hero">
        <h1>Hôm nay nấu món gì?</h1>
        <p>Khám phá hàng trăm công thức từ cộng đồng, lưu lại món yêu thích và chia sẻ bí quyết của riêng bạn.</p>
        <div className="search-box" role="search">
          <Icon name="search" size={20} />
          <input
            type="search"
            aria-label="Tìm công thức theo tên món hoặc nguyên liệu"
            placeholder="Tìm món ăn, nguyên liệu..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button className="search-clear" onClick={() => setSearchInput('')} aria-label="Xóa nội dung tìm kiếm">
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
      </section>

      <div className="filters" ref={resultsRef}>
        <div className="chips" role="group" aria-label="Lọc theo danh mục">
          <button className="chip" aria-pressed={!category} onClick={() => update({ category: '' })}>
            Tất cả
          </button>
          {categories.map((c) => (
            <button key={c._id} className="chip" aria-pressed={category === c._id} onClick={() => update({ category: c._id })}>
              {c.name}
            </button>
          ))}
        </div>
        <div className="filter-row">
          <Select label="Sắp xếp theo" value={sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          <Select label="Thời gian nấu" value={maxTime} onChange={(e) => update({ maxTime: Number(e.target.value) })}>
            {TIMES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <div className="results-info" aria-live="polite">
            {data && (
              <span>
                {data.total} công thức
                {q && (
                  <>
                    {' '}
                    cho “<strong>{q}</strong>”
                  </>
                )}
              </span>
            )}
            {filtered && (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <div className="stack">
          <Alert type="error">{error}</Alert>
          <div>
            <Button variant="secondary" size="sm" onClick={reload}>
              Thử lại
            </Button>
          </div>
        </div>
      ) : !data ? (
        <RecipeGridSkeleton />
      ) : items.length === 0 ? (
        filtered ? (
          <EmptyState
            icon="search"
            title="Không tìm thấy công thức phù hợp"
            actions={<Button onClick={clearFilters}>Xóa bộ lọc</Button>}
          >
            Thử đổi từ khóa, chọn danh mục khác hoặc bỏ bớt bộ lọc.
          </EmptyState>
        ) : (
          <EmptyState
            title="Chưa có công thức nào"
            actions={
              <Link to={user ? '/recipes/new' : '/register'} className="btn btn-primary">
                {user ? 'Đăng công thức đầu tiên' : 'Đăng ký để chia sẻ'}
              </Link>
            }
          >
            Hãy là người đầu tiên chia sẻ một món ăn.
          </EmptyState>
        )
      ) : (
        <>
          <RecipeGrid busy={loading}>
            {items.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </RecipeGrid>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onChange={(p) => {
              update({ page: p }, false);
              resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
        </>
      )}
    </div>
  );
}
