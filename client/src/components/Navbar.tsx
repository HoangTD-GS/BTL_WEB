import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link className="brand" to="/">
          CookBook
        </Link>
        <nav className="nav-links" aria-label="Điều hướng chính">
          <NavLink to="/" end>
            Trang chủ
          </NavLink>
          {user ? (
            <>
              <NavLink to="/recipes/new">Đăng công thức</NavLink>
              <NavLink to="/my-recipes">Của tôi</NavLink>
              <NavLink to="/saved">Đã lưu</NavLink>
              {user.role === 'admin' && <NavLink to="/admin">Quản trị</NavLink>}
              <button className="nav-button" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Đăng nhập</NavLink>
              <NavLink to="/register">Đăng ký</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
