import React from 'react';
import { Link } from 'react-router-dom';
import Shell from '../components/Shell';

export default function NotFound() {
  return (
    <Shell rightRail={null}>
      <div className="page-stack">
        <section className="card empty-page">
          <h2>Không tìm thấy trang</h2>
          <p>Đường dẫn bạn mở không tồn tại hoặc đã bị thay đổi.</p>
          <Link className="primary-btn" to="/">Quay về Bản tin</Link>
        </section>
      </div>
    </Shell>
  );
}
