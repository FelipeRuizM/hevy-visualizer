import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, BarChart3, Settings as SettingsIcon, Trophy, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/workouts', icon: Activity, label: 'Workouts' },
    { to: '/records', icon: Trophy, label: 'Trophy Room' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <aside className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        {isCollapsed
          ? <span className="sidebar-logo-icon">H</span>
          : <h2>Hevy</h2>
        }
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={isCollapsed ? label : undefined}
          >
            <Icon size={20} />
            {!isCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? 'Settings' : undefined}>
          <SettingsIcon size={20} />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>

        <button className="collapse-toggle" onClick={onToggle} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};
