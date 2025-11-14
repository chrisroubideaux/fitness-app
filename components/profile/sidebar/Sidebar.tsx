// components/profile/sidebar/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import {
  FaBars,
  FaHome,
  FaCalendarAlt,
  FaDumbbell,
  FaChartLine,
  FaComments,
  FaRobot,
  FaCog,
  FaSignOutAlt,
  FaCrown, // 👑 new icon
} from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';

export type SidebarTab =
  | 'dashboard'
  | 'calendar'
  | 'notifications'
  | 'WorkoutPlan'
  | 'progress'
  | 'memberships'   // ← replaced 'goals'
  | 'messages'
  | 'ai'
  | 'settings';

type SidebarProps = {
  userId: string;
  userName: string;
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onLogout?: () => void;
};

export default function Sidebar({
  userId,
  userName,
  activeTab,
  onTabChange,
  onLogout,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);

  const links: { tab: SidebarTab; label: string; icon: React.ReactElement; aria: string }[] = [
    { tab: 'dashboard',     label: 'Dashboard',     icon: <FaHome />,               aria: 'Dashboard Page' },
    { tab: 'calendar',      label: 'Calendar',      icon: <FaCalendarAlt />,        aria: 'Calendar Page' },
    { tab: 'notifications', label: 'Notifications', icon: <IoNotificationsOutline />, aria: 'Notifications' },
    { tab: 'WorkoutPlan',   label: 'Workout Plan',  icon: <FaDumbbell />,           aria: 'Workout Plan' },
    { tab: 'progress',      label: 'Progress',      icon: <FaChartLine />,          aria: 'Progress Tracker' },
    { tab: 'memberships',   label: 'Memberships',   icon: <FaCrown />,              aria: 'Memberships' }, // 👈
    { tab: 'messages',      label: 'Messages',      icon: <FaComments />,           aria: 'Trainer Messages' },
    { tab: 'ai',            label: 'AI Insights',   icon: <FaRobot />,              aria: 'AI-Powered Insights' },
    { tab: 'settings',      label: 'Settings',      icon: <FaCog />,                aria: 'User Settings' },
  ];

  return (
    <motion.div
      className="sidebar bg-dark text-white shadow d-flex flex-column justify-content-between"
      initial={{ width: 250 }}
      animate={{ width: collapsed ? 70 : 250 }}
      transition={{ duration: 0.3 }}
      style={{ minHeight: '100vh', zIndex: 1050, overflowX: 'hidden' }}
      data-user-id={userId}
    >
      {/* Header */}
      <div>
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          <h5 className="mb-0">{collapsed ? '💪' : `Hi, ${userName.split(' ')[0]}`}</h5>
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
                <FaSignOutAlt className="me-2" />
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
            <div>🔥 Keep pushing</div>
            <div style={{ fontSize: '0.75rem' }}>Fit by Lena © {new Date().getFullYear()}</div>
          </div>
        ) : (
          <div className="text-center">🔥</div>
        )}
      </div>
    </motion.div>
  );
}
