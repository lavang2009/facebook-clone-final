import React, { useMemo, useRef, useState } from 'react';
import { Bell, Compass, LogOut, Menu, MessageCircle, Newspaper, Search, Settings, Sparkles, SquarePen, User } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { searchUsers, getUnreadCount, useAppState } from '../lib/db';
import Avatar from './Avatar';

const navItems = [
  { to: '/', label: 'Bản tin', icon: <Newspaper size={18} /> },
  { to: '/explore', label: 'Khám phá', icon: <Compass size={18} /> },
  { to: '/messenger', label: 'Tin nhắn', icon: <MessageCircle size={18} /> },
  { to: '/ai', label: 'AI Chat', icon: <Sparkles size={18} /> },
  { to: '/notifications', label: 'Thông báo', icon: <Bell size={18} /> },
  { to: '/settings', label: 'Cài đặt', icon: <Settings size={18} /> }
];

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const state = useAppState();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [openSearch, setOpenSearch] = useState(false);
  const searchRef = useRef(null);
  const suggestions = useMemo(() => searchUsers(query, user?.uid).slice(0, 6), [query, state.users, user?.uid]);

  const unread = user ? getUnreadCount(user.uid) : 0;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link to="/" className="brand">
          <span className="brand-mark">S</span>
          <span className="brand-text">
            <strong>SocialWave</strong>
            <small>kết nối thật · thao tác thật</small>
          </span>
        </Link>

        <div className="topbar-search" ref={searchRef}>
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpenSearch(true);
            }}
            onFocus={() => setOpenSearch(true)}
            placeholder="Tìm người dùng, bài viết, chủ đề..."
          />
          {openSearch && query.trim() && (
            <div className="search-dropdown">
              {suggestions.length ? suggestions.map((item) => (
                <button
                  key={item.uid}
                  type="button"
                  className="search-result"
                  onClick={() => {
                    navigate(`/profile/${item.uid}`);
                    setQuery('');
                    setOpenSearch(false);
                  }}
                >
                  <Avatar src={item.photoURL} name={item.displayName} size={34} />
                  <span>
                    <strong>{item.displayName}</strong>
                    <small>{item.city || item.email || 'Người dùng thật'}</small>
                  </span>
                </button>
              )) : (
                <div className="search-empty">Không tìm thấy kết quả phù hợp.</div>
              )}
            </div>
          )}
        </div>
      </div>

      <nav className="topbar-nav desktop-only">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="topbar-right">
        <button className="icon-btn desktop-only" type="button" onClick={() => navigate('/profile')}>
          <SquarePen size={18} />
        </button>
        <button className="icon-btn desktop-only" type="button" onClick={() => navigate('/notifications')}>
          <Bell size={18} />
          {unread > 0 && <span className="badge-dot">{unread}</span>}
        </button>
        <button className="profile-chip" type="button" onClick={() => navigate('/profile')}>
          <Avatar src={profile?.photoURL || user?.photoURL} name={profile?.displayName || user?.displayName} size={34} />
          <span className="desktop-only">
            <strong>{profile?.displayName || user?.displayName || 'Người dùng'}</strong>
            <small>{profile?.city || 'Hồ sơ cá nhân'}</small>
          </span>
        </button>
        <button className="icon-btn" type="button" onClick={logout} title="Đăng xuất">
          <LogOut size={18} />
        </button>
        <button className="icon-btn mobile-only" type="button" onClick={() => navigate('/settings')} title="Cài đặt">
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
}
