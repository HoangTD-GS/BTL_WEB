import { Link } from 'react-router-dom';

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span>© {YEAR} CookBook · Chia sẻ công thức nấu ăn</span>
        <nav aria-label="Liên kết chân trang">
          <Link to="/">Khám phá</Link>
          <Link to="/recipes/new">Đăng công thức</Link>
          <Link to="/saved">Đã lưu</Link>
        </nav>
      </div>
    </footer>
  );
}
