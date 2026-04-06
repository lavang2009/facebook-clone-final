import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Ellipsis, MessageCircle, Send, Share2, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import Modal from './Modal';
import PostMenu from './PostMenu';
import ReactionMenu from './ReactionMenu';
import { useAuth } from '../contexts/AuthContext';
import {
  addComment,
  createNotification,
  deletePost,
  formatCount,
  getReaction,
  reactionsMeta,
  timeAgo,
  togglePinPost,
  toggleReaction,
  toggleSavePost,
  hidePost,
  updatePost,
  useAppState
} from '../lib/db';

export default function PostCard({ post, onOpenProfile }) {
  const { user, profile } = useAuth();
  const state = useAppState();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reactionOpen, setReactionOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content || '');
  const [editPrivacy, setEditPrivacy] = useState(post.privacy || 'public');
  const holdTimer = useRef(null);

  const comments = state.comments?.[post.id] || [];
  const owner = user?.uid === post.uid;
  const myReaction = getReaction(post, user?.uid);
  const reactionLabel = myReaction ? reactionsMeta[myReaction]?.label || 'Thích' : 'Thích';

  useEffect(() => {
    setEditText(post.content || '');
    setEditPrivacy(post.privacy || 'public');
  }, [post.id, post.content, post.privacy]);

  const handleReaction = async (reaction = 'like') => {
    if (!user) return;
    setBusy(true);
    try {
      const adding = myReaction !== reaction;
      const next = toggleReaction(post.id, user.uid, reaction);
      if (adding && next && post.uid !== user.uid && reaction !== 'hide') {
        createNotification({
          toUid: post.uid,
          fromUid: user.uid,
          type: 'reaction',
          text: `${profile?.displayName || 'Ai đó'} đã ${reactionsMeta[reaction]?.label?.toLowerCase() || 'thích'} bài viết của bạn.`,
          linkKind: 'post',
          linkId: post.id
        });
      }
    } catch (error) {
      alert(error.message || 'Không thể thực hiện thao tác.');
    } finally {
      setBusy(false);
      setReactionOpen(false);
    }
  };

  const handleLikeMouseDown = () => {
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setReactionOpen(true), 350);
  };

  const handleLikeMouseUp = () => {
    clearTimeout(holdTimer.current);
  };

  const submitComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    setBusy(true);
    try {
      addComment(post.id, profile, commentText.trim());
      setCommentText('');
      setExpanded(true);
    } catch (error) {
      alert(error.message || 'Không thể bình luận.');
    } finally {
      setBusy(false);
    }
  };

  const handleMenuAction = async (action) => {
    setMenuOpen(false);
    switch (action) {
      case 'edit':
        setEditing(true);
        break;
      case 'pin':
        togglePinPost(post.id, user.uid);
        break;
      case 'delete':
        if (window.confirm('Bạn có chắc muốn xoá bài viết này?')) deletePost(post.id);
        break;
      case 'save':
        toggleSavePost(post.id, user.uid);
        alert('Đã lưu bài viết.');
        break;
      case 'hide':
        hidePost(post.id, user.uid);
        alert('Bài viết đã được ẩn khỏi bản tin của bạn.');
        break;
      case 'report':
        alert('Đã ghi nhận báo cáo. Chức năng kiểm duyệt sẽ mở rộng sau.');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(`${window.location.origin}/#post-${post.id}`);
          alert('Đã sao chép liên kết.');
        } catch {
          alert('Không thể sao chép liên kết.');
        }
        break;
      default:
        break;
    }
  };

  const saveEdit = async () => {
    updatePost(post.id, { content: editText, privacy: editPrivacy });
    setEditing(false);
  };

  return (
    <article className="card post-card" id={`post-${post.id}`}>
      <div className="post-head">
        <button className="author-btn" type="button" onClick={() => {
          if (onOpenProfile) onOpenProfile(post.uid);
          else navigate(`/profile/${post.uid}`);
        }}>
          <Avatar src={post.authorPhoto} name={post.authorName} size={48} />
          <div>
            <strong>{post.authorName}</strong>
            <span>
              {timeAgo(post.createdAt)} · {post.privacy === 'public' ? 'Công khai' : post.privacy === 'friends' ? 'Bạn bè' : 'Chỉ mình tôi'}
            </span>
          </div>
        </button>

        <button className="icon-btn" type="button" onClick={() => setMenuOpen((v) => !v)}>
          <Ellipsis size={18} />
        </button>

        <PostMenu
          open={menuOpen}
          isOwner={owner}
          isPinned={Boolean(post.pinned)}
          onClose={() => setMenuOpen(false)}
          onAction={handleMenuAction}
        />
      </div>

      {(post.feeling || post.location) && (
        <div className="post-meta-line">
          {post.feeling && <span>😊 {post.feeling}</span>}
          {post.location && <span>📍 {post.location}</span>}
        </div>
      )}

      {post.content && <p className="post-text">{post.content}</p>}

      {post.mediaUrl && (
        <div className="post-media">
          {String(post.mediaType || '').startsWith('video') ? (
            <video src={post.mediaUrl} controls playsInline preload="metadata" />
          ) : (
            <img src={post.mediaUrl} alt="nội dung bài viết" />
          )}
        </div>
      )}

      <div className="post-stats">
        <span>{formatCount(post.likeCount || 0)} lượt thích</span>
        <span>{formatCount(post.commentCount || 0)} bình luận</span>
      </div>

      <div className="reaction-row">
        <button
          className={`reaction-trigger ${myReaction ? 'active' : ''}`}
          type="button"
          onMouseDown={handleLikeMouseDown}
          onMouseUp={handleLikeMouseUp}
          onMouseLeave={handleLikeMouseUp}
          onClick={() => !reactionOpen && handleReaction(myReaction ? myReaction : 'like')}
          disabled={busy}
        >
          <ThumbsUp size={16} />
          <span>{reactionLabel}</span>
        </button>

        <button className={`reaction-trigger ${expanded ? 'active' : ''}`} type="button" onClick={() => setExpanded((v) => !v)}>
          <MessageCircle size={16} />
          <span>Bình luận</span>
        </button>

        <button className="reaction-trigger" type="button" onClick={() => navigator.share ? navigator.share({ title: post.authorName, text: post.content || '', url: `${window.location.origin}/#post-${post.id}` }) : alert('Thiết bị không hỗ trợ chia sẻ.')}>
          <Share2 size={16} />
          <span>Chia sẻ</span>
        </button>

        {reactionOpen && (
          <ReactionMenu
            onSelect={(reaction) => handleReaction(reaction)}
            className="floating-reactions"
          />
        )}
      </div>

      <form className="comment-form" onSubmit={submitComment}>
        <Avatar src={profile?.photoURL} name={profile?.displayName} size={32} />
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Viết bình luận..."
        />
        <button className="icon-btn" type="submit" disabled={busy}>
          <Send size={16} />
        </button>
      </form>

      {expanded && (
        <div className="comment-list">
          {comments.length ? comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <Avatar src={comment.authorPhoto} name={comment.authorName} size={28} />
              <div>
                <strong>{comment.authorName}</strong>
                <p>{comment.text}</p>
              </div>
            </div>
          )) : <div className="empty-inline">Chưa có bình luận nào.</div>}
        </div>
      )}

      <Modal open={editing} title="Chỉnh sửa bài viết" onClose={() => setEditing(false)} maxWidth={640}>
        <div className="post-edit-form">
          <label className="field">
            <span>Nội dung</span>
            <textarea rows={5} value={editText} onChange={(e) => setEditText(e.target.value)} />
          </label>
          <label className="field">
            <span>Quyền riêng tư</span>
            <select value={editPrivacy} onChange={(e) => setEditPrivacy(e.target.value)}>
              <option value="public">Công khai</option>
              <option value="friends">Bạn bè</option>
              <option value="only_me">Chỉ mình tôi</option>
            </select>
          </label>
          <div className="composer-footer">
            <button className="ghost-btn" type="button" onClick={() => setEditing(false)}>Huỷ</button>
            <button className="primary-btn" type="button" onClick={saveEdit}>Lưu thay đổi</button>
          </div>
        </div>
      </Modal>
    </article>
  );
}
