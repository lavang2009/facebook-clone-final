import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Send, Search, Trash2 } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Shell from '../components/Shell';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import { ChatBubble } from '../components/ChatBubble';
import { useAuth } from '../contexts/AuthContext';
import {
  createNotification,
  deleteRoom,
  ensureRoom,
  getMessages,
  getRoomsFor,
  markRoomRead,
  searchUsers,
  sendMessage,
  useAppState
} from '../lib/db';
import { uploadMedia } from '../lib/upload';

export default function Messenger() {
  const { user, profile } = useAuth();
  const state = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [mediaBusy, setMediaBusy] = useState(false);
  const fileRef = useRef(null);
  const listRef = useRef(null);

  const rooms = useMemo(() => getRoomsFor(user?.uid || ''), [state.rooms, state.messages, user?.uid]);
  const contacts = useMemo(() => searchUsers(query, user?.uid).slice(0, 8), [state.users, query, user?.uid]);

  useEffect(() => {
    const to = searchParams.get('to');
    if (to && user?.uid) {
      const room = ensureRoom(user.uid, to);
      setSelectedRoomId(room?.id || '');
      navigate('/messenger', { replace: true });
      return;
    }
    if (!selectedRoomId && rooms[0]) setSelectedRoomId(rooms[0].id);
  }, [searchParams.toString(), user?.uid, rooms.length]);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) || null;
  const messages = selectedRoom ? getMessages(selectedRoom.id) : [];
  const partnerId = selectedRoom?.members?.find((id) => id !== user?.uid) || '';
  const partner = partnerId ? state.users?.[partnerId] : null;

  useEffect(() => {
    if (selectedRoom && user?.uid) markRoomRead(selectedRoom.id, user.uid);
  }, [selectedRoom?.id, user?.uid, messages.length]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length, selectedRoom?.id]);

  const openConversation = (otherUid) => {
    const room = ensureRoom(user.uid, otherUid);
    setSelectedRoomId(room.id);
  };

  const submit = async () => {
    if (!selectedRoom || !draft.trim()) return;
    setBusy(true);
    try {
      const saved = sendMessage(selectedRoom.id, { senderId: user.uid, text: draft.trim() });
      setDraft('');
      if (partnerId) {
        createNotification({
          toUid: partnerId,
          fromUid: user.uid,
          type: 'message',
          text: `${profile?.displayName || 'Ai đó'} đã gửi cho bạn một tin nhắn.`,
          linkKind: 'room',
          linkId: selectedRoom.id
        });
      }
    } catch (error) {
      alert(error.message || 'Không thể gửi tin nhắn.');
    } finally {
      setBusy(false);
    }
  };

  const attachMedia = async (file) => {
    if (!selectedRoom || !file) return;
    setMediaBusy(true);
    try {
      const uploaded = await uploadMedia(file, { uid: user.uid, kind: 'message' });
      sendMessage(selectedRoom.id, {
        senderId: user.uid,
        text: '',
        mediaUrl: uploaded.url,
        mediaType: uploaded.mediaType
      });
      if (partnerId) {
        createNotification({
          toUid: partnerId,
          fromUid: user.uid,
          type: 'message',
          text: `${profile?.displayName || 'Ai đó'} đã gửi một tệp media.`,
          linkKind: 'room',
          linkId: selectedRoom.id
        });
      }
    } catch (error) {
      alert(error.message || 'Không thể gửi media.');
    } finally {
      setMediaBusy(false);
    }
  };

  const rightRail = (
    <div className="rail-stack">
      <div className="card rail-card">
        <div className="section-head">
          <div>
            <h3>Liên hệ nhanh</h3>
            <p>Nhấn để bắt đầu cuộc trò chuyện mới</p>
          </div>
        </div>
        <div className="contact-search">
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm người dùng thật..." />
        </div>
        <div className="contact-list">
          {contacts.length ? contacts.map((item) => (
            <button key={item.uid} className="contact-item" type="button" onClick={() => openConversation(item.uid)}>
              <Avatar src={item.photoURL} name={item.displayName} size={42} />
              <div>
                <strong>{item.displayName}</strong>
                <small>{item.bio || item.city || 'Người dùng thật'}</small>
              </div>
            </button>
          )) : <div className="empty-inline">Không có kết quả.</div>}
        </div>
      </div>
    </div>
  );

  return (
    <Shell rightRail={rightRail}>
      <div className="messenger-layout">
        <aside className="chat-list card">
          <div className="section-head">
            <div>
              <h3>Tin nhắn</h3>
              <p>{rooms.length} cuộc trò chuyện</p>
            </div>
          </div>
          <div className="chat-room-list">
            {rooms.length ? rooms.map((room) => {
              const otherId = room.members.find((item) => item !== user?.uid);
              const other = state.users?.[otherId];
              return (
                <button
                  key={room.id}
                  type="button"
                  className={`chat-room-item ${selectedRoomId === room.id ? 'active' : ''}`}
                  onClick={() => setSelectedRoomId(room.id)}
                >
                  <Avatar src={other?.photoURL} name={other?.displayName} size={46} />
                  <div>
                    <strong>{other?.displayName || 'Người dùng'}</strong>
                    <small>{room.lastMessage || 'Bắt đầu trò chuyện'}</small>
                  </div>
                </button>
              );
            }) : (
              <EmptyState
                icon="💬"
                title="Chưa có cuộc trò chuyện nào"
                description="Tìm một người dùng thật để bắt đầu trò chuyện."
              />
            )}
          </div>
        </aside>

        <section className="chat-window card">
          {selectedRoom ? (
            <>
              <div className="chat-head">
                <div className="chat-peer" onClick={() => partnerId && navigate(`/profile/${partnerId}`)} role="button" tabIndex={0}>
                  <Avatar src={partner?.photoURL} name={partner?.displayName} size={46} />
                  <div>
                    <strong>{partner?.displayName || 'Người dùng'}</strong>
                    <small>{partner?.bio || 'Đang nhắn tin'}</small>
                  </div>
                </div>
                <button className="icon-btn" type="button" onClick={() => {
                  if (window.confirm('Xoá cuộc trò chuyện này?')) {
                    deleteRoom(selectedRoom.id);
                    setSelectedRoomId('');
                  }
                }}>
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="chat-scroll" ref={listRef}>
                {messages.length ? messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    mine={message.senderId === user?.uid}
                    author={message.senderId === user?.uid ? profile : partner}
                  />
                )) : <EmptyState icon="✉️" title="Chưa có tin nhắn" description="Hãy gõ lời chào đầu tiên." />}
              </div>

              <div className="chat-compose">
                <button className="icon-btn" type="button" disabled={mediaBusy} onClick={() => fileRef.current?.click()}>
                  <ImagePlus size={18} />
                </button>
                <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={(e) => { attachMedia(e.target.files?.[0] || null); e.target.value = ''; }} />
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submit()}
                  placeholder="Nhập tin nhắn..."
                />
                <button className="primary-btn" type="button" onClick={submit} disabled={busy}>
                  <Send size={16} />
                  Gửi
                </button>
              </div>
            </>
          ) : (
            <EmptyState
              icon="💬"
              title="Chọn một cuộc trò chuyện"
              description="Chọn từ danh sách bên trái hoặc tìm một người dùng thật để bắt đầu."
            />
          )}
        </section>
      </div>
    </Shell>
  );
}
