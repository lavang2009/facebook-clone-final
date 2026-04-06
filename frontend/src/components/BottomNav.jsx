import React from 'react';
import { Bell, Compass, MessageCircle, Newspaper, Sparkles, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUnreadCount } from '../lib/db';

export default function BottomNav() {
  const { user } = useAuth();
  const unread = user ? getUnreadCount(user.uid) : 0;

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Newspaper size={18} />
        <span>Bản tin</span>
      </NavLink>
      <NavLink to="/explore" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Compass size={18} />
        <span>Khám phá</span>
      </NavLink>
      <NavLink to="/messenger" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <MessageCircle size={18} />
        <span>Tin nhắn</span>
        {unread > 0 && <small className="badge-dot bottom-badge">{unread}</small>}
      </NavLink>
      <NavLink to="/ai" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Sparkles size={18} />
        <span>AI Chat</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Settings size={18} />
        <span>Cài đặt</span>
      </NavLink>
    </nav>
  );
}
