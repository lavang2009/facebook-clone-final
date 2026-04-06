import React, { useMemo, useState } from 'react';
import { ChevronRight, CirclePlay, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell';
import Composer from '../components/Composer';
import StoryStrip from '../components/StoryStrip';
import ReelStrip from '../components/ReelStrip';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import {
  selectFeedPosts,
  selectReels,
  selectStories,
  selectSuggestedTopics,
  useAppState
} from '../lib/db';

function MiniCard({ title, description, onClick, icon }) {
  return (
    <button className="mini-card" type="button" onClick={onClick}>
      <div className="mini-icon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <small>{description}</small>
      </div>
      <ChevronRight size={16} />
    </button>
  );
}

export default function Home() {
  const { user, profile } = useAuth();
  const state = useAppState();
  const navigate = useNavigate();
  const [storyViewer, setStoryViewer] = useState(null);
  const [reelViewer, setReelViewer] = useState(null);

  const feed = useMemo(() => selectFeedPosts(state, user?.uid), [state.posts, state.comments, user?.uid]);
  const stories = useMemo(() => selectStories(state, user?.uid), [state.posts, user?.uid]);
  const reels = useMemo(() => selectReels(state, user?.uid), [state.posts, user?.uid]);
  const topics = useMemo(() => selectSuggestedTopics(state), [state.posts]);
  const suggestions = useMemo(() => Object.values(state.users || {})
    .filter((item) => item.uid !== user?.uid)
    .slice(0, 5), [state.users, user?.uid]);

  const rightRail = (
    <div className="rail-stack">
      <div className="card rail-card">
        <div className="section-head">
          <div>
            <h3>Khám phá nhanh</h3>
            <p>Những lối tắt gọn như Facebook</p>
          </div>
        </div>
        <div className="rail-grid">
          <MiniCard title="Tin" description="Đăng ảnh hoặc video 24h" icon={<CirclePlay size={18} />} onClick={() => navigate('/stories')} />
          <MiniCard title="Thước phim" description="Video ngắn, cuốn mắt" icon={<Sparkles size={18} />} onClick={() => navigate('/reels')} />
        </div>
      </div>

      <div className="card rail-card">
        <div className="section-head">
          <div>
            <h3>Gợi ý chủ đề</h3>
            <p>Từ những bài viết gần đây</p>
          </div>
        </div>
        <div className="topic-cloud">
          {topics.length ? topics.map((topic) => (
            <span key={topic.name} className="topic-pill">#{topic.name}</span>
          )) : <div className="empty-inline">Chưa có chủ đề nổi bật.</div>}
        </div>
      </div>

      <div className="card rail-card">
        <div className="section-head">
          <div>
            <h3>Mọi người bạn có thể biết</h3>
            <p>Chỉ hiển thị tài khoản thật</p>
          </div>
        </div>
        <div className="suggestion-list">
          {suggestions.length ? suggestions.map((item) => (
            <button key={item.uid} type="button" className="suggestion-item" onClick={() => navigate(`/profile/${item.uid}`)}>
              <Avatar src={item.photoURL} name={item.displayName} size={42} />
              <div>
                <strong>{item.displayName}</strong>
                <small>{item.bio || item.city || 'Người dùng thật'}</small>
              </div>
            </button>
          )) : <div className="empty-inline">Chưa có tài khoản khác trên trình duyệt này.</div>}
        </div>
      </div>
    </div>
  );

  return (
    <Shell rightRail={rightRail}>
      <div className="page-stack">
        <Composer />

        <StoryStrip
          stories={stories}
          onCreateStory={() => navigate('/stories')}
          onOpenStory={(story) => setStoryViewer(story)}
        />

        <ReelStrip
          reels={reels}
          onCreateReel={() => navigate('/reels')}
          onOpenReel={(reel) => setReelViewer(reel)}
        />

        <div className="feed-list">
          {feed.length ? feed.map((post) => (
            <PostCard key={post.id} post={post} onOpenProfile={(uid) => navigate(`/profile/${uid}`)} />
          )) : (
            <EmptyState
              icon="📰"
              title="Bản tin chưa có nội dung"
              description="Hãy tạo bài viết đầu tiên, đăng tin hoặc đăng thước phim để bắt đầu."
              action={<button className="primary-btn" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Đăng nội dung</button>}
            />
          )}
        </div>
      </div>

      <Modal open={Boolean(storyViewer)} title="Xem tin" onClose={() => setStoryViewer(null)} maxWidth={560}>
        {storyViewer && (
          <div className="viewer-card">
            {storyViewer.mediaUrl ? (
              storyViewer.mediaType === 'video' ? (
                <video src={storyViewer.mediaUrl} controls autoPlay muted playsInline />
              ) : (
                <img src={storyViewer.mediaUrl} alt="" />
              )
            ) : <div className="viewer-placeholder" />}
            <div className="viewer-meta">
              <strong>{storyViewer.authorName}</strong>
              <p>{storyViewer.content || 'Tin mới'}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={Boolean(reelViewer)} title="Xem thước phim" onClose={() => setReelViewer(null)} maxWidth={560}>
        {reelViewer && (
          <div className="viewer-card">
            {reelViewer.mediaUrl ? (
              <video src={reelViewer.mediaUrl} controls autoPlay playsInline />
            ) : <div className="viewer-placeholder" />}
            <div className="viewer-meta">
              <strong>{reelViewer.authorName}</strong>
              <p>{reelViewer.content || 'Thước phim'}</p>
            </div>
          </div>
        )}
      </Modal>
    </Shell>
  );
}
