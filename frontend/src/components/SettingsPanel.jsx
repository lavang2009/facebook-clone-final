import React, { useEffect, useState } from 'react';
import { BellRing, Globe2, MoonStar, PlayCircle, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { clearAIHistory, resetState, saveSettings } from '../lib/db';

export default function SettingsPanel() {
  const { user, profile, settings, changeTheme, updateMyProfile } = useAuth();
  const [theme, setTheme] = useState(settings?.theme || 'dark');
  const [language, setLanguage] = useState(settings?.language || 'vi');
  const [notifications, setNotifications] = useState(settings?.notifications ?? true);
  const [autoplayVideo, setAutoplayVideo] = useState(settings?.autoplayVideo ?? true);
  const [compactMode, setCompactMode] = useState(settings?.compactMode ?? false);
  const [showOnline, setShowOnline] = useState(settings?.showOnline ?? true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTheme(settings?.theme || 'dark');
    setLanguage(settings?.language || 'vi');
    setNotifications(settings?.notifications ?? true);
    setAutoplayVideo(settings?.autoplayVideo ?? true);
    setCompactMode(settings?.compactMode ?? false);
    setShowOnline(settings?.showOnline ?? true);
  }, [settings?.theme, settings?.language, settings?.notifications, settings?.autoplayVideo, settings?.compactMode, settings?.showOnline]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      saveSettings(user.uid, { theme, language, notifications, autoplayVideo, compactMode, showOnline });
      document.body.dataset.theme = theme;
      await changeTheme(theme);
      alert('Đã lưu cài đặt.');
    } catch (error) {
      alert(error.message || 'Không thể lưu cài đặt.');
    } finally {
      setSaving(false);
    }
  };

  const clearData = () => {
    if (!window.confirm('Xoá toàn bộ dữ liệu cục bộ của ứng dụng trên trình duyệt này?')) return;
    resetState();
    window.location.reload();
  };

  return (
    <section className="settings-grid">
      <div className="card settings-card">
        <div className="section-head">
          <div>
            <h3>Giao diện</h3>
            <p>Tuỳ biến theo cách bạn thích</p>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-copy">
            <MoonStar size={18} />
            <div>
              <strong>Chế độ hiển thị</strong>
              <small>Sáng / Tối</small>
            </div>
          </div>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="dark">Tối</option>
            <option value="light">Sáng</option>
          </select>
        </div>

        <div className="settings-row">
          <div className="settings-copy">
            <Globe2 size={18} />
            <div>
              <strong>Ngôn ngữ</strong>
              <small>Chọn ngôn ngữ hiển thị</small>
            </div>
          </div>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="card settings-card">
        <div className="section-head">
          <div>
            <h3>Riêng tư & thông báo</h3>
            <p>Giữ quyền kiểm soát tài khoản của bạn</p>
          </div>
        </div>

        {[
          ['notifications', 'Thông báo đẩy', <BellRing size={18} />, notifications, setNotifications],
          ['autoplayVideo', 'Tự phát video', <PlayCircle size={18} />, autoplayVideo, setAutoplayVideo],
          ['compactMode', 'Chế độ gọn', <Sparkles size={18} />, compactMode, setCompactMode],
          ['showOnline', 'Hiển thị trạng thái online', <ShieldCheck size={18} />, showOnline, setShowOnline]
        ].map(([key, label, icon, value, setter]) => (
          <div className="settings-row" key={key}>
            <div className="settings-copy">
              {icon}
              <div>
                <strong>{label}</strong>
                <small>Tuỳ chọn lưu cục bộ cho hồ sơ của bạn</small>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" checked={Boolean(value)} onChange={(e) => setter(e.target.checked)} />
              <span />
            </label>
          </div>
        ))}
      </div>

      <div className="card settings-card">
        <div className="section-head">
          <div>
            <h3>Tài khoản</h3>
            <p>Thông tin đang đăng nhập</p>
          </div>
        </div>

        <div className="account-summary">
          <strong>{profile?.displayName}</strong>
          <small>{profile?.email || user?.email}</small>
          <p>{profile?.bio || 'Chưa cập nhật tiểu sử.'}</p>
        </div>

        <div className="settings-footer">
          <button className="ghost-btn" type="button" onClick={clearData}>
            <Trash2 size={16} />
            Xoá dữ liệu cục bộ
          </button>
          <button className="primary-btn" type="button" onClick={save} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>
    </section>
  );
}
