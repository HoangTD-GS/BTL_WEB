import type { ReactNode } from 'react';

export default function RecipeGrid({ children, busy = false }: { children: ReactNode; busy?: boolean }) {
  return (
    <div className={`recipe-grid ${busy ? 'is-loading' : ''}`.trim()} aria-busy={busy}>
      {children}
    </div>
  );
}

/** Khung chờ hiện lúc tải lần đầu, giữ nguyên bố cục để trang không bị nhảy. */
export function RecipeGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="recipe-grid" role="status" aria-label="Đang tải công thức">
      {Array.from({ length: count }, (_, i) => (
        <div className="card-skeleton" key={i}>
          <div className="skeleton skeleton-media" />
          <div className="skeleton-body">
            <div className="skeleton" style={{ height: 18, width: '70%' }} />
            <div className="skeleton" style={{ height: 12 }} />
            <div className="skeleton" style={{ height: 12, width: '85%' }} />
            <div className="skeleton" style={{ height: 28, marginTop: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
