import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';
import './MainLayout.css';

export const MainLayout: React.FC = () => {
  return (
    <div className="dashboard-layout fade-in">
      <Sidebar />
      <div className="dashboard-main">
        <TopNavigation />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
