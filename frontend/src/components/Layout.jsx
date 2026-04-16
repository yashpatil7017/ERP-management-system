import React, { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './Layout.css';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sidebarWidth = useMemo(() => 240, []);

  return (
    <div className="layout">
      <aside
        className={`layout__sidebar ${sidebarOpen ? 'layout__sidebar--open' : ''}`}
        style={{ width: sidebarWidth }}
      >
        <Sidebar isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      </aside>

      <div className="layout__main" style={{ marginLeft: sidebarOpen ? sidebarWidth : 0 }}>
        <header className="layout__navbar">
          <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        </header>

        <main className="layout__content">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <button
          type="button"
          className="layout__backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
