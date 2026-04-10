import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';
import './DashboardLayout.css';

export const DashboardLayout: React.FC = () => {
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
