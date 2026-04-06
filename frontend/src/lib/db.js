import React, { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'socialwave_state_v1';
const CHANGE_EVENT = 'socialwave-change';

const defaultSettings = {
  theme: 'dark',
  language: 'vi',
  notifications: true,
  autoplayVideo: true,
  compactMode: false,
  showOnline: true
};

const defaultState = {
  version: 1,
  users: {},
  posts: [],
  comments: {},
  rooms: [],
  messages: {},
  notifications: [],
  aiChats: {},
  settings: {}
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const makeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const initialProfile = (user = {}) => ({
  uid: String(user.uid || ''),
  displayName: user.displayName || user.email?.split('@')?.[0] || 'Người dùng',
  email: user.email || '',
  photoURL: user.photoURL || '',
  coverURL: user.coverURL || '',
  bio: user.bio || '',
  city: user.city || '',
  website: user.website || '',
  work: user.work || '',
  education: user.education || '',
  relationship: user.relationship || '',
  verified: Boolean(user.verified),
  createdAt: user.createdAt || Date.now(),
  updatedAt: Date.now()
});

function loadState() {
  if (typeof window === 'undefined') return clone(defaultState);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(defaultState);
    const parsed = JSON.parse(raw);
    return {
      ...clone(defaultState),
      ...parsed,
      users: parsed.users || {},
      posts: Array.isArray(parsed.posts) ? parsed.posts : [],
      comments: parsed.comments || {},
      rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
      messages: parsed.messages || {},
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      aiChats: parsed.aiChats || {},
      settings: parsed.settings || {}
    };
  } catch {
    return clone(defaultState);
  }
}

let cache = loadState();

function persist(next) {
  cache = next;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

function mutate(recipe) {
  const next = clone(cache);
  recipe(next);
  persist(next);
  return next;
}

export function subscribeStore(listener) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => listener();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function useAppState() {
  return useSyncExternalStore(
    subscribeStore,
    () => cache,
    () => defaultState
  );
}

export function getState() {
  return cache;
}

export function resetState() {
  persist(clone(defaultState));
}

export function getDefaultProfile(user) {
  return initialProfile(user);
}

export function getProfile(uid) {
  return cache.users?.[uid] ? clone(cache.users[uid]) : null;
}

export function listProfiles() {
  return Object.values(cache.users || {}).map(clone);
}

export function ensureUserProfile(user) {
  if (!user?.uid) return null;
  const uid = String(user.uid);
  const existing = cache.users?.[uid];
  const merged = existing
    ? {
        ...initialProfile(existing),
        ...existing,
        uid,
        email: user.email || existing.email || '',
        displayName: user.displayName || existing.displayName || existing.email?.split('@')?.[0] || 'Người dùng',
        photoURL: typeof user.photoURL !== 'undefined' ? user.photoURL : existing.photoURL,
        updatedAt: Date.now()
      }
    : initialProfile(user);

  mutate((state) => {
    state.users[uid] = merged;
    if (!state.settings[uid]) state.settings[uid] = clone(defaultSettings);
  });

  return clone(merged);
}

export function saveProfile(uid, patch = {}) {
  if (!uid) return null;
  let result = null;
  mutate((state) => {
    const current = state.users[uid] || initialProfile({ uid });
    result = {
      ...current,
      ...patch,
      uid,
      updatedAt: Date.now()
    };
    state.users[uid] = result;
  });
  return clone(result);
}

export function getSettings(uid) {
  return clone(cache.settings?.[uid] || defaultSettings);
}

export function saveSettings(uid, patch = {}) {
  if (!uid) return clone(defaultSettings);
  let result = null;
  mutate((state) => {
    const current = state.settings[uid] || defaultSettings;
    result = { ...current, ...patch };
    state.settings[uid] = result;
  });
  return clone(result);
}

export const reactionsMeta = {
  like: { label: 'Thích', icon: '👍' },
  love: { label: 'Yêu thích', icon: '❤️' },
  care: { label: 'Thương', icon: '🥰' },
  haha: { label: 'Haha', icon: '😂' },
  wow: { label: 'Wow', icon: '😮' },
  sad: { label: 'Buồn', icon: '😢' },
  angry: { label: 'Giận', icon: '😡' }
};

export function getReaction(post, uid) {
  return post?.reactions?.[uid] || '';
}

export function selectFeedPosts(state = cache, uid) {
  return (state.posts || [])
    .filter((post) => post.kind === 'post' && !post.hiddenBy?.includes(uid) && (post.privacy !== 'only_me' || post.uid === uid))
    .sort((a, b) => {
      const pinnedA = a.pinned ? 1 : 0;
      const pinnedB = b.pinned ? 1 : 0;
      if (pinnedA !== pinnedB) return pinnedB - pinnedA;
      return Number(b.createdAt || 0) - Number(a.createdAt || 0);
    })
    .map(clone);
}

export function selectStories(state = cache, uid) {
  const now = Date.now();
  return (state.posts || [])
    .filter((post) => post.kind === 'story' && (!post.expiresAt || Number(post.expiresAt) > now) && (!uid || !post.hiddenBy?.includes(uid)))
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
    .map(clone);
}

export function selectReels(state = cache, uid) {
  const now = Date.now();
  return (state.posts || [])
    .filter((post) => post.kind === 'reel' && (!post.expiresAt || Number(post.expiresAt) > now) && (!uid || !post.hiddenBy?.includes(uid)))
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
    .map(clone);
}

export function selectMediaPosts(state = cache, uid, mediaType = 'image') {
  return (state.posts || [])
    .filter((post) => post.kind === 'post' && post.mediaUrl && String(post.mediaType || '').startsWith(mediaType) && (!uid || !post.hiddenBy?.includes(uid)))
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
    .map(clone);
}

export function selectNotifications(state = cache, uid) {
  return (state.notifications || [])
    .filter((item) => item.toUid === uid)
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
    .map(clone);
}

export function searchUsers(query = '', excludeUid = '') {
  const term = String(query || '').trim().toLowerCase();
  return Object.values(cache.users || {})
    .filter((user) => user.uid !== excludeUid)
    .filter((user) => {
      if (!term) return true;
      return [user.displayName, user.email, user.city, user.bio].some((field) => String(field || '').toLowerCase().includes(term));
    })
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
    .map(clone);
}

export function createPost({ uid, kind = 'post', content = '', mediaUrl = '', mediaType = '', privacy = 'public', location = '', feeling = '', tags = [], background = '' } = {}) {
  if (!uid) throw new Error('Thiếu người đăng.');
  const owner = cache.users?.[uid] || initialProfile({ uid });
  const now = Date.now();
  const post = {
    id: makeId(),
    uid,
    authorName: owner.displayName,
    authorPhoto: owner.photoURL || '',
    authorCover: owner.coverURL || '',
    content: String(content || '').trim(),
    mediaUrl,
    mediaType,
    privacy,
    kind,
    location,
    feeling,
    tags: Array.isArray(tags) ? tags : [],
    background,
    createdAt: now,
    updatedAt: now,
    expiresAt: kind === 'story' ? now + 24 * 60 * 60 * 1000 : null,
    pinned: false,
    hiddenBy: [],
    savedBy: [],
    likedBy: [],
    reactions: {},
    likeCount: 0,
    commentCount: 0
  };
  mutate((state) => {
    state.posts.unshift(post);
  });
  return clone(post);
}

export function updatePost(postId, patch = {}) {
  let result = null;
  mutate((state) => {
    const index = state.posts.findIndex((post) => post.id === postId);
    if (index < 0) return;
    result = {
      ...state.posts[index],
      ...patch,
      updatedAt: Date.now()
    };
    state.posts[index] = result;
  });
  return result ? clone(result) : null;
}

export function deletePost(postId) {
  mutate((state) => {
    state.posts = state.posts.filter((post) => post.id !== postId);
    delete state.comments[postId];
  });
}

export function togglePinPost(postId, uid) {
  let result = null;
  mutate((state) => {
    const post = state.posts.find((item) => item.id === postId);
    if (!post || post.uid !== uid) return;
    post.pinned = !post.pinned;
    post.updatedAt = Date.now();
    result = post;
  });
  return result ? clone(result) : null;
}

export function hidePost(postId, uid) {
  let result = null;
  mutate((state) => {
    const post = state.posts.find((item) => item.id === postId);
    if (!post) return;
    if (!Array.isArray(post.hiddenBy)) post.hiddenBy = [];
    if (!post.hiddenBy.includes(uid)) post.hiddenBy.push(uid);
    post.updatedAt = Date.now();
    result = post;
  });
  return result ? clone(result) : null;
}

export function toggleSavePost(postId, uid) {
  let result = null;
  mutate((state) => {
    const post = state.posts.find((item) => item.id === postId);
    if (!post) return;
    if (!Array.isArray(post.savedBy)) post.savedBy = [];
    const index = post.savedBy.indexOf(uid);
    if (index >= 0) post.savedBy.splice(index, 1);
    else post.savedBy.push(uid);
    result = post;
  });
  return result ? clone(result) : null;
}

export function toggleReaction(postId, uid, reaction = 'like') {
  let result = null;
  mutate((state) => {
    const post = state.posts.find((item) => item.id === postId);
    if (!post) return;
    if (!Array.isArray(post.likedBy)) post.likedBy = [];
    if (!post.reactions) post.reactions = {};
    const current = post.reactions[uid] || '';
    if (current === reaction) {
      delete post.reactions[uid];
      post.likedBy = post.likedBy.filter((item) => item !== uid);
    } else {
      post.reactions[uid] = reaction;
      if (!post.likedBy.includes(uid)) post.likedBy.push(uid);
    }
    post.likeCount = post.likedBy.length;
    post.updatedAt = Date.now();
    result = post;
  });
  return result ? clone(result) : null;
}

export function addComment(postId, user, text) {
  if (!user?.uid) throw new Error('Thiếu người bình luận.');
  const value = String(text || '').trim();
  if (!value) throw new Error('Bình luận không được để trống.');
  let comment = null;
  mutate((state) => {
    const post = state.posts.find((item) => item.id === postId);
    if (!post) return;
    const list = state.comments[postId] || [];
    comment = {
      id: makeId(),
      postId,
      uid: user.uid,
      authorName: user.displayName || 'Người dùng',
      authorPhoto: user.photoURL || '',
      text: value,
      createdAt: Date.now()
    };
    list.push(comment);
    state.comments[postId] = list;
    post.commentCount = list.length;
    post.updatedAt = Date.now();
  });
  if (comment) {
    const post = cache.posts.find((item) => item.id === postId);
    if (post && post.uid !== user.uid) {
      createNotification({
        toUid: post.uid,
        fromUid: user.uid,
        type: 'comment',
        text: `${user.displayName || 'Ai đó'} đã bình luận vào bài viết của bạn.`,
        linkKind: 'post',
        linkId: postId
      });
    }
  }
  return comment ? clone(comment) : null;
}

export function listComments(postId) {
  return clone(cache.comments?.[postId] || []);
}

export function createNotification({ toUid, fromUid, type = 'general', text = '', linkKind = '', linkId = '' }) {
  if (!toUid) return null;
  const notification = {
    id: makeId(),
    toUid,
    fromUid: fromUid || '',
    type,
    text: String(text || '').trim(),
    linkKind,
    linkId,
    read: false,
    createdAt: Date.now()
  };
  mutate((state) => {
    state.notifications.unshift(notification);
  });
  return clone(notification);
}

export function markNotificationRead(notificationId) {
  mutate((state) => {
    const item = state.notifications.find((notification) => notification.id === notificationId);
    if (item) item.read = true;
  });
}

export function markAllNotificationsRead(uid) {
  mutate((state) => {
    state.notifications.forEach((item) => {
      if (item.toUid === uid) item.read = true;
    });
  });
}

export function deleteNotification(notificationId) {
  mutate((state) => {
    state.notifications = state.notifications.filter((item) => item.id !== notificationId);
  });
}

export function getRoomId(a, b) {
  return [String(a), String(b)].sort().join('__');
}

export function ensureRoom(currentUid, otherUid) {
  if (!currentUid || !otherUid) return null;
  const roomId = getRoomId(currentUid, otherUid);
  let room = null;

  mutate((state) => {
    room = state.rooms.find((item) => item.id === roomId);
    if (!room) {
      room = {
        id: roomId,
        members: [currentUid, otherUid],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastMessage: '',
        lastSenderId: '',
        lastReadAt: {}
      };
      state.rooms.unshift(room);
    }
  });

  return clone(room);
}

export function getRoomsFor(uid) {
  return (cache.rooms || [])
    .filter((room) => room.members?.includes(uid))
    .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
    .map(clone);
}

export function sendMessage(roomId, message = {}) {
  const text = String(message.text || '').trim();
  if (!roomId) throw new Error('Thiếu phòng chat.');
  if (!text && !message.mediaUrl) throw new Error('Tin nhắn không được trống.');
  let saved = null;
  mutate((state) => {
    const room = state.rooms.find((item) => item.id === roomId);
    if (!room) throw new Error('Phòng chat không tồn tại.');
    const list = state.messages[roomId] || [];
    saved = {
      id: makeId(),
      roomId,
      senderId: message.senderId || '',
      text,
      mediaUrl: message.mediaUrl || '',
      mediaType: message.mediaType || '',
      createdAt: Date.now(),
      seenBy: [message.senderId || '']
    };
    list.push(saved);
    state.messages[roomId] = list;
    room.updatedAt = Date.now();
    room.lastMessage = text || (message.mediaType === 'video' ? 'Đã gửi video' : 'Đã gửi tệp');
    room.lastSenderId = message.senderId || '';
  });
  return clone(saved);
}

export function getMessages(roomId) {
  return clone(cache.messages?.[roomId] || []);
}


export function deleteRoom(roomId) {
  if (!roomId) return;
  mutate((state) => {
    state.rooms = state.rooms.filter((room) => room.id !== roomId);
    delete state.messages[roomId];
  });
}

export function markRoomRead(roomId, uid) {
  mutate((state) => {
    const room = state.rooms.find((item) => item.id === roomId);
    if (!room) return;
    room.lastReadAt = { ...(room.lastReadAt || {}), [uid]: Date.now() };
  });
}

export function saveAIMessage(uid, role, content) {
  if (!uid) return null;
  const item = {
    id: makeId(),
    role,
    content: String(content || ''),
    createdAt: Date.now()
  };
  mutate((state) => {
    const list = state.aiChats[uid] || [];
    list.push(item);
    state.aiChats[uid] = list;
  });
  return clone(item);
}

export function getAIHistory(uid) {
  return clone(cache.aiChats?.[uid] || []);
}

export function clearAIHistory(uid) {
  mutate((state) => {
    state.aiChats[uid] = [];
  });
}

export function timeAgo(value) {
  if (!value) return 'vừa xong';
  const date = typeof value === 'number' ? new Date(value) : value?.seconds ? new Date(value.seconds * 1000) : new Date(value);
  if (Number.isNaN(date.getTime())) return 'vừa xong';
  const diff = Math.max(0, Date.now() - date.getTime());
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  if (diff < minute) return 'vừa xong';
  if (diff < hour) return `${Math.floor(diff / minute)} phút`;
  if (diff < day) return `${Math.floor(diff / hour)} giờ`;
  if (diff < week) return `${Math.floor(diff / day)} ngày`;
  if (diff < month) return `${Math.floor(diff / week)} tuần`;
  return date.toLocaleDateString('vi-VN');
}

export function formatCount(value = 0) {
  const n = Number(value || 0);
  if (n < 1000) return `${n}`;
  if (n < 1000000) return `${(n / 1000).toFixed(n < 10000 ? 1 : 0)}K`;
  return `${(n / 1000000).toFixed(n < 10000000 ? 1 : 0)}M`;
}

export function getUnreadCount(uid) {
  return (cache.notifications || []).filter((item) => item.toUid === uid && !item.read).length;
}

export function selectSuggestedTopics(state = cache) {
  const topics = new Map();
  (state.posts || []).forEach((post) => {
    String(post.content || '')
      .split(/\s+/)
      .map((word) => word.replace(/[^\p{L}\p{N}#@]+/gu, '').trim())
      .filter((word) => word.length > 3 && !/^https?:/i.test(word))
      .slice(0, 8)
      .forEach((word) => {
        const key = word.toLowerCase();
        topics.set(key, (topics.get(key) || 0) + 1);
      });
  });
  return Array.from(topics.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));
}

export function selectMediaForProfile(state = cache, uid) {
  const posts = (state.posts || []).filter((post) => post.uid === uid && post.mediaUrl);
  return {
    photos: posts.filter((post) => String(post.mediaType || '').startsWith('image')).map(clone),
    videos: posts.filter((post) => String(post.mediaType || '').startsWith('video')).map(clone),
    reels: posts.filter((post) => post.kind === 'reel').map(clone),
    stories: posts.filter((post) => post.kind === 'story').map(clone)
  };
}
