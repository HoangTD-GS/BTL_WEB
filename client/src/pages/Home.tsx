import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { listCategories } from '../api/admin';
import type { SortKey, Category, RecipeListItem } from '../types';
import RecipeCard from '../components/recipe/RecipeCard';
import RecipeGrid, { RecipeGridSkeleton } from '../components/recipe/RecipeGrid';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import Select from '../components/ui/Select';
import { useAuth } from '../context/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { usePageTitle } from '../hooks/usePageTitle';
import { useRecipeList } from '../hooks/useRecipeList';
import { formatCookTime } from '../utils/format';

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

function getCategorySlug(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('chính')) return 'main';
  if (lower.includes('canh')) return 'soup';
  if (lower.includes('chay')) return 'veg';
  if (lower.includes('tráng miệng')) return 'dessert';
  if (lower.includes('uống')) return 'drink';
  if (lower.includes('vặt')) return 'snack';
  return 'general';
}

const HERO_BACKGROUNDS = [
  {
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
    title: 'Bếp lửa ấm cúng',
  },
  {
    url: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=1600&q=80',
    title: 'Gia vị & thảo mộc',
  },
  {
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1600&q=80',
    title: 'Món nước đậm đà',
  },
  {
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80',
    title: 'Bữa cơm sum vầy',
  },
  {
    url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80',
    title: 'Nguyên liệu tươi sạch',
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return { title: 'Chào buổi sáng!', sub: 'Bắt đầu ngày mới với một món ngon dinh dưỡng nhé ☀️' };
  if (h >= 11 && h < 14) return { title: 'Bữa trưa hôm nay ăn gì?', sub: 'Gợi ý những món ăn thanh mát, nạp đầy năng lượng 🍲' };
  if (h >= 14 && h < 18) return { title: 'Chào buổi chiều!', sub: 'Chuẩn bị bữa cơm ấm cúng cùng gia đình và người thân 🍳' };
  return { title: 'Tối nay bạn muốn nấu gì?', sub: 'Món ngon ấm bụng, dễ làm cho bữa tối sum vầy 🌙' };
}

type Patch = Record<string, string | number | undefined>;

export default function Home() {
  usePageTitle();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const resultsRef = useRef<HTMLDivElement>(null);
  const greeting = useRef(getGreeting()).current;

  // Bộ lọc nằm trên URL (?q=&category=&sort=&maxTime=&page=) nên chia sẻ link và nút Back đều hoạt động
  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const sortParam = params.get('sort');
  const sort: SortKey = SORTS.some((s) => s.value === sortParam) ? (sortParam as SortKey) : 'newest';
  const maxTime = Number(params.get('maxTime')) || 0;
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const [luckyOpen, setLuckyOpen] = useState(false);
  const [luckyDish, setLuckyDish] = useState<RecipeListItem | null>(null);
  const [spinning, setSpinning] = useState(false);

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

  const handleLuckyPick = () => {
    if (items.length === 0) return;
    setLuckyOpen(true);
    setSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * items.length);
      setLuckyDish(items[idx]);
      count++;
      if (count >= 7) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, 90);
  };

  return (
    <div>
      <section className="hero">
        <div className="hero-bg-slider" aria-hidden="true">
          {HERO_BACKGROUNDS.map((bg, idx) => (
            <div
              key={bg.url}
              className={`hero-bg-layer ${idx === bgIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${bg.url})` }}
            />
          ))}
          <div className="hero-bg-overlay" />
        </div>

        <div className="hero-inner">
          <h1>{greeting.title}</h1>
          <p>{greeting.sub}</p>
          <div className="search-box" role="search">
            <Icon name="search" size={20} />
            <input
              type="search"
              aria-label="Tìm công thức theo tên món hoặc nguyên liệu"
              placeholder="Tìm món ngon: phở bò, bún chả, sườn nướng..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button className="search-clear" onClick={() => setSearchInput('')} aria-label="Xóa nội dung tìm kiếm">
                <Icon name="x" size={16} />
              </button>
            )}
          </div>

          <div className="hero-tags" role="toolbar" aria-label="Gợi ý nhanh">
            <button
              type="button"
              className="hero-tag lucky-btn"
              onClick={handleLuckyPick}
              title="Chọn ngẫu nhiên một món ăn ngon"
            >
              <Icon name="dice" size={16} /> Hôm nay ăn gì?
            </button>
            <button
              type="button"
              className={`hero-tag ${maxTime === 30 ? 'active' : ''}`}
              onClick={() => update({ maxTime: maxTime === 30 ? 0 : 30 })}
            >
              <Icon name="zap" size={14} /> Nhanh gọn (&lt; 30p)
            </button>
            <button
              type="button"
              className={`hero-tag ${sort === 'popular' ? 'active' : ''}`}
              onClick={() => update({ sort: sort === 'popular' ? '' : 'popular' })}
            >
              <Icon name="flame" size={14} /> Phổ biến nhất
            </button>
          </div>

          <div className="hero-dots" aria-label="Bộ chọn hình nền">
            {HERO_BACKGROUNDS.map((bg, idx) => (
              <button
                key={bg.url}
                type="button"
                className={`hero-dot ${idx === bgIndex ? 'active' : ''}`}
                onClick={() => setBgIndex(idx)}
                title={bg.title}
                aria-label={`Ảnh nền ${idx + 1}: ${bg.title}`}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="filters" ref={resultsRef}>
        <div className="chips" role="group" aria-label="Lọc theo danh mục">
          <button
            className="chip chip-all"
            aria-pressed={!category}
            onClick={() => update({ category: '' })}
          >
            Tất cả món
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              className={`chip chip-${getCategorySlug(c.name)}`}
              aria-pressed={category === c._id}
              onClick={() => update({ category: c._id })}
            >
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
                <strong>{data.total}</strong> công thức
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

      {/* Modal Hôm nay ăn gì? */}
      <Modal
        open={luckyOpen}
        title="🎲 Hôm nay ăn gì nhỉ?"
        onClose={() => setLuckyOpen(false)}
        footer={
          luckyDish ? (
            <div className="lucky-dish-actions">
              <Button variant="secondary" onClick={handleLuckyPick} loading={spinning}>
                <Icon name="dice" size={16} /> Chọn món khác
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setLuckyOpen(false);
                  navigate(`/recipes/${luckyDish._id}`);
                }}
              >
                Xem công thức ngay
              </Button>
            </div>
          ) : null
        }
      >
        {luckyDish ? (
          <div className="lucky-dish-card">
            {luckyDish.image && (
              <div className="lucky-dish-img">
                <img src={luckyDish.image} alt={luckyDish.title} />
              </div>
            )}
            <h3>{luckyDish.title}</h3>
            {luckyDish.description && <p>{luckyDish.description}</p>}
            <div className="lucky-dish-meta">
              {luckyDish.cookTime > 0 && (
                <span>
                  <Icon name="clock" size={14} /> {formatCookTime(luckyDish.cookTime)}
                </span>
              )}
              <span>
                <Icon name="users" size={14} /> {luckyDish.servings} người
              </span>
              <span>
                <Icon name="heart" size={14} /> {luckyDish.likes?.length ?? 0} thích
              </span>
            </div>
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: '20px 0' }}>Đang quay món ngẫu nhiên...</p>
        )}
      </Modal>
    </div>
  );
}
