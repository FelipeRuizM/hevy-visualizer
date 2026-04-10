import React from 'react';
import { LayoutDashboard, Activity, BarChart3, Settings } from 'lucide-react';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-logo">
        <h2>Hevy</h2>
      </div>
      <nav className="sidebar-nav">
        <a href="#" className="nav-item active">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </a>
        <a href="#" className="nav-item">
          <Activity size={20} />
          <span>Workouts</span>
        </a>
        <a href="#" className="nav-item">
          <BarChart3 size={20} />
          <span>Analytics</span>
        </a>
      </nav>
      <div className="sidebar-footer">
        <a href="#" className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </a>
      </div>
    </aside>
  );
};
