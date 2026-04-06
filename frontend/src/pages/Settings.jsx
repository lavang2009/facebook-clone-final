import React from 'react';
import Shell from '../components/Shell';
import SettingsPanel from '../components/SettingsPanel';

export default function Settings() {
  return (
    <Shell rightRail={null}>
      <div className="page-stack">
        <div className="page-title">
          <div>
            <h2>Cài đặt</h2>
            <p>Giao diện, thông báo, ngôn ngữ và dữ liệu cục bộ.</p>
          </div>
        </div>
        <SettingsPanel />
      </div>
    </Shell>
  );
}
