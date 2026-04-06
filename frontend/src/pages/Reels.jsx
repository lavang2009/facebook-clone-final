import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell';
import Composer from '../components/Composer';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { selectReels, useAppState } from '../lib/db';

export default function Reels() {
  const { user } = useAuth();
  const state = useAppState();
  const navigate = useNavigate();
  const [viewer, setViewer] = useState(null);
  const reels = useMemo(() => selectReels(state, user?.uid), [state.posts, user?.uid]);

  return (
    <Shell rightRail={null}>
      <div className="page-stack">
        <div className="page-title">
          <div>
            <h2>Thước phim</h2>
            <p>Đăng video ngắn dọc, có hiệu ứng cuốn mắt và xem nhanh.</p>
          </div>
          <button className="primary-btn" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Đăng reel mới
          </button>
        </div>

        <Composer />

        <div className="reel-grid">
          {reels.length ? reels.map((reel) => (
            <button key={reel.id} className="reel-tile large" type="button" onClick={() => setViewer(reel)}>
              {reel.mediaUrl ? <video src={reel.mediaUrl} muted playsInline /> : <div className="reel-placeholder" />}
              <Avatar src={reel.authorPhoto} name={reel.authorName} size={42} />
              <div className="reel-tile-copy">
                <strong>{reel.authorName}</strong>
                <small>{reel.content || 'Thước phim mới'}</small>
              </div>
            </button>
          )) : (
            <EmptyState
              icon="🎬"
              title="Chưa có thước phim"
              description="Hãy đăng video đầu tiên để xuất hiện trong luồng reel."
              action={<button className="primary-btn" type="button" onClick={() => navigate('/')}>Về Bản tin</button>}
            />
          )}
        </div>
      </div>

      <Modal open={Boolean(viewer)} title="Xem thước phim" onClose={() => setViewer(null)} maxWidth={560}>
        {viewer && (
          <div className="viewer-card">
            {viewer.mediaUrl ? <video src={viewer.mediaUrl} controls autoPlay playsInline /> : <div className="viewer-placeholder" />}
            <div className="viewer-meta">
              <strong>{viewer.authorName}</strong>
              <p>{viewer.content || 'Thước phim'}</p>
            </div>
          </div>
        )}
      </Modal>
    </Shell>
  );
}
