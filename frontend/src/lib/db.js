import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'socialwave_state_v3';
const CHANGE_EVENT = 'socialwave-change';

const defaultState = {
  version: 3,
  users: {},
  posts: [],
  comments: {},
  notifications: {}
};

const clone = (v) => JSON.parse(JSON.stringify(v ?? null));

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
      notifications: parsed.notifications || {}
    };
  } catch (e) {
    console.error('LOAD ERROR:', e);
    return clone(defaultState);
  }
}

let cache = loadState();

function persist(state) {
  cache = state;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch (e) {
    console.error('SAVE ERROR:', e);
  }
}

function mutate(fn) {
  const next = clone(cache) || clone(defaultState);
  fn(next);
  persist(next);
  return next;
}

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
    () => cache,
    () => defaultState
  );
}

export function ensureUser(user) {
  if (!user?.uid) return null;

  mutate((s) => {
    if (!s.users[user.uid]) {
      s.users[user.uid] = {
        uid: user.uid,
        displayName: user.displayName || 'Người dùng',
        photoURL: user.photoURL || '',
        createdAt: Date.now()
      };
    }
  });

  return clone(cache.users[user.uid]);
}

export function getUser(uid) {
  return clone(cache.users?.[uid]);
}

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
    commentCount: 0
  };

  mutate((s) => {
    s.posts.unshift(post);
  });

  return clone(post);
}

export function getPosts() {
  return [...(cache.posts || [])];
}

export function toggleLike(postId, uid) {
  mutate((s) => {
    const post = s.posts.find(p => p.id === postId);
    if (!post) return;

    if (!Array.isArray(post.likedBy)) post.likedBy = [];

    const i = post.likedBy.indexOf(uid);
    if (i >= 0) post.likedBy.splice(i, 1);
    else post.likedBy.push(uid);

    post.likeCount = post.likedBy.length;
  });
}

export function react(postId, uid, type = 'like') {
  mutate((s) => {
    const post = s.posts.find(p => p.id === postId);
    if (!post) return;

    if (!post.reactions) post.reactions = {};
    if (!Array.isArray(post.likedBy)) post.likedBy = [];

    post.reactions[uid] = type;

    if (!post.likedBy.includes(uid)) {
      post.likedBy.push(uid);
    }

    post.likeCount = post.likedBy.length;
  });
}

export function getReaction(post, uid) {
  return post?.reactions?.[uid] || '';
}

export function addComment(postId, user, text) {
  if (!user?.uid) throw new Error('Thiếu user');
  if (!text?.trim()) return;

  const comment = {
    id: crypto.randomUUID(),
    uid: user.uid,
    authorName: user.displayName,
    authorPhoto: user.photoURL,
    text: text.trim(),
    createdAt: Date.now()
  };

  mutate((s) => {
    if (!s.comments[postId]) s.comments[postId] = [];
    s.comments[postId].push(comment);

    const post = s.posts.find(p => p.id === postId);
    if (post) {
      post.commentCount = s.comments[postId].length;
    }
  });

  return clone(comment);
}

export function getComments(postId) {
  return [...(cache.comments?.[postId] || [])];
}

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
