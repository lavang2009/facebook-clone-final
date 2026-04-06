import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';

export default function Login() {
  const { user, login, register, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.dataset.theme = 'dark';
  }, []);

  if (!loading && user) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('Vui lòng nhập tên hiển thị.');
        await register({ name: name.trim(), email: email.trim(), password });
      } else {
        await login({ email: email.trim(), password });
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Không thể đăng nhập/đăng ký.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-visual card">
        <div className="auth-brand">
          <div className="brand-mark large">S</div>
          <div>
            <h1>SocialWave</h1>
            <p>Nền tảng mạng xã hội giàu hiệu ứng, thao tác mượt và dữ liệu thật.</p>
          </div>
        </div>

        <div className="auth-points">
          <div className="auth-point">
            <ShieldCheck size={18} />
            <div>
              <strong>Đăng ký bằng Firebase Auth</strong>
              <small>Tài khoản thật, đăng nhập thật</small>
            </div>
          </div>
          <div className="auth-point">
            <Sparkles size={18} />
            <div>
              <strong>Giao diện nổi bật</strong>
              <small>Feed, Story, Reels, Tin nhắn, AI Chat</small>
            </div>
          </div>
          <div className="auth-point">
            <ArrowRight size={18} />
            <div>
              <strong>Lưu trạng thái sau tải lại</strong>
              <small>Hồ sơ, bài viết, bình luận và nhắn tin</small>
            </div>
          </div>
        </div>

        <div className="auth-demo">
          <Avatar name="SocialWave" size={72} />
          <div>
            <strong>Đã sẵn sàng</strong>
            <small>Giải pháp gọn, đẹp và chạy ngay sau khi cài đặt.</small>
          </div>
        </div>
      </div>

      <form className="auth-card card" onSubmit={submit}>
        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Đăng nhập</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Đăng ký</button>
        </div>

        <h2>{mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}</h2>
        <p className="muted">
          {mode === 'login'
            ? 'Đăng nhập để tiếp tục xem Bản tin, Tin nhắn, Thước phim và Cài đặt.'
            : 'Tạo tài khoản để bắt đầu đăng bài, đăng tin, xem hồ sơ và nhắn tin.'}
        </p>

        {mode === 'register' && (
          <label className="field">
            <span>Tên hiển thị</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Nguyễn Văn A" />
          </label>
        )}

        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>

        <label className="field">
          <span>Mật khẩu</span>
          <div className="password-field">
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            <button type="button" className="icon-btn" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        {error && <div className="form-error">{error}</div>}

        <button className="primary-btn auth-submit" type="submit" disabled={busy}>
          {busy ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
        </button>

        <div className="auth-note">
          <small>
            Bằng cách tiếp tục, bạn đồng ý với cách lưu dữ liệu cục bộ và hồ sơ đăng nhập của ứng dụng.
          </small>
        </div>
      </form>
    </div>
  );
}
