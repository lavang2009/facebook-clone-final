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

  const isVideo = String(post.mediaType || '').includes('video');

  const handleReaction = async (reaction = 'like') => {
    if (!user) return;
    setBusy(true);
    try {
      const adding = myReaction !== reaction;
      const next = toggleReaction(post.id, user.uid, reaction);

      if (adding && next && post.uid !== user.uid) {
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
      alert(error.message || 'Lỗi.');
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

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setBusy(true);
    try {
      addComment(post.id, profile, commentText.trim());
      setCommentText('');
      setExpanded(true);
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
        if (window.confirm('Xoá bài viết?')) deletePost(post.id);
        break;
      case 'save':
        toggleSavePost(post.id, user.uid);
        break;
      case 'hide':
        hidePost(post.id, user.uid);
        break;
    }
  };

  const saveEdit = () => {
    updatePost(post.id, {
      content: editText,
      privacy: editPrivacy
    });
    setEditing(false);
  };

  return (
    <article className="card post-card" id={`post-${post.id}`}>

      {/* HEADER */}
      <div className="post-head">
        <button
          className="author-btn"
          onClick={() => onOpenProfile ? onOpenProfile(post.uid) : navigate(`/profile/${post.uid}`)}
        >
          <Avatar src={post.authorPhoto} name={post.authorName} size={48} />
          <div>
            <strong>{post.authorName}</strong>
            <span>{timeAgo(post.createdAt)}</span>
          </div>
        </button>

        <button className="icon-btn" onClick={() => setMenuOpen(v => !v)}>
          <Ellipsis size={18} />
        </button>

        <PostMenu
          open={menuOpen}
          isOwner={owner}
          onClose={() => setMenuOpen(false)}
          onAction={handleMenuAction}
        />
      </div>

      {/* CONTENT */}
      {post.content && <p className="post-text">{post.content}</p>}

      {/* MEDIA FIX */}
      {post.mediaUrl && (
        <div className="post-media">
          {isVideo ? (
            <video
              controls
              playsInline
              muted
              preload="metadata"
              style={{ width: '100%', borderRadius: 12 }}
            >
              <source src={post.mediaUrl} type={post.mediaType || 'video/mp4'} />
            </video>
          ) : (
            <img
              src={post.mediaUrl}
              alt="media"
              style={{ width: '100%', borderRadius: 12 }}
            />
          )}
        </div>
      )}

      {/* STATS */}
      <div className="post-stats">
        <span>{formatCount(post.likeCount || 0)} thích</span>
        <span>{formatCount(post.commentCount || 0)} bình luận</span>
      </div>

      {/* ACTIONS */}
      <div className="reaction-row">
        <button
          className={`reaction-trigger ${myReaction ? 'active' : ''}`}
          onMouseDown={handleLikeMouseDown}
          onMouseUp={handleLikeMouseUp}
          onMouseLeave={handleLikeMouseUp}
          onClick={() => !reactionOpen && handleReaction(myReaction || 'like')}
        >
          <ThumbsUp size={16} />
          {reactionLabel}
        </button>

        <button onClick={() => setExpanded(v => !v)}>
          <MessageCircle size={16} /> Bình luận
        </button>

        {reactionOpen && (
          <ReactionMenu onSelect={handleReaction} />
        )}
      </div>

      {/* COMMENT */}
      <form onSubmit={submitComment} className="comment-form">
        <Avatar src={profile?.photoURL} size={32} />
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Viết bình luận..."
        />
        <button type="submit">
          <Send size={16} />
        </button>
      </form>

      {/* COMMENT LIST */}
      {expanded && (
        <div className="comment-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <Avatar src={c.authorPhoto} size={28} />
              <div>
                <strong>{c.authorName}</strong>
                <p>{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT */}
      <Modal open={editing} onClose={() => setEditing(false)}>
        <textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
        <button onClick={saveEdit}>Lưu</button>
      </Modal>

    </article>
  );
}
