import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav style={{ display: 'flex', gap: 16, padding: 12, flexWrap: 'wrap' }}>
      <Link to="/">Trang chủ</Link>
      {user ? (
        <>
          <Link to="/recipes/new">Đăng công thức</Link>
          <Link to="/my-recipes">Của tôi</Link>
          <Link to="/saved">Đã lưu</Link>
          {user.role === 'admin' && <Link to="/admin">Quản trị</Link>}
          <button onClick={logout}>Đăng xuất</button>
        </>
      ) : (
        <>
          <Link to="/login">Đăng nhập</Link>
          <Link to="/register">Đăng ký</Link>
        </>
      )}
    </nav>
  );
}
