import express from 'express';

const router = express.Router();

function localReply(message = '', history = []) {
  const text = String(message || '').trim();
  const lower = text.toLowerCase();

  if (!text) return 'Bạn muốn mình giúp gì trong Bản tin, Tin, Thước phim, Tin nhắn, Cài đặt hay Hồ sơ?';
  if (lower.includes('đăng bài') || lower.includes('bài viết')) {
    return 'Bạn có thể bấm nút Đăng bài ở khung soạn tin để viết nội dung, đính kèm ảnh hoặc video rồi đăng ngay.';
  }
  if (lower.includes('story') || lower.includes('tin')) {
    return 'Bạn có thể tạo Tin để đăng ảnh hoặc video ngắn, nội dung sẽ nằm trên thanh Tin như một thẻ nổi bật.';
  }
  if (lower.includes('reel') || lower.includes('thước phim')) {
    return 'Thước phim phù hợp với video dọc, ngắn gọn và cuốn mắt. Bạn có thể đăng video lớn nếu máy chủ cho phép.';
  }
  if (lower.includes('tin nhắn') || lower.includes('chat')) {
    return 'Trong Tin nhắn, bạn chọn người dùng thật đã đăng ký rồi bắt đầu cuộc trò chuyện ngay, lịch sử sẽ được lưu lại trên trình duyệt.';
  }
  if (lower.includes('cài đặt') || lower.includes('settings')) {
    return 'Mục Cài đặt cho phép đổi giao diện sáng/tối, ngôn ngữ, thông báo, và chỉnh hồ sơ cá nhân.';
  }
  const last = history?.[history.length - 1]?.content || '';
  return `Mình đã ghi nhận: “${text}”. Nếu cần, bạn có thể hỏi tiếp về đăng bài, Tin, Thước phim, Tin nhắn, Hồ sơ hoặc Cài đặt. ${last ? 'Mình đang giữ ngữ cảnh trước đó để trả lời mạch lạc hơn.' : ''}`;
}

async function tryOpenAI(message, history) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const payload = {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: 'Bạn là trợ lý trong một mạng xã hội nội bộ, trả lời ngắn gọn, hữu ích, tiếng Việt tự nhiên.'
        },
        ...(Array.isArray(history) ? history.slice(-8).map((item) => ({
          role: item.role === 'assistant' ? 'assistant' : 'user',
          content: String(item.content || '')
        })) : []),
        { role: 'user', content: String(message || '') }
      ]
    };

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) return null;

    const data = await response.json();
    const reply =
      data?.output_text ||
      data?.output?.[0]?.content?.map((part) => part?.text || '').join('') ||
      data?.choices?.[0]?.message?.content ||
      '';

    return String(reply || '').trim() || null;
  } catch (error) {
    console.error('OpenAI fallback:', error);
    return null;
  }
}

router.post('/chat', async (req, res) => {
  const { message = '', history = [] } = req.body || {};

  const openAiReply = await tryOpenAI(message, history);
  const reply = openAiReply || localReply(message, history);

  res.json({
    reply,
    provider: openAiReply ? 'openai' : 'local',
    timestamp: Date.now()
  });
});

export { router as aiRouter };
