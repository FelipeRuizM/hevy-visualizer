import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';
import { BottomNav } from './BottomNav';
import './MainLayout.css';

export const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={`dashboard-layout fade-in ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      <div className="dashboard-main">
        <TopNavigation />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
