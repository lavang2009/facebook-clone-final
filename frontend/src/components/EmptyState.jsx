import React from 'react';

export default function EmptyState({ title, description, action, icon }) {
  return (
    <div className="empty-state card">
      <div className="empty-icon">{icon || '✨'}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
