// components/admin/sidebar/AdminSidebar.tsx
'use client';

import React, { useState } from 'react';
import {
  FaBars,
  FaHome,
  FaCalendarAlt,
  FaCrown,
  FaUsers,
  FaComments,
  FaRobot,
  FaCog,
  FaSignOutAlt,
} from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';

export type AdminSidebarTab =
  | 'dashboard'
  | 'calendar'
  | 'notifications'
  | 'plans'
  | 'users'
  | 'messages'
  | 'ai'
  | 'settings';

export type AdminSidebarProps = {
  adminId: string;
  adminName: string;
  activeTab: AdminSidebarTab;
  onTabChange: (tab: AdminSidebarTab) => void;
  onLogout?: () => void;
};

export default function AdminSidebar({
  adminId,
  adminName,
  activeTab,
  onTabChange,
  onLogout,
}: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);

  const links: { tab: AdminSidebarTab; label: string; icon: React.ReactElement; aria: string }[] = [
    { tab: 'dashboard',     label: 'Dashboard',     icon: <FaHome />,                aria: 'Admin Dashboard' },
    { tab: 'calendar',      label: 'Calendar',      icon: <FaCalendarAlt />,         aria: 'Admin Calendar' },
    { tab: 'notifications', label: 'Notifications', icon: <IoNotificationsOutline />, aria: 'Admin Notifications' },
    { tab: 'plans',         label: 'Plans',         icon: <FaCrown />,               aria: 'Manage Membership Plans' },
    { tab: 'users',         label: 'Users',         icon: <FaUsers />,               aria: 'Manage Users' },
    { tab: 'messages',      label: 'Messages',      icon: <FaComments />,            aria: 'Admin Messages' },
    { tab: 'ai',            label: 'AI Insights',   icon: <FaRobot />,               aria: 'AI Insights' },
    { tab: 'settings',      label: 'Settings',      icon: <FaCog />,                 aria: 'Admin Settings' },
  ];

  return (
    <motion.div
      className="sidebar bg-dark text-white shadow d-flex flex-column justify-content-between"
      initial={{ width: 250 }}
      animate={{ width: collapsed ? 70 : 250 }}
      transition={{ duration: 0.3 }}
      style={{ minHeight: '100vh', zIndex: 1050, overflowX: 'hidden' }}
      data-admin-id={adminId}
      data-role="admin"
    >
      {/* Header */}
      <div>
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          <h5 className="mb-0">{collapsed ? '👑' : `Hi, ${adminName.split(' ')[0]}`}</h5>
          <button
            onClick={toggleSidebar}
            className="btn btn-sm btn-outline-light"
            aria-label="Toggle sidebar menu"
          >
            <FaBars />
          </button>
        </div>

        {/* Tabs */}
        <ul className="nav flex-column mt-3">
          {links.map(({ tab, label, icon, aria }) => {
            const isActive = activeTab === tab;
            return (
              <li className="nav-item" key={tab}>
                <button
                  type="button"
                  onClick={() => onTabChange(tab)}
                  className={`nav-link d-flex align-items-center bg-transparent border-0 w-100 text-start ${
                    isActive ? 'fw-bold' : ''
                  }`}
                  aria-label={aria}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? label : ''}
                >
                  <span className="me-2">{icon}</span>
                  {!collapsed && <span>{label}</span>}
                </button>
              </li>
            );
          })}

          {/* Logout */}
          {onLogout && (
            <li className="nav-item mt-3">
              <button
                onClick={onLogout}
                className="nav-link d-flex align-items-center bg-transparent border-0 w-100"
                title={collapsed ? 'Logout' : ''}
                aria-label="Logout"
              >
                {/* Reuse the crown emoji in collapsed mode as a simple glyph, text otherwise */}
                <span className="me-2">   <FaSignOutAlt className="me-2" /></span>
                {!collapsed && 'Logout'}
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* Footer */}
      <div className="p-3 border-top small text-muted">
        {!collapsed ? (
          <div>
            <div>🔐 Admin mode</div>
            <div style={{ fontSize: '0.75rem' }}>Fit by Lena © {new Date().getFullYear()}</div>
          </div>
        ) : (
          <div className="text-center">🔐</div>
        )}
      </div>
    </motion.div>
  );
}
