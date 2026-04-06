import React from 'react';
import { Compass, Feather, Home, Images, MessageCircle, Newspaper, Repeat2, Settings, Sparkles, Tv2, User } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './Avatar';
import { getUnreadCount, useAppState } from '../lib/db';

const items = [
  { to: '/', label: 'Bản tin', icon: <Newspaper size={18} /> },
  { to: '/explore', label: 'Khám phá nhanh', icon: <Compass size={18} /> },
  { to: '/stories', label: 'Đăng tin', icon: <Feather size={18} /> },
  { to: '/reels', label: 'Thước phim', icon: <Tv2 size={18} /> },
  { to: '/messenger', label: 'Tin nhắn', icon: <MessageCircle size={18} /> },
  { to: '/ai', label: 'AI Chat', icon: <Sparkles size={18} /> },
  { to: '/settings', label: 'Cài đặt', icon: <Settings size={18} /> }
];

export default function Sidebar() {
  const { user, profile } = useAuth();
  const state = useAppState();
  const navigate = useNavigate();
  const unread = user ? getUnreadCount(user.uid) : 0;

  return (
    <aside className="sidebar">
      <button className="side-profile card" type="button" onClick={() => navigate('/profile')}>
        <Avatar src={profile?.photoURL || user?.photoURL} name={profile?.displayName || user?.displayName} size={54} />
        <div>
          <strong>{profile?.displayName || user?.displayName || 'Người dùng'}</strong>
          <span>{profile?.bio || 'Xem và chỉnh sửa hồ sơ của bạn'}</span>
        </div>
      </button>

      <div className="side-group card">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
            {item.icon}
            <span>{item.label}</span>
            {item.to === '/messenger' && unread > 0 && <small className="badge-count">{unread}</small>}
          </NavLink>
        ))}
      </div>

      <div className="side-group card">
        <h4>Phím tắt</h4>
        <button className="shortcut-btn" type="button" onClick={() => navigate('/profile')}>
          <User size={16} />
          Hồ sơ cá nhân
        </button>
        <button className="shortcut-btn" type="button" onClick={() => navigate('/reels')}>
          <Repeat2 size={16} />
          Thước phim
        </button>
        <button className="shortcut-btn" type="button" onClick={() => navigate('/explore')}>
          <Images size={16} />
          Khám phá nội dung
        </button>
      </div>
    </aside>
  );
}
