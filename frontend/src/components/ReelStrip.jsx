import React from 'react';
import { Play, Tv2 } from 'lucide-react';
import Avatar from './Avatar';

export default function ReelStrip({ reels = [], onCreateReel, onOpenReel }) {
  const active = reels.filter((item) => !item.expiresAt || Number(item.expiresAt) > Date.now()).slice(0, 8);

  return (
    <section className="card reel-strip">
      <div className="section-head">
        <div>
          <h3>Thước phim</h3>
          <p>Video ngắn cuốn mắt</p>
        </div>
        <button className="text-btn" type="button" onClick={onCreateReel}>Đăng reel</button>
      </div>

      <div className="reel-track">
        <button className="reel-card reel-create" type="button" onClick={onCreateReel}>
          <Tv2 size={18} />
          <strong>Tạo reel</strong>
          <small>Video dọc, ngắn gọn</small>
        </button>

        {active.map((reel) => (
          <button key={reel.id} type="button" className="reel-card" onClick={() => onOpenReel?.(reel)}>
            {reel.mediaUrl ? <video src={reel.mediaUrl} muted playsInline /> : <div className="reel-placeholder" />}
            <span className="reel-play"><Play size={18} /></span>
            <Avatar src={reel.authorPhoto} name={reel.authorName} size={34} className="reel-avatar" />
            <strong>{reel.authorName}</strong>
            <small>{reel.content || 'Thước phim mới'}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
