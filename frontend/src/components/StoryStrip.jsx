import React from 'react';
import { Plus } from 'lucide-react';
import Avatar from './Avatar';

export default function StoryStrip({ stories = [], onCreateStory, onOpenStory }) {
  const active = stories.filter((item) => !item.expiresAt || Number(item.expiresAt) > Date.now()).slice(0, 12);

  return (
    <section className="story-strip card">
      <div className="section-head">
        <div>
          <h3>Tin</h3>
          <p>Cập nhật trong 24 giờ</p>
        </div>
        <button className="text-btn" type="button" onClick={onCreateStory}>Tạo tin</button>
      </div>

      <div className="story-track">
        <button className="story-card story-create" type="button" onClick={onCreateStory}>
          <span className="story-plus"><Plus size={18} /></span>
          <strong>Tạo tin</strong>
          <small>Ảnh hoặc video</small>
        </button>

        {active.map((story) => (
          <button
            key={story.id}
            type="button"
            className="story-card"
            onClick={() => onOpenStory?.(story)}
            style={{
              backgroundImage: story.mediaUrl
                ? `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.7)), url(${story.mediaUrl})`
                : 'linear-gradient(135deg, #2563eb, #7c3aed)'
            }}
          >
            <Avatar src={story.authorPhoto} name={story.authorName} size={42} />
            <strong>{story.authorName}</strong>
            <small>{story.content || 'Tin mới'}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
