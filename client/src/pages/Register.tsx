import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại!');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      alert('Đăng ký tài khoản thành công!');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#FDFBF7',
      fontFamily: 'sans-serif',
      padding: '20px 0'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '35px',
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(74, 46, 27, 0.08)',
        border: '1px solid #F3EFE6'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#4A2E1B', fontWeight: '700' }}>
          ✨ Đăng Ký CookBook
        </h2>
        
        {error && (
          <div style={{
            padding: '10px 12px',
            background: '#FDF2F2',
            color: '#C92A2A',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            border: '1px solid #F8D7DA'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister}>
          <div style={{ display: 'none' }} aria-hidden="true">
            <input type="password" name="fake-remembered-password" autoComplete="current-password" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4A2E1B', fontSize: '14px' }}>Họ tên</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #E0DCD0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#FAFAFA',
                color: '#4A2E1B'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4A2E1B', fontSize: '14px' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #E0DCD0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#FAFAFA',
                color: '#4A2E1B'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4A2E1B', fontSize: '14px' }}>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 14px',
                  border: '1px solid #E0DCD0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#FAFAFA',
                  color: '#4A2E1B',
                }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#666'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#4A2E1B', fontSize: '14px' }}>Xác nhận mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 14px',
                  border: '1px solid #E0DCD0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#FAFAFA',
                  color: '#4A2E1B'
                }}
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#666'
                }}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#E67E22',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(230, 126, 34, 0.2)'
            }}
          >
            {loading ? 'Đang xử lý...' : 'Tạo Tài Khoản'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: '#E67E22', textDecoration: 'none', fontWeight: '600' }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}