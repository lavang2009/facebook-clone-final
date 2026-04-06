import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Stories from './pages/Stories';
import Reels from './pages/Reels';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Messenger from './pages/Messenger';
import AIChat from './pages/AIChat';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-card card">
        <div className="brand-mark large">S</div>
        <h2>Đang khởi tạo SocialWave</h2>
        <p>Đọc phiên đăng nhập và dữ liệu cục bộ...</p>
      </div>
    </div>
  );
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/" element={<Protected><Home /></Protected>} />
      <Route path="/stories" element={<Protected><Stories /></Protected>} />
      <Route path="/reels" element={<Protected><Reels /></Protected>} />
      <Route path="/explore" element={<Protected><Explore /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      <Route path="/profile/:uid" element={<Protected><Profile /></Protected>} />
      <Route path="/messenger" element={<Protected><Messenger /></Protected>} />
      <Route path="/ai" element={<Protected><AIChat /></Protected>} />
      <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
      <Route path="/settings" element={<Protected><Settings /></Protected>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
