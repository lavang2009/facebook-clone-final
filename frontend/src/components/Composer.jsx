import React, { useMemo, useRef, useState } from 'react';
import { Image, PlusCircle, SendHorizontal, Smile, SquarePlay, Tag, MapPin, Newspaper, Feather, Tv2, X } from 'lucide-react';
import Avatar from './Avatar';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { createPost, formatCount } from '../lib/db';
import { uploadMedia } from '../lib/upload';

const modeMeta = {
  post: {
    title: 'Đăng bài viết',
    button: 'Đăng bài',
    placeholder: 'Bạn đang nghĩ gì?',
    icon: <Newspaper size={16} />
  },
  story: {
    title: 'Đăng tin',
    button: 'Tạo tin',
    placeholder: 'Thêm vài dòng cho tin của bạn...',
    icon: <Feather size={16} />
  },
  reel: {
    title: 'Đăng thước phim',
    button: 'Đăng reel',
    placeholder: 'Viết caption ngắn cho thước phim...',
    icon: <Tv2 size={16} />
  }
};

export default function Composer() {
  const { user, profile } = useAuth();
  const [openMode, setOpenMode] = useState('');
  const [text, setText] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [location, setLocation] = useState('');
  const [feeling, setFeeling] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const activeMeta = modeMeta[openMode || 'post'];

  const reset = () => {
    setText('');
    setPrivacy('public');
    setLocation('');
    setFeeling('');
    setFile(null);
    setPreview('');
    setError('');
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const open = (mode) => {
    setOpenMode(mode);
    setError('');
  };

  const close = () => {
    setOpenMode('');
    reset();
  };

  const pickFile = (event) => {
    const next = event.target.files?.[0] || null;
    setFile(next);
    setError('');
    if (next) {
      const reader = new FileReader();
      reader.onload = () => setPreview(String(reader.result || ''));
      reader.readAsDataURL(next);
    } else {
      setPreview('');
    }
  };

  const submit = async () => {
    if (!user || !profile) return;
    if (!text.trim() && !file) {
      setError('Hãy nhập nội dung hoặc chọn ảnh/video.');
      return;
    }

    if (openMode === 'reel') {
      if (!file) {
        setError('Hãy chọn một video cho thước phim.');
        return;
      }
      if (!String(file.type || '').startsWith('video/')) {
        setError('Thước phim cần video.');
        return;
      }
    }

    setBusy(true);
    try {
      let mediaUrl = '';
      let mediaType = '';
      if (file) {
        const uploaded = await uploadMedia(file, { uid: user.uid, kind: openMode || 'post' });
        mediaUrl = uploaded.url;
        mediaType = uploaded.mediaType;
      }

      createPost({
        uid: user.uid,
        kind: openMode || 'post',
        content: text,
        mediaUrl,
        mediaType,
        privacy,
        location,
        feeling,
        background: ''
      });

      close();
    } catch (err) {
      setError(err.message || 'Không thể đăng nội dung.');
      setBusy(false);
    }
  };

  const toolbar = useMemo(() => [
    { label: 'Ảnh/Video', icon: <Image size={16} />, onClick: () => fileRef.current?.click() },
    { label: 'Cảm xúc', icon: <Smile size={16} />, onClick: () => setFeeling(feeling ? '' : '✨ Đang cảm thấy tuyệt vời') },
    { label: 'Vị trí', icon: <MapPin size={16} />, onClick: () => setLocation(location ? '' : 'Địa điểm hiện tại') },
    { label: 'Gắn thẻ', icon: <Tag size={16} />, onClick: () => alert('Gắn thẻ sẽ được mở rộng sau.') }
  ], [feeling, location]);

  return (
    <>
      <div className="card composer-card">
        <div className="composer-top">
          <Avatar src={profile?.photoURL || user?.photoURL} name={profile?.displayName || user?.displayName} size={48} />
          <button className="composer-input" type="button" onClick={() => open('post')}>
            <span>{profile?.displayName || 'Người dùng'}</span>
            <small>Hôm nay bạn muốn chia sẻ điều gì?</small>
          </button>
        </div>

        <div className="composer-quick-actions">
          <button className="composer-action" type="button" onClick={() => open('post')}>
            <Newspaper size={16} />
            <span>Bài viết</span>
          </button>
          <button className="composer-action" type="button" onClick={() => open('story')}>
            <Feather size={16} />
            <span>Đăng tin</span>
          </button>
          <button className="composer-action" type="button" onClick={() => open('reel')}>
            <Tv2 size={16} />
            <span>Thước phim</span>
          </button>
        </div>
      </div>

      <Modal open={Boolean(openMode)} title={activeMeta.title} onClose={close} maxWidth={760}>
        <div className="composer-modal">
          <div className="composer-modal-head">
            <Avatar src={profile?.photoURL || user?.photoURL} name={profile?.displayName || user?.displayName} size={52} />
            <div>
              <strong>{profile?.displayName || user?.displayName || 'Người dùng'}</strong>
              <small>{profile?.bio || 'Chia sẻ thật, đăng thật.'}</small>
            </div>
          </div>

          <label className="field">
            <span>Nội dung</span>
            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={activeMeta.placeholder}
            />
          </label>

          <div className="composer-toolbar">
            {toolbar.map((item) => (
              <button key={item.label} type="button" className="tool-chip" onClick={item.onClick}>
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            hidden
            onChange={pickFile}
          />

          <div className="composer-grid">
            <label className="field">
              <span>Quyền riêng tư</span>
              <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
                <option value="public">Công khai</option>
                <option value="friends">Bạn bè</option>
                <option value="only_me">Chỉ mình tôi</option>
              </select>
            </label>
            <label className="field">
              <span>Vị trí</span>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Địa điểm (tuỳ chọn)" />
            </label>
          </div>

          <label className="field">
            <span>Cảm xúc/hoạt động</span>
            <input value={feeling} onChange={(e) => setFeeling(e.target.value)} placeholder="Ví dụ: đang uống cà phê..." />
          </label>

          {preview && (
            <div className="composer-preview">
              {file?.type?.startsWith('video/') ? <video src={preview} controls /> : <img src={preview} alt="preview" />}
            </div>
          )}

          <div className="composer-footer">
            <button className="ghost-btn" type="button" onClick={close}>
              Huỷ
            </button>
            <button className="primary-btn" type="button" onClick={submit} disabled={busy}>
              {busy ? 'Đang đăng...' : activeMeta.button}
            </button>
          </div>
          {error && <div className="form-error">{error}</div>}
        </div>
      </Modal>
    </>
  );
}
