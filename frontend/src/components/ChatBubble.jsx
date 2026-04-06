import React from 'react';
import Avatar from './Avatar';
import { timeAgo } from '../lib/db';

export function ChatBubble({ message, mine, author }) {
  return (
    <div className={`chat-bubble ${mine ? 'mine' : 'theirs'}`}>
      {!mine && <Avatar src={author?.photoURL} name={author?.displayName} size={28} />}
      <div className="bubble-card">
        {message.mediaUrl && message.mediaType === 'image' && <img src={message.mediaUrl} alt="" className="bubble-image" />}
        {message.mediaUrl && message.mediaType === 'video' && <video src={message.mediaUrl} controls className="bubble-video" />}
        {message.text && <p>{message.text}</p>}
        <small>{timeAgo(message.createdAt)}</small>
      </div>
    </div>
  );
}
