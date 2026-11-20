import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PasswordField from '../components/ui/PasswordField';
import { useAuth } from '../context/useAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import { toast } from '../store/useToastStore';
import { getErrorMessage } from '../utils/errors';

export default function Login() {
  usePageTitle('Đăng nhập');
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Trang đang xem dở trước khi bị chuyển sang đăng nhập
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Vui lòng nhập email';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Email chưa đúng định dạng';
    if (!password) next.password = 'Vui lòng nhập mật khẩu';
    setErrors(next);
    setServerError('');
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Đăng nhập thành công');
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-card">
      <h1>Đăng nhập</h1>
      <p className="form-sub">
        {from !== '/' ? 'Đăng nhập để tiếp tục.' : 'Chào mừng bạn quay lại với CookBook.'}
      </p>
      {serverError && (
        <div style={{ marginBottom: 16 }}>
          <Alert type="error">{serverError}</Alert>
        </div>
      )}
      <form className="form-grid" onSubmit={submit} noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          error={errors.email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordField
          label="Mật khẩu"
          autoComplete="current-password"
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" loading={loading}>
          Đăng nhập
        </Button>
      </form>
      <p className="form-footer">
        Chưa có tài khoản?{' '}
        <Link to="/register" state={location.state}>
          Đăng ký
        </Link>
      </p>
    </section>
  );
}
