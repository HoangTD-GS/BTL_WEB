import { Link, Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/useAuth';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import { usePageTitle } from '../hooks/usePageTitle';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

function Forbidden() {
  usePageTitle('Không có quyền truy cập');
  return (
    <EmptyState
      icon="lock"
      title="Bạn không có quyền truy cập trang này"
      actions={
        <Link to="/" className="btn btn-primary">
          Về trang chủ
        </Link>
      }
    >
      Trang này chỉ dành cho quản trị viên.
    </EmptyState>
  );
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  // Nhớ trang đang muốn vào để đăng nhập xong quay lại đúng chỗ
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (adminOnly && user.role !== 'admin') return <Forbidden />;
  return children;
}
