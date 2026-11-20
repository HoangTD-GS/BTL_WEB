import type { JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFound(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '80vh',
        background: '#FDFBF7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '36px 28px',
          textAlign: 'center',
          border: '1px solid #F3EFE6',
          boxShadow: '0 8px 24px rgba(74, 46, 27, 0.06)',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            fontWeight: 800,
            color: '#E67E22',
            lineHeight: 1,
            marginBottom: '12px',
          }}
        >
          404
        </div>

        <h1
          style={{
            margin: '0 0 10px 0',
            color: '#4A2E1B',
            fontSize: '22px',
            fontWeight: 700,
          }}
        >
          Không tìm thấy trang
        </h1>

        <p
          style={{
            margin: '0 0 24px 0',
            color: '#666',
            fontSize: '14px',
            lineHeight: 1.6,
          }}
        >
          Đường dẫn này không tồn tại hoặc chưa được cấu hình trên CookBook.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #E0DCD0',
              background: '#FAFAFA',
              color: '#4A2E1B',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            &larr; Quay lại
          </button>

          <Link
            to="/my-recipes"
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: '#E67E22',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(230, 126, 34, 0.2)',
            }}
          >
            Về Của tôi
          </Link>
        </div>
      </div>
    </div>
  );
}