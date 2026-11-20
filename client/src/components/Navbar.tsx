import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { toast } from '../store/useToastStore';
import { initials } from '../utils/format';
import Icon from './ui/Icon';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const handleLogout = () => {
    close();
    logout();
    toast.info('Bạn đã đăng xuất');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link className="brand" to="/" onClick={close}>
          <span className="brand-mark">
            <Icon name="chef" size={18} />
          </span>
          CookBook
        </Link>

        <button
          className="nav-toggle"
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'x' : 'menu'} size={20} />
        </button>

        <nav id="main-nav" className={`nav-links ${open ? 'open' : ''}`} aria-label="Điều hướng chính">
          <NavLink to="/" end onClick={close}>
            Trang chủ
          </NavLink>
          {user ? (
            <>
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
              <Link to="/recipes/new" className="btn btn-primary btn-sm" onClick={close} style={{ marginLeft: 6 }}>
                <Icon name="plus" size={14} /> Đăng công thức
              </Link>
              <span className="nav-user">
                <span className="nav-user-name" title={user.email}>
                  <span className="avatar avatar-sm" style={{ marginRight: 8 }}>
                    {initials(user.name)}
                  </span>
                  {user.name}
                </span>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </span>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>
                Đăng nhập
              </NavLink>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={close} style={{ marginLeft: 6 }}>
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
