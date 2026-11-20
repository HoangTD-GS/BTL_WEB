import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import { usePageTitle } from '../hooks/usePageTitle';

export default function NotFound() {
  usePageTitle('Không tìm thấy trang');
  return (
    <EmptyState
      icon="search"
      title="Không tìm thấy trang"
      actions={
        <Link to="/" className="btn btn-primary">
          Về trang chủ
        </Link>
      }
    >
      Đường dẫn bạn truy cập không tồn tại hoặc đã bị xóa.
    </EmptyState>
  );
}
