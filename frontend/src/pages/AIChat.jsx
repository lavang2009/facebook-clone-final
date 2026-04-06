import React, { useMemo, useState } from 'react';
import { Bot, Eraser, Send, Sparkles } from 'lucide-react';
import Shell from '../components/Shell';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { askBackendAI } from '../lib/ai';
import { clearAIHistory, getAIHistory, saveAIMessage, useAppState } from '../lib/db';

function Bubble({ item }) {
  const mine = item.role === 'user';
  return (
    <div className={`ai-bubble ${mine ? 'mine' : 'bot'}`}>
      {!mine && <div className="ai-avatar"><Bot size={16} /></div>}
      <div className="bubble-card">
        <p>{item.content}</p>
      </div>
    </div>
  );
}

export default function AIChat() {
  const { user, profile } = useAuth();
  const state = useAppState();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);

  const history = useMemo(() => getAIHistory(user?.uid), [state.aiChats, user?.uid]);

  const send = async () => {
    if (!text.trim() || !user) return;
    const prompt = text.trim();
    setText('');
    setBusy(true);
    saveAIMessage(user.uid, 'user', prompt);
    setTyping(true);

    try {
      const result = await askBackendAI(prompt, history);
      saveAIMessage(user.uid, 'assistant', result.reply || 'Mình chưa hiểu lắm, bạn có thể nói lại không?');
    } catch (error) {
      saveAIMessage(user.uid, 'assistant', 'Mình đang gặp lỗi kết nối, hãy thử lại sau.');
    } finally {
      setBusy(false);
      setTyping(false);
    }
  };

  const rightRail = (
    <div className="rail-stack">
      <div className="card rail-card">
        <div className="section-head">
          <div>
            <h3>Lệnh nhanh</h3>
            <p>Nhấn để thử ngay</p>
          </div>
        </div>
        <div className="prompt-stack">
          {[
            'Tạo bài viết ngắn cho bản tin.',
            'Tôi muốn đăng tin bằng video.',
            'Viết caption cho thước phim.',
            'Giải thích cách đổi avatar.'
          ].map((item) => (
            <button key={item} type="button" className="prompt-pill" onClick={() => setText(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Shell rightRail={rightRail}>
      <div className="page-stack ai-chat">
        <div className="page-title">
          <div>
            <h2>AI Chat</h2>
            <p>Trao đổi nhanh, có lịch sử lưu cục bộ và có thể nâng cấp sang API thật.</p>
          </div>
          <button className="ghost-btn" type="button" onClick={() => { clearAIHistory(user?.uid); }}>
            <Eraser size={16} />
            Xoá lịch sử
          </button>
        </div>

        <section className="card ai-panel">
          <div className="ai-head">
            <Avatar src={profile?.photoURL} name={profile?.displayName} size={48} />
            <div>
              <strong>{profile?.displayName || 'Người dùng'}</strong>
              <small>AI trợ lý trong ứng dụng</small>
            </div>
          </div>

          <div className="ai-stream">
            {history.length ? history.map((item) => <Bubble key={item.id} item={item} />) : (
              <EmptyState
                icon="🤖"
                title="Chưa có cuộc trò chuyện"
                description="Nhập câu hỏi đầu tiên để bắt đầu."
              />
            )}
            {typing && <div className="typing-dots"><span /><span /><span /></div>}
          </div>

          <div className="ai-compose">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Nhập câu hỏi hoặc yêu cầu..."
            />
            <button className="primary-btn" type="button" onClick={send} disabled={busy}>
              <Send size={16} />
              Gửi
            </button>
          </div>
        </section>
      </div>
    </Shell>
  );
}
