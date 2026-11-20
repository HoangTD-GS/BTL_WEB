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

/** 1 = yếu, 2 = trung bình, 3 = mạnh */
function strength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) score++;
  return Math.max(1, score) as 1 | 2 | 3;
}
const STRENGTH_LABEL = ['', 'Yếu', 'Trung bình', 'Mạnh'];

export default function Register() {
  usePageTitle('Đăng ký');
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const level = strength(password);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'Tên cần có ít nhất 2 ký tự';
    if (!email.trim()) next.email = 'Vui lòng nhập email';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Email chưa đúng định dạng';
    if (password.length < 6) next.password = 'Mật khẩu cần có ít nhất 6 ký tự';
    if (confirm !== password) next.confirm = 'Mật khẩu nhập lại chưa khớp';
    setErrors(next);
    setServerError('');
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      toast.success('Tạo tài khoản thành công. Chào mừng bạn!');
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-card">
      <h1>Tạo tài khoản</h1>
      <p className="form-sub">Đăng ký để đăng công thức, thích và lưu món yêu thích.</p>
      {serverError && (
        <div style={{ marginBottom: 16 }}>
          <Alert type="error">{serverError}</Alert>
        </div>
      )}
      <form className="form-grid" onSubmit={submit} noValidate>
        <Input label="Họ tên" autoComplete="name" autoFocus value={name} error={errors.name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" type="email" autoComplete="email" value={email} error={errors.email} onChange={(e) => setEmail(e.target.value)} />
        <div className="stack" style={{ gap: 6 }}>
          <PasswordField
            label="Mật khẩu"
            autoComplete="new-password"
            value={password}
            error={errors.password}
            hint="Tối thiểu 6 ký tự."
            onChange={(e) => setPassword(e.target.value)}
          />
          {level > 0 && (
            <div className="strength" aria-live="polite">
              <div className="strength-bar">
                <div className={`strength-fill strength-${level}`} />
              </div>
              <span>{STRENGTH_LABEL[level]}</span>
            </div>
          )}
        </div>
        <PasswordField
          label="Nhập lại mật khẩu"
          autoComplete="new-password"
          value={confirm}
          error={errors.confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <Button type="submit" loading={loading}>
          Đăng ký
        </Button>
      </form>
      <p className="form-footer">
        Đã có tài khoản?{' '}
        <Link to="/login" state={location.state}>
          Đăng nhập
        </Link>
      </p>
    </section>
  );
}
