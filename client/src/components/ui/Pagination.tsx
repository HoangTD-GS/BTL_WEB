interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

// Ví dụ: 1 … 4 5 6 … 20
function pageWindow(page: number, total: number): (number | 'gap')[] {
  const shown = new Set([1, total, page - 1, page, page + 1]);
  const pages = [...shown].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | 'gap')[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) result.push('gap');
    result.push(p);
  });
  return result;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Phân trang">
      <button className="page-btn" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        ‹ Trước
      </button>
      {pageWindow(page, totalPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="page-gap" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            className={`page-btn ${p === page ? 'active' : ''}`}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Trang ${p}`}
          >
            {p}
          </button>
        )
      )}
      <button className="page-btn" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
        Sau ›
      </button>
    </nav>
  );
}
