import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { toast } from '../store/useToastStore';

/**
 * Trả về hàm kiểm tra đăng nhập. Chưa đăng nhập thì báo và chuyển sang trang đăng nhập,
 * sau khi đăng nhập xong sẽ quay lại đúng trang đang xem.
 */
export function useRequireLogin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (message = 'Vui lòng đăng nhập để tiếp tục'): boolean => {
    if (user) return true;
    toast.info(message);
    navigate('/login', { state: { from: location.pathname + location.search } });
    return false;
  };
}
