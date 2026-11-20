import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { toast } from '../store/useToastStore';
import Avatar from './ui/Avatar';
import Icon from './ui/Icon';

interface NavbarProps {
  onOpenPrank: () => void;
  easterEggHidden: boolean;
  onRestoreEasterEgg: () => void;
}

export default function Navbar({ onOpenPrank, easterEggHidden, onRestoreEasterEgg }: NavbarProps) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const theme = pathname === '/'
    ? 'navbar-home'
    : pathname.startsWith('/my-recipes')
      ? 'navbar-my-recipes'
      : pathname.startsWith('/saved')
        ? 'navbar-saved'
        : pathname.startsWith('/admin')
          ? 'navbar-admin'
          : pathname.startsWith('/recipes/new') || pathname.startsWith('/recipes/edit')
            ? 'navbar-form'
            : pathname.startsWith('/recipes/')
              ? 'navbar-detail'
              : pathname.startsWith('/login') || pathname.startsWith('/register')
                ? 'navbar-auth'
                : 'navbar-default';
  const close = () => {
    setOpen(false);
    setAccountOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    close();
    logout();
    toast.info('Bạn đã đăng xuất');
    navigate('/login');
  };

  return (
    <header className={`navbar ${theme}`}>
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
          <NavLink className="nav-home" to="/" end onClick={close}>
            Trang chủ
          </NavLink>
          {user ? (
            <>
              <NavLink className="nav-my-recipes" to="/my-recipes" onClick={close}>
                Của tôi
              </NavLink>
              <NavLink className="nav-saved" to="/saved" onClick={close}>
                Đã lưu
              </NavLink>
              {user.role === 'admin' && (
                <NavLink className="nav-admin" to="/admin" onClick={close}>
                  Quản trị
                </NavLink>
              )}
              <Link to="/recipes/new" className="btn btn-primary btn-sm" onClick={close} style={{ marginLeft: 6 }}>
                <Icon name="plus" size={14} /> Đăng công thức
              </Link>
              <div className="nav-account" ref={accountRef}>
                <button
                  className="nav-account-trigger"
                  type="button"
                  aria-label="Mở menu tài khoản"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((value) => !value)}
                >
                  <Avatar name={user.name} size="sm" />
                  <Icon name={accountOpen ? 'x' : 'menu'} size={14} />
                </button>
                {accountOpen && (
                  <div className="nav-account-menu" role="menu">
                    <div className="nav-account-profile">
                      <Avatar name={user.name} size="lg" />
                      <div>
                        <div className="nav-account-name-row">
                          <strong>{user.name}</strong>
                          {user.role === 'user' && easterEggHidden && (
                            <button
                              className="nav-account-restore-egg"
                              type="button"
                              aria-label="Hiện lại Easter egg"
                              title="Hiện lại Easter egg"
                              onClick={onRestoreEasterEgg}
                            >
                              <img src="/images/easter-egg.png" alt="" />
                            </button>
                          )}
                        </div>
                        <a href={`mailto:${user.email}`} title={`Gửi email đến ${user.email}`}>
                          {user.email}
                        </a>
                      </div>
                    </div>
                    <div className="nav-account-actions">
                      {user.role === 'user' && (
                        <button
                          className="nav-account-upgrade"
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            close();
                            onOpenPrank();
                          }}
                        >
                          <Icon name="sparkles" size={15} />
                          Nâng cấp lên quyền admin
                        </button>
                      )}
                      <button type="button" onClick={handleLogout} role="menuitem">
                        <Icon name="x" size={15} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
