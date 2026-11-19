import type { JSX } from 'react';
import { useSearchParams } from 'react-router-dom';
import CategoriesTab from '../components/admin/CategoriesTab';
import CommentsTab from '../components/admin/CommentsTab';
import RecipesTab from '../components/admin/RecipesTab';
import StatsTab from '../components/admin/StatsTab';
import UsersTab from '../components/admin/UsersTab';
import '../components/admin/admin.css';

const TABS = [
  { key: 'stats', label: 'Thống kê' },
  { key: 'users', label: 'Người dùng' },
  { key: 'categories', label: 'Danh mục' },
  { key: 'recipes', label: 'Công thức' },
  { key: 'comments', label: 'Bình luận' },
] as const;

export default function AdminDashboard(): JSX.Element {
  // Tab hiện tại nằm trên URL (?tab=users) nên tải lại trang vẫn giữ nguyên tab
  const [params, setParams] = useSearchParams();
  const current = TABS.find((t) => t.key === params.get('tab'))?.key ?? 'stats';

  return (
    <div>
      <div className="page-header">
        <h1>Quản trị</h1>
        <p>Quản lý người dùng, danh mục và kiểm duyệt nội dung.</p>
      </div>

      <div className="tabs" role="tablist" aria-label="Các mục quản trị">
        {TABS.map((t) => (
          <button
            key={t.key}
            id={`tab-${t.key}`}
            className="tab"
            role="tab"
            aria-selected={current === t.key}
            aria-controls="admin-panel"
            onClick={() => setParams({ tab: t.key })}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section id="admin-panel" role="tabpanel" aria-labelledby={`tab-${current}`}>
        {current === 'stats' && <StatsTab />}
        {current === 'users' && <UsersTab />}
        {current === 'categories' && <CategoriesTab />}
        {current === 'recipes' && <RecipesTab />}
        {current === 'comments' && <CommentsTab />}
      </section>
    </div>
  );
}
