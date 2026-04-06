import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell';
import Composer from '../components/Composer';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { selectStories, useAppState } from '../lib/db';

export default function Stories() {
  const { user } = useAuth();
  const state = useAppState();
  const navigate = useNavigate();
  const [viewer, setViewer] = useState(null);
  const stories = useMemo(() => selectStories(state, user?.uid), [state.posts, user?.uid]);

  return (
    <Shell rightRail={null}>
      <div className="page-stack">
        <div className="page-title">
          <div>
            <h2>Tin</h2>
            <p>Đăng ảnh hoặc video ngắn, tự động hiển thị trong 24 giờ.</p>
          </div>
          <button className="primary-btn" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Tạo tin mới
          </button>
        </div>

        <Composer />

        <div className="story-grid">
          {stories.length ? stories.map((story) => (
            <button key={story.id} className="story-tile large" type="button" onClick={() => setViewer(story)}>
              <div className="story-tile-bg" style={{ backgroundImage: story.mediaUrl ? `linear-gradient(180deg, rgba(0,0,0,.2), rgba(0,0,0,.75)), url(${story.mediaUrl})` : 'linear-gradient(135deg, #2563eb, #8b5cf6)' }} />
              <Avatar src={story.authorPhoto} name={story.authorName} size={44} />
              <div className="story-tile-copy">
                <strong>{story.authorName}</strong>
                <small>{story.content || 'Tin mới'}</small>
              </div>
            </button>
          )) : (
            <EmptyState
              icon="📷"
              title="Chưa có tin nào"
              description="Hãy tạo một tin đầu tiên bằng ảnh hoặc video để bắt đầu."
              action={<button className="primary-btn" type="button" onClick={() => navigate('/')}>Về Bản tin</button>}
            />
          )}
        </div>
      </div>

      <Modal open={Boolean(viewer)} title="Xem tin" onClose={() => setViewer(null)} maxWidth={560}>
        {viewer && (
          <div className="viewer-card">
            {viewer.mediaUrl ? (
              viewer.mediaType === 'video' ? (
                <video src={viewer.mediaUrl} controls autoPlay muted playsInline />
              ) : (
                <img src={viewer.mediaUrl} alt="" />
              )
            ) : <div className="viewer-placeholder" />}
            <div className="viewer-meta">
              <strong>{viewer.authorName}</strong>
              <p>{viewer.content || 'Tin mới'}</p>
            </div>
          </div>
        )}
      </Modal>
    </Shell>
  );
}
