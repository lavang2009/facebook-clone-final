import React from 'react';
import { reactionsMeta } from '../lib/db';

const order = ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'];

export default function ReactionMenu({ onSelect, className = '' }) {
  return (
    <div className={`reaction-popover ${className}`}>
      {order.map((key) => {
        const meta = reactionsMeta[key];
        return (
          <button
            key={key}
            type="button"
            className="reaction-pill"
            onClick={() => onSelect?.(key)}
            title={meta.label}
          >
            <span>{meta.icon}</span>
            <small>{meta.label}</small>
          </button>
        );
      })}
    </div>
  );
}
