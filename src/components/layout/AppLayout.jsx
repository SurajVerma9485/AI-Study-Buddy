import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          minWidth: 0,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="main-layout-content"
      >
        {/* Top Navbar */}
        <Navbar onToggleMobileSidebar={() => setMobileOpen((prev) => !prev)} />

        {/* Dynamic Route View */}
        <main
          style={{
            flex: 1,
            padding: '28px 32px 64px 32px',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
          }}
          className="page-main-container"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
