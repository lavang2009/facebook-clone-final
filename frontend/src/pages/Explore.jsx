import React, { useMemo } from 'react';
import { Compass, Flame, ImagePlay, LayoutGrid, Newspaper, Users } from 'lucide-react';
import Shell from '../components/Shell';
import Avatar from '../components/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { selectMediaPosts, selectSuggestedTopics, useAppState } from '../lib/db';
import { useNavigate } from 'react-router-dom';

function ExploreCard({ icon, title, description, onClick }) {
  return (
    <button className="explore-card" type="button" onClick={onClick}>
      <div className="explore-icon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <small>{description}</small>
      </div>
    </button>
  );
}

export default function Explore() {
  const { user } = useAuth();
  const state = useAppState();
  const navigate = useNavigate();

  const topics = useMemo(() => selectSuggestedTopics(state), [state.posts]);
  const videos = useMemo(() => selectMediaPosts(state, user?.uid, 'video'), [state.posts, user?.uid]);
  const photos = useMemo(() => selectMediaPosts(state, user?.uid, 'image'), [state.posts, user?.uid]);
  const people = useMemo(() => Object.values(state.users || {}).filter((item) => item.uid !== user?.uid).slice(0, 8), [state.users, user?.uid]);

  return (
    <Shell rightRail={null}>
      <div className="page-stack">
        <div className="page-title">
          <div>
            <h2>Khám phá nhanh</h2>
            <p>Giao diện gọn, nội dung nổi bật, không hiển thị số lượng tài khoản.</p>
          </div>
        </div>

        <div className="explore-grid">
          <ExploreCard icon={<Compass size={18} />} title="Mở rộng nội dung" description="Khám phá bài viết, reel và chủ đề đang nổi" onClick={() => navigate('/')} />
          <ExploreCard icon={<Newspaper size={18} />} title="Bài viết nổi bật" description="Xem những bài đăng gần đây trên bản tin" onClick={() => navigate('/')} />
          <ExploreCard icon={<ImagePlay size={18} />} title="Video nổi bật" description="Mở nhanh thư viện reel/video" onClick={() => navigate('/reels')} />
          <ExploreCard icon={<Users size={18} />} title="Người dùng thật" description="Chỉ hiện tài khoản đã đăng ký" onClick={() => navigate('/profile')} />
        </div>

        <section className="card explore-section">
          <div className="section-head">
            <div>
              <h3>Chủ đề đang được nhắc đến</h3>
              <p>Tổng hợp nhẹ từ các bài viết có sẵn</p>
            </div>
          </div>
          <div className="topic-cloud">
            {topics.length ? topics.map((topic) => <span key={topic.name} className="topic-pill">#{topic.name}</span>) : <div className="empty-inline">Chưa có chủ đề nổi bật.</div>}
          </div>
        </section>

        <section className="card explore-section">
          <div className="section-head">
            <div>
              <h3>Ảnh & video nổi bật</h3>
              <p>Chạm để xem nhanh</p>
            </div>
          </div>
          <div className="media-grid">
            {[...videos, ...photos].slice(0, 8).map((item) => (
              <button key={item.id} type="button" className="media-tile" onClick={() => navigate(`/profile/${item.uid}`)}>
                {item.mediaType?.startsWith('video') ? <video src={item.mediaUrl} muted playsInline /> : <img src={item.mediaUrl} alt="" />}
                <div className="media-tile-copy">
                  <Avatar src={item.authorPhoto} name={item.authorName} size={32} />
                  <div>
                    <strong>{item.authorName}</strong>
                    <small>{item.kind === 'reel' ? 'Thước phim' : 'Bài đăng có media'}</small>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="card explore-section">
          <div className="section-head">
            <div>
              <h3>Người dùng thật</h3>
              <p>Không hiển thị thống kê số lượng tài khoản</p>
            </div>
          </div>
          <div className="people-grid">
            {people.length ? people.map((item) => (
              <button key={item.uid} type="button" className="person-card" onClick={() => navigate(`/profile/${item.uid}`)}>
                <Avatar src={item.photoURL} name={item.displayName} size={48} />
                <strong>{item.displayName}</strong>
                <small>{item.bio || item.city || 'Tài khoản thật'}</small>
              </button>
            )) : <div className="empty-inline">Chưa có tài khoản khác trong trình duyệt này.</div>}
          </div>
        </section>
      </div>
    </Shell>
  );
}
