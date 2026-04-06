function localReply(message, history = []) {
  const text = String(message || '').trim();
  const lower = text.toLowerCase();

  const templates = [
    {
      keys: ['đăng tin', 'story'],
      reply: 'Bạn có thể bấm nút Đăng tin ở khung tạo bài viết, chọn ảnh hoặc video ngắn rồi thêm mô tả. Tin sẽ tự hết hạn theo logic của ứng dụng.'
    },
    {
      keys: ['thước phim', 'reel', 'video ngắn'],
      reply: 'Thước phim hoạt động như một dạng bài đăng video ngắn. Bạn chọn video, thêm caption và đăng lên. Video sẽ xuất hiện ở mục Reels.'
    },
    {
      keys: ['ảnh đại diện', 'avatar', 'cover', 'ảnh bìa'],
      reply: 'Vào hồ sơ cá nhân, chọn ảnh đại diện hoặc ảnh bìa rồi lưu. Dữ liệu sẽ được giữ lại sau khi tải lại trang.'
    },
    {
      keys: ['thích', 'reaction', 'like'],
      reply: 'Bạn có thể nhấn giữ nút thích để mở menu phản ứng và chọn biểu cảm phù hợp cho bài viết.'
    },
    {
      keys: ['khám phá', 'explore'],
      reply: 'Trang Khám phá hiển thị nội dung gọn giống mạng xã hội lớn, tập trung vào bài viết, ảnh, video và người dùng nổi bật.'
    }
  ];

  for (const item of templates) {
    if (item.keys.some((key) => lower.includes(key))) return item.reply;
  }

  const lastUser = [...history].reverse().find((item) => item.role === 'user')?.content || '';
  if (lastUser) {
    return `Mình đã ghi nhận: "${text}". Hãy cho mình biết bạn muốn tối ưu phần nào tiếp theo: giao diện, đăng bài, story, reels hay hồ sơ.`;
  }

  return 'Mình sẵn sàng hỗ trợ bạn trong ứng dụng này: đăng bài, story, reels, hồ sơ, khám phá, nhắn tin và cài đặt.';
}

export async function askBackendAI(message, history = []) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { reply: localReply(message, history), source: 'local' };
}
