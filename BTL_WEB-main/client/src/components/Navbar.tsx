import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          🍲 Công thức nấu ăn
        </Link>
        <button
          className="nav-toggle"
          aria-label="Mở menu"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen((o) => !o)}
        >
          ☰
        </button>
        <nav id="nav-links" className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>
            Trang chủ
          </NavLink>
          {user ? (
            <>
              <NavLink to="/recipes/new" onClick={close}>
                Đăng công thức
              </NavLink>
              <NavLink to="/my-recipes" onClick={close}>
                Của tôi
              </NavLink>
              <NavLink to="/saved" onClick={close}>
                Đã lưu
              </NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" onClick={close}>
                  Quản trị
                </NavLink>
              )}
              <button
                onClick={() => {
                  close();
                  logout();
                }}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>
                Đăng nhập
              </NavLink>
              <NavLink to="/register" onClick={close}>
                Đăng ký
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
