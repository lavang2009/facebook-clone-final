import React, { useEffect, useRef } from 'react';
import { Edit3, Flag, Link2, Pin, Save, Trash2, X } from 'lucide-react';

export default function PostMenu({ open, isOwner, isPinned, onClose, onAction }) {
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose?.();
    };
    window.addEventListener('mousedown', onDoc);
    return () => window.removeEventListener('mousedown', onDoc);
  }, [onClose]);

  if (!open) return null;

  const ownerItems = [
    { key: 'edit', label: 'Chỉnh sửa bài viết', icon: <Edit3 size={16} /> },
    { key: 'pin', label: isPinned ? 'Bỏ ghim bài viết' : 'Ghim lên đầu trang', icon: <Pin size={16} /> },
    { key: 'delete', label: 'Xoá bài viết', icon: <Trash2 size={16} />, danger: true }
  ];

  const otherItems = [
    { key: 'save', label: 'Lưu bài viết', icon: <Save size={16} /> },
    { key: 'hide', label: 'Ẩn bài viết', icon: <X size={16} /> },
    { key: 'report', label: 'Báo cáo bài viết', icon: <Flag size={16} /> },
    { key: 'copy', label: 'Sao chép liên kết', icon: <Link2 size={16} /> }
  ];

  const items = isOwner ? ownerItems : otherItems;

  return (
    <div className="post-menu" ref={ref}>
      <div className="post-menu-head">
        <strong>Tuỳ chọn</strong>
        <button className="icon-btn" type="button" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      <div className="post-menu-list">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`post-menu-item ${item.danger ? 'danger' : ''}`}
            onClick={() => onAction?.(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
