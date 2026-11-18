import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    const isConfirmed = window.confirm('Bạn có chắc muốn đăng xuất?');
    if (isConfirmed) {
      logout();
      navigate('/login');
    }
  };

  // Hàm style động cho các mục menu: Nếu đang ở trang đó thì đổi màu cam và có gạch chân nhẹ
  const getLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    textDecoration: 'none',
    color: isActive ? '#E67E22' : '#555', // Đang ở trang nào thì nổi màu cam chủ đạo
    fontWeight: isActive ? '700' : '500',
    borderBottom: isActive ? '2px solid #E67E22' : '2px solid transparent',
    paddingBottom: '4px',
    transition: 'all 0.2s ease'
  });

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 30px',
      background: '#FFFFFF',
      borderBottom: '1px solid #F3EFE6',
      boxShadow: '0 2px 8px rgba(74, 46, 27, 0.04)',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <NavLink to="/" style={{ textDecoration: 'none', color: '#4A2E1B', fontWeight: '700', fontSize: '18px' }}>
          🍳 CookBook
        </NavLink>
        
        <NavLink to="/" end style={getLinkStyle}>Trang chủ</NavLink>
        
        {/* Chỉ hiển thị khi đã đăng nhập */}
        {user && (
          <>
            <NavLink to="/recipes/new" style={getLinkStyle}>Đăng công thức</NavLink>
            <NavLink to="/my-recipes" style={getLinkStyle}>Của tôi</NavLink>
            <NavLink to="/saved" style={getLinkStyle}>Đã lưu</NavLink>
          </>
        )}
      </div>

      <div>
        {user ? (
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: '#FDF2F2',
              color: '#C92A2A',
              border: '1px solid #F8D7DA',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Đăng xuất
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <NavLink 
              to="/login" 
              style={getLinkStyle}
            >
              Đăng nhập
            </NavLink>
            <NavLink 
              to="/register" 
              style={({ isActive }) => ({
                padding: '8px 16px', 
                background: isActive ? '#D35400' : '#E67E22', 
                color: '#FFF', 
                borderRadius: '6px', 
                textDecoration: 'none', 
                fontWeight: '600', 
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(230, 126, 34, 0.2)'
              })}
            >
              Đăng ký
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}