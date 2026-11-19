import { useEffect, useState } from 'react';
import { getStats } from '../../api/admin';
import type { AdminStats } from '../../api/admin';
import { getErrorMessage } from '../../utils/errors';
import Alert from '../ui/Alert';
import Spinner from '../ui/Spinner';

export default function StatsTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getStats()
      .then((res) => {
        if (!cancelled) setStats(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <Alert type="error">{error}</Alert>;
  if (!stats) return <Spinner />;

  const { totals } = stats;
  const cards = [
    { label: 'Người dùng', value: totals.users },
    { label: 'Quản trị viên', value: totals.admins },
    { label: 'Công thức', value: totals.recipes },
    { label: 'Bình luận', value: totals.comments },
    { label: 'Danh mục', value: totals.categories },
  ];
  const maxCount = Math.max(1, ...stats.byCategory.map((c) => c.count));

  return (
    <div>
      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="card stat-card">
            <span className="stat-value">{c.value}</span>
            <span className="stat-label">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="stats-columns">
        <section className="card">
          <h3>Công thức được thích nhiều nhất</h3>
          {stats.topRecipes.length === 0 ? (
            <p className="muted">Chưa có công thức nào được thích.</p>
          ) : (
            <ol className="top-list">
              {stats.topRecipes.map((r) => (
                <li key={r._id}>
                  <div className="grow">
                    <span className="name">{r.title}</span>
                    <span className="muted">bởi {r.authorName}</span>
                  </div>
                  <span className="badge">♥ {r.likesCount}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="card">
          <h3>Công thức theo danh mục</h3>
          {stats.byCategory.length === 0 ? (
            <p className="muted">Chưa có danh mục nào.</p>
          ) : (
            <div className="bar-list">
              {stats.byCategory.map((c) => (
                <div key={c._id ?? 'none'} className="bar-row">
                  <span className="cell-truncate" title={c.name}>
                    {c.name}
                  </span>
                  <div className="bar-track" aria-hidden="true">
                    <div className="bar-fill" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                  </div>
                  <span className="count">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
