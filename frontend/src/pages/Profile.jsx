import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Shell from '../components/Shell';
import Composer from '../components/Composer';
import EmptyState from '../components/EmptyState';
import ProfileHeader from '../components/ProfileHeader';
import PostCard from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { selectMediaForProfile, useAppState } from '../lib/db';

const tabs = [
  { key: 'posts', label: 'Bài viết' },
  { key: 'photos', label: 'Ảnh' },
  { key: 'videos', label: 'Video' },
  { key: 'reels', label: 'Reels' },
  { key: 'about', label: 'Giới thiệu' }
];

export default function Profile() {
  const { uid } = useParams();
  const { user, profile } = useAuth();
  const state = useAppState();
  const navigate = useNavigate();
  const [tab, setTab] = useState('posts');

  const activeUid = uid || user?.uid;
  const activeProfile = activeUid ? state.users?.[activeUid] : null;
  const isOwnProfile = activeUid === user?.uid;
  const media = useMemo(() => selectMediaForProfile(state, activeUid), [state.posts, activeUid]);


  const posts = useMemo(() => (state.posts || [])
    .filter((post) => post.uid === activeUid && post.kind === 'post')
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)), [state.posts, activeUid]);

  const photos = media.photos;
  const videos = media.videos;
  const reels = media.reels;

  const profileForHeader = useMemo(() => activeProfile ? ({
    ...activeProfile,
    postCount: posts.length,
    photoCount: photos.length,
    videoCount: videos.length
  }) : null, [activeProfile, posts.length, photos.length, videos.length]);

  const onMessage = () => navigate(`/messenger?to=${activeUid}`);

  return (
    <Shell rightRail={null}>
      <div className="page-stack">
        <ProfileHeader profile={profileForHeader} isOwnProfile={isOwnProfile} onMessage={onMessage} />

        <div className="tab-bar card">
          {tabs.map((item) => (
            <button key={item.key} className={`tab-btn ${tab === item.key ? 'active' : ''}`} type="button" onClick={() => setTab(item.key)}>
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'about' && activeProfile && (
          <section className="card about-card">
            <div className="about-grid">
              <div className="about-row"><strong>Tiểu sử</strong><span>{activeProfile.bio || 'Chưa có thông tin.'}</span></div>
              <div className="about-row"><strong>Công việc</strong><span>{activeProfile.work || 'Chưa cập nhật'}</span></div>
              <div className="about-row"><strong>Học vấn</strong><span>{activeProfile.education || 'Chưa cập nhật'}</span></div>
              <div className="about-row"><strong>Thành phố</strong><span>{activeProfile.city || 'Chưa cập nhật'}</span></div>
              <div className="about-row"><strong>Website</strong><span>{activeProfile.website || 'Chưa cập nhật'}</span></div>
              <div className="about-row"><strong>Tình trạng</strong><span>{activeProfile.relationship || 'Chưa cập nhật'}</span></div>
            </div>
          </section>
        )}

        {tab === 'posts' && (
          <>
            {isOwnProfile && <Composer />}
            <div className="feed-list">
              {posts.length ? posts.map((post) => (
                <PostCard key={post.id} post={post} onOpenProfile={(to) => navigate(`/profile/${to}`)} />
              )) : (
                <EmptyState
                  icon="📝"
                  title="Chưa có bài viết"
                  description={isOwnProfile ? 'Bạn hãy tạo bài viết đầu tiên của mình.' : 'Người dùng này chưa đăng bài nào.'}
                  action={isOwnProfile ? <button className="primary-btn" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Tạo bài viết</button> : null}
                />
              )}
            </div>
          </>
        )}

        {tab === 'photos' && (
          <section className="card media-section">
            <div className="media-grid">
              {photos.length ? photos.map((post) => (
                <button key={post.id} className="media-tile" type="button" onClick={() => navigate(`/#post-${post.id}`)}>
                  <img src={post.mediaUrl} alt="" />
                  <div className="media-tile-copy">
                    <strong>{post.authorName}</strong>
                    <small>{post.content || 'Ảnh'}</small>
                  </div>
                </button>
              )) : <EmptyState icon="📷" title="Chưa có ảnh" description="Tải lên ảnh đầu tiên để hình ảnh xuất hiện ở đây." />}
            </div>
          </section>
        )}

        {tab === 'videos' && (
          <section className="card media-section">
            <div className="media-grid">
              {videos.length ? videos.map((post) => (
                <button key={post.id} className="media-tile" type="button" onClick={() => navigate(`/reels`)}>
                  <video src={post.mediaUrl} muted playsInline />
                  <div className="media-tile-copy">
                    <strong>{post.authorName}</strong>
                    <small>{post.content || 'Video'}</small>
                  </div>
                </button>
              )) : <EmptyState icon="🎥" title="Chưa có video" description="Đăng video để tạo thư viện riêng." />}
            </div>
          </section>
        )}

        {tab === 'reels' && (
          <section className="card media-section">
            <div className="media-grid">
              {reels.length ? reels.map((post) => (
                <button key={post.id} className="media-tile" type="button" onClick={() => navigate('/reels')}>
                  <video src={post.mediaUrl} muted playsInline />
                  <div className="media-tile-copy">
                    <strong>{post.authorName}</strong>
                    <small>{post.content || 'Thước phim'}</small>
                  </div>
                </button>
              )) : <EmptyState icon="🎬" title="Chưa có thước phim" description="Đăng reel đầu tiên để xuất hiện ở đây." />}
            </div>
          </section>
        )}
      </div>
    </Shell>
  );
}
