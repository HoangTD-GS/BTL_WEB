import type { ReactNode } from 'react';
import Alert from './Alert';
import Button from './Button';
import Spinner from './Spinner';

interface DataStateProps {
  loading: boolean;
  error: string;
  /** Đã có dữ liệu từ lần tải trước chưa (để không nháy spinner khi chuyển trang) */
  hasData: boolean;
  isEmpty: boolean;
  emptyText: string;
  onRetry: () => void;
  children: ReactNode;
}

/** Gom 4 trạng thái của một danh sách: lỗi, đang tải lần đầu, rỗng, có dữ liệu. */
export default function DataState({
  loading,
  error,
  hasData,
  isEmpty,
  emptyText,
  onRetry,
  children,
}: DataStateProps) {
  if (error) {
    return (
      <div className="stack">
        <Alert type="error">{error}</Alert>
        <div>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }
  if (!hasData) return <Spinner />;
  if (isEmpty && !loading) return <p className="empty">{emptyText}</p>;
  return (
    <div className={loading ? 'is-loading' : undefined} aria-busy={loading}>
      {children}
    </div>
  );
}
