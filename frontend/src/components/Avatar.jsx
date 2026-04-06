import React, { useMemo } from 'react';

function hashString(value = '') {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function Avatar({ src = '', name = '', size = 40, className = '' }) {
  const initials = useMemo(() => {
    const parts = String(name || 'Người dùng').trim().split(/\s+/).filter(Boolean);
    const chars = parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
    return chars || 'U';
  }, [name]);

  const hue = hashString(name || 'user') % 360;
  const style = {
    width: size,
    height: size,
    background: `linear-gradient(135deg, hsl(${hue} 92% 58%), hsl(${(hue + 48) % 360} 90% 50%))`
  };

  if (src) {
    return <img className={`avatar ${className}`} src={src} alt={name || 'avatar'} style={{ width: size, height: size }} />;
  }

  return (
    <div className={`avatar avatar-fallback ${className}`} style={style} aria-label={name || 'avatar'}>
      <span>{initials}</span>
    </div>
  );
}
