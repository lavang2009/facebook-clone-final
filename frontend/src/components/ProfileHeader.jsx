import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Edit3, MapPin, Link2, UserPlus, MessageCircle } from 'lucide-react';
import Avatar from './Avatar';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { uploadMedia } from '../lib/upload';

export default function ProfileHeader({ profile, isOwnProfile, onMessage }) {
  const { updateMyProfile, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [city, setCity] = useState(profile?.city || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [work, setWork] = useState(profile?.work || '');
  const [education, setEducation] = useState(profile?.education || '');
  const [relationship, setRelationship] = useState(profile?.relationship || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const avatarRef = useRef(null);
  const coverRef = useRef(null);

  useEffect(() => {
    setDisplayName(profile?.displayName || '');
    setBio(profile?.bio || '');
    setCity(profile?.city || '');
    setWebsite(profile?.website || '');
    setWork(profile?.work || '');
    setEducation(profile?.education || '');
    setRelationship(profile?.relationship || '');
  }, [profile?.uid, profile?.displayName, profile?.bio, profile?.city, profile?.website, profile?.work, profile?.education, profile?.relationship]);


  const stats = useMemo(() => profile ? [
    { label: 'Bài viết', value: profile.postCount ?? 0 },
    { label: 'Ảnh', value: profile.photoCount ?? 0 },
    { label: 'Video', value: profile.videoCount ?? 0 }
  ] : [], [profile]);

  if (!profile) return null;

  const save = async () => {
    setBusy(true);
    try {
      let nextAvatar = profile.photoURL || '';
      let nextCover = profile.coverURL || '';

      if (avatarFile) {
        const uploaded = await uploadMedia(avatarFile, { uid: user.uid, kind: 'avatar' });
        nextAvatar = uploaded.url;
      }
      if (coverFile) {
        const uploaded = await uploadMedia(coverFile, { uid: user.uid, kind: 'cover' });
        nextCover = uploaded.url;
      }

      await updateMyProfile({
        displayName,
        bio,
        city,
        website,
        work,
        education,
        relationship,
        photoURL: nextAvatar,
        coverURL: nextCover
      });

      setEditing(false);
      setBusy(false);
    } catch (error) {
      alert(error.message || 'Không thể cập nhật hồ sơ.');
      setBusy(false);
    }
  };

  return (
    <>
      <section className="profile-hero card">
        <div className="profile-cover" style={{ backgroundImage: profile.coverURL ? `url(${profile.coverURL})` : 'linear-gradient(135deg, #1d4ed8, #8b5cf6)' }}>
          {isOwnProfile && (
            <button className="cover-edit" type="button" onClick={() => coverRef.current?.click()}>
              <Camera size={16} />
              Ảnh bìa
            </button>
          )}
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="profile-body">
          <div className="profile-avatar-wrap">
            <Avatar src={profile.photoURL} name={profile.displayName} size={150} />
            {isOwnProfile && (
              <button className="avatar-edit" type="button" onClick={() => avatarRef.current?.click()}>
                <Camera size={16} />
              </button>
            )}
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="profile-info">
            <div className="profile-title-row">
              <div>
                <h1>{profile.displayName}</h1>
                <p>{profile.bio || 'Chưa có tiểu sử.'}</p>
              </div>
              <div className="profile-actions">
                {isOwnProfile ? (
                  <button className="primary-btn" type="button" onClick={() => setEditing(true)}>
                    <Edit3 size={16} />
                    Chỉnh sửa hồ sơ
                  </button>
                ) : (
                  <>
                    <button className="primary-btn" type="button" onClick={onMessage}>
                      <MessageCircle size={16} />
                      Nhắn tin
                    </button>
                    <button className="ghost-btn" type="button" onClick={() => alert('Tính năng kết nối bạn bè sẽ mở rộng sau.')}>
                      <UserPlus size={16} />
                      Kết bạn
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="profile-meta">
              {profile.city && <span><MapPin size={14} /> {profile.city}</span>}
              {profile.website && <span><Link2 size={14} /> {profile.website}</span>}
              {profile.work && <span>💼 {profile.work}</span>}
              {profile.education && <span>🎓 {profile.education}</span>}
              {profile.relationship && <span>💞 {profile.relationship}</span>}
            </div>

            <div className="profile-stats">
              {stats.map((item) => (
                <div key={item.label} className="profile-stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Modal open={editing} title="Chỉnh sửa hồ sơ" onClose={() => setEditing(false)} maxWidth={780}>
        <div className="profile-editor">
          <div className="composer-grid">
            <label className="field">
              <span>Tên hiển thị</span>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </label>
            <label className="field">
              <span>Thành phố</span>
              <input value={city} onChange={(e) => setCity(e.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Giới thiệu</span>
            <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
          </label>
          <div className="composer-grid">
            <label className="field">
              <span>Website</span>
              <input value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
            <label className="field">
              <span>Công việc</span>
              <input value={work} onChange={(e) => setWork(e.target.value)} />
            </label>
          </div>
          <div className="composer-grid">
            <label className="field">
              <span>Học vấn</span>
              <input value={education} onChange={(e) => setEducation(e.target.value)} />
            </label>
            <label className="field">
              <span>Tình trạng</span>
              <input value={relationship} onChange={(e) => setRelationship(e.target.value)} />
            </label>
          </div>

          <div className="profile-editor-note">
            Ảnh đại diện và ảnh bìa sẽ được lưu lại sau khi tải trang.
          </div>

          <div className="composer-footer">
            <button className="ghost-btn" type="button" onClick={() => setEditing(false)}>
              Huỷ
            </button>
            <button className="primary-btn" type="button" onClick={save} disabled={busy}>
              {busy ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
