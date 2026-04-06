import React, { useMemo } from 'react';
import { Bell, CheckCheck, MessageCircle, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { markAllNotificationsRead, selectNotifications, useAppState } from '../lib/db';

export default function Notifications() {
  const { user, profile } = useAuth();
  const state = useAppState();
  const navigate = useNavigate();
  const notifications = useMemo(() => selectNotifications(state, user?.uid), [state.notifications, user?.uid]);

  const iconFor = (type) => {
    if (type === 'message') return <MessageCircle size={16} />;
    if (type === 'reaction') return <ThumbsUp size={16} />;
    return <Bell size={16} />;
  };

  return (
    <Shell rightRail={null}>
      <div className="page-stack">
        <div className="page-title">
          <div>
            <h2>Thông báo</h2>
            <p>Bình luận, lượt thích, tin nhắn và cập nhật mới.</p>
          </div>
          <button className="ghost-btn" type="button" onClick={() => markAllNotificationsRead(user?.uid)}>
            <CheckCheck size={16} />
            Đánh dấu đã đọc
          </button>
        </div>

        <section className="card notification-panel">
          {notifications.length ? notifications.map((item) => {
            const author = item.fromUid ? state.users?.[item.fromUid] : null;
            return (
              <button
                key={item.id}
                type="button"
                className={`notification-item ${item.read ? 'read' : ''}`}
                onClick={() => {
                  if (item.linkKind === 'room' && item.linkId) navigate(`/messenger`);
                  if (item.linkKind === 'post' && item.linkId) window.location.hash = `post-${item.linkId}`;
                }}
              >
                <div className="notification-icon">{iconFor(item.type)}</div>
                <Avatar src={author?.photoURL} name={author?.displayName} size={42} />
                <div className="notification-copy">
                  <strong>{item.text}</strong>
                  <small>{author?.displayName || 'Hệ thống'} · {new Date(item.createdAt).toLocaleString('vi-VN')}</small>
                </div>
              </button>
            );
          }) : (
            <EmptyState
              icon="🔔"
              title="Chưa có thông báo"
              description="Khi ai đó thích, bình luận hoặc nhắn tin cho bạn, thông báo sẽ xuất hiện ở đây."
            />
          )}
        </section>
      </div>
    </Shell>
  );
}
