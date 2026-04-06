# Facebook Clone – Final Clean Build

## Chạy nhanh trên Windows
1. Double-click `INSTALL.cmd` để cài dependencies cho frontend.
2. Double-click `RUN.cmd` để mở frontend.
3. Mở `http://localhost:5173`.

## Firebase
Ứng dụng dùng **Firebase Auth** để đăng ký/đăng nhập bằng email + mật khẩu.
Hãy mở Firebase Console và bật **Email/Password** trong Authentication.

File cấu hình Firebase đã được điền sẵn trong `frontend/src/firebase.js`.
Nếu muốn đổi sang project Firebase khác, thay các giá trị trong file đó.

## Lưu media
Ảnh / video / avatar / ảnh bìa / tin / reel / nhắn tin media được tải trực tiếp lên Cloudinary bằng unsigned upload preset.
Điền biến môi trường trong `frontend/.env` hoặc Vercel Environment Variables:
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

## AI Chat
AI Chat có thể chạy cục bộ ngay trong frontend để không bị lỗi khi không cấu hình backend.
Nếu bạn muốn nối AI thật, có thể bổ sung backend riêng sau này.

## Dữ liệu
Bài viết, bình luận, tin, reel, chat, thông báo và cài đặt được lưu cục bộ trên trình duyệt để không mất khi reload.

## Cấu trúc
- `frontend/` – React + Vite
- `backend/` – mã backend cũ, không bắt buộc cho bản deploy hiện tại
