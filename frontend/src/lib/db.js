import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'socialwave_state_v2';
const CHANGE_EVENT = 'socialwave-change';

// ===== DEFAULT =====
const defaultState = {
  version: 2,
  users: {},
  posts: [],
  comments: {},
  notifications: {},
};

// ===== SAFE CLONE =====
const clone = (v) => JSON.parse(JSON.stringify(v || {}));

// ===== LOAD =====
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(defaultState);

    const parsed = JSON.parse(raw);

    return {
      ...defaultState,
      ...parsed,
      users: parsed.users || {},
      posts: Array.isArray(parsed.posts) ? parsed.posts : [],
      comments: parsed.comments || {},
      notifications: parsed.notifications || {},
    };
  } catch (e) {
    console.error('LOAD ERROR:', e);
    return clone(defaultState);
  }
}

let cache = loadState();

// ===== SAVE =====
function persist(state) {
  cache = state;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch (e) {
    console.error('SAVE ERROR:', e);
  }
}

// ===== MUTATE =====
function mutate(fn) {
  const next = clone(cache);
  fn(next);
  persist(next);
  return next;
}

// ===== SUBSCRIBE =====
export function useAppState() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(CHANGE_EVENT, cb);
      window.addEventListener('storage', cb);
      return () => {
        window.removeEventListener(CHANGE_EVENT, cb);
        window.removeEventListener('storage', cb);
      };
    },
    () => cache
  );
}

// ================= USER =================
export function ensureUser(user) {
  if (!user?.uid) return null;

  return mutate((s) => {
    if (!s.users[user.uid]) {
      s.users[user.uid] = {
        uid: user.uid,
        displayName: user.displayName || 'Người dùng',
        photoURL: user.photoURL || '',
        createdAt: Date.now(),
      };
    }
  });
}

export function getUser(uid) {
  return clone(cache.users?.[uid]);
}

// ================= POST =================
export function createPost(data) {
  const post = {
    id: crypto.randomUUID(),
    uid: data.uid,
    content: data.content || '',
    mediaUrl: data.mediaUrl || '',
    mediaType: data.mediaType || '',
    createdAt: Date.now(),
    likedBy: [],
    reactions: {},
    likeCount: 0,
    commentCount: 0,
  };

  mutate((s) => {
    s.posts.unshift(post);
  });

  return post;
}

export function getPosts() {
  return [...(cache.posts || [])];
}

// ================= LIKE =================
export function toggleLike(postId, uid) {
  mutate((s) => {
    const post = s.posts.find(p => p.id === postId);
    if (!post) return;

    if (!post.likedBy) post.likedBy = [];

    const i = post.likedBy.indexOf(uid);
    if (i >= 0) post.likedBy.splice(i, 1);
    else post.likedBy.push(uid);

    post.likeCount = post.likedBy.length;
  });
}

// ================= REACTION =================
export function react(postId, uid, type = 'like') {
  mutate((s) => {
    const post = s.posts.find(p => p.id === postId);
    if (!post) return;

    if (!post.reactions) post.reactions = {};
    post.reactions[uid] = type;

    if (!post.likedBy.includes(uid)) {
      post.likedBy.push(uid);
    }

    post.likeCount = post.likedBy.length;
  });
}

// ================= COMMENT =================
export function addComment(postId, user, text) {
  if (!user?.uid) throw new Error('Thiếu user');

  const comment = {
    id: crypto.randomUUID(),
    uid: user.uid,
    authorName: user.displayName,
    authorPhoto: user.photoURL,
    text,
    createdAt: Date.now(),
  };

  mutate((s) => {
    if (!s.comments[postId]) s.comments[postId] = [];
    s.comments[postId].push(comment);

    const post = s.posts.find(p => p.id === postId);
    if (post) {
      post.commentCount = s.comments[postId].length;
    }
  });

  return comment;
}

export function getComments(postId) {
  return [...(cache.comments?.[postId] || [])];
}

// ================= TIME =================
export function timeAgo(time) {
  if (!time) return 'vừa xong';

  const diff = Date.now() - time;
  const m = 60000;
  const h = 60 * m;
  const d = 24 * h;

  if (diff < m) return 'vừa xong';
  if (diff < h) return Math.floor(diff / m) + ' phút';
  if (diff < d) return Math.floor(diff / h) + ' giờ';

  return Math.floor(diff / d) + ' ngày';
}
