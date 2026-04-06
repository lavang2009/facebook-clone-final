import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { getSettings, useAppState } from '../lib/db';

export default function Shell({ children, rightRail = null, className = '' }) {
  const { user } = useAuth();
  const state = useAppState();
  const location = useLocation();

  const theme = useMemo(() => {
    if (!user) return 'dark';
    return getSettings(user.uid)?.theme || 'dark';
  }, [state.settings, user?.uid]);

  useEffect(() => {
    document.body.dataset.theme = theme;
    document.body.dataset.route = location.pathname;
  }, [theme, location.pathname]);

  const hasRail = Boolean(rightRail);

  return (
    <div className={`app-shell ${className}`}>
      <Navbar />
      <div className={`shell-grid ${hasRail ? 'with-rail' : 'no-rail'}`}>
        <Sidebar />
        <main className="main-column">{children}</main>
        {hasRail && <aside className="right-column">{rightRail}</aside>}
      </div>
      <BottomNav />
    </div>
  );
}
