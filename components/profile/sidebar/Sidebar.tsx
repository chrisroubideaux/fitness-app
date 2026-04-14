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
  FaCrown,
} from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';

export type SidebarTab =
  | 'dashboard'
  | 'calendar'
  | 'notifications'
  | 'WorkoutPlan'
  | 'progress'
  | 'memberships'
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

const links: {
  tab: SidebarTab;
  label: string;
  shortLabel: string;
  icon: React.ReactElement;
  aria: string;
}[] = [
  { tab: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: <FaHome />, aria: 'Dashboard Page' },
  { tab: 'calendar', label: 'Calendar', shortLabel: 'Calendar', icon: <FaCalendarAlt />, aria: 'Calendar Page' },
  { tab: 'notifications', label: 'Notifications', shortLabel: 'Alerts', icon: <IoNotificationsOutline />, aria: 'Notifications' },
  { tab: 'WorkoutPlan', label: 'Workout Plan', shortLabel: 'Workout', icon: <FaDumbbell />, aria: 'Workout Plan' },
  { tab: 'progress', label: 'Progress', shortLabel: 'Progress', icon: <FaChartLine />, aria: 'Progress Tracker' },
  { tab: 'memberships', label: 'Memberships', shortLabel: 'Plans', icon: <FaCrown />, aria: 'Memberships' },
  { tab: 'messages', label: 'Messages', shortLabel: 'Chat', icon: <FaComments />, aria: 'Trainer Messages' },
  { tab: 'ai', label: 'AI Insights', shortLabel: 'AI', icon: <FaRobot />, aria: 'AI-Powered Insights' },
  { tab: 'settings', label: 'Settings', shortLabel: 'Settings', icon: <FaCog />, aria: 'User Settings' },
];

export default function Sidebar({
  userId,
  userName,
  activeTab,
  onTabChange,
  onLogout,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);

  const expandedWidth = 220;
  const collapsedWidth = 86;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? collapsedWidth : expandedWidth }}
      transition={{ duration: 0.28, ease: 'easeInOut' }}
      data-user-id={userId}
      style={{
        minHeight: 'calc(100vh - 24px)',
        height: 'calc(100vh - 24px)',
        position: 'sticky',
        top: 12,
        margin: '12px 0 12px 12px',
        zIndex: 1050,
        overflow: 'hidden',
        padding: '0.85rem 0.55rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 28,
        background:
          'linear-gradient(180deg, rgba(104,129,255,0.18), rgba(167,139,250,0.16), rgba(255,255,255,0.10))',
        border: '1px solid rgba(255,255,255,0.24)',
        boxShadow:
          '0 18px 42px rgba(15,23,42,0.12), inset 0 0 24px rgba(255,255,255,0.10)',
        backdropFilter: 'blur(26px)',
        WebkitBackdropFilter: 'blur(26px)',
      }}
    >
      <div>
        <div
          style={{
            minHeight: 58,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: '0.75rem',
            padding: collapsed ? '0' : '0 0.35rem',
            marginBottom: '0.85rem',
          }}
        >
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  color: '#111827',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Hi, {userName.split(' ')[0]}
              </div>

              <div
                style={{
                  color: '#64748b',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Member Dashboard
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label="Toggle sidebar menu"
            style={{
              width: 44,
              height: 44,
              minWidth: 44,
              borderRadius: 16,
              border: '1px solid rgba(139,92,246,0.12)',
              background: 'rgba(255,255,255,0.64)',
              color: '#334155',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 18px rgba(15,23,42,0.06)',
            }}
          >
            <FaBars size={16} />
          </button>
        </div>

        <nav style={{ display: 'grid', gap: '0.45rem' }}>
          {links.map(({ tab, label, shortLabel, icon, aria }) => {
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                aria-label={aria}
                aria-current={isActive ? 'page' : undefined}
                title={collapsed ? label : ''}
                style={{
                  width: '100%',
                  minHeight: collapsed ? 56 : 50,
                  border: isActive
                    ? '1px solid rgba(139,92,246,0.22)'
                    : '1px solid rgba(255,255,255,0.16)',
                  borderRadius: 18,
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(139,92,246,0.20), rgba(96,165,250,0.14))'
                    : 'rgba(255,255,255,0.34)',
                  color: isActive ? '#7c3aed' : '#334155',
                  display: 'flex',
                  flexDirection: collapsed ? 'column' : 'row',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: collapsed ? 4 : '0.75rem',
                  padding: collapsed ? '0.45rem 0.25rem' : '0 0.9rem',
                  cursor: 'pointer',
                  fontWeight: isActive ? 800 : 700,
                  fontSize: '0.9rem',
                  textAlign: collapsed ? 'center' : 'left',
                  boxShadow: isActive
                    ? '0 10px 24px rgba(139,92,246,0.10)'
                    : 'none',
                  transition:
                    'background 0.22s ease, color 0.22s ease, border 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease',
                }}
              >
                <span
                  style={{
                    fontSize: 17,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 20,
                  }}
                >
                  {icon}
                </span>

                <span
                  style={{
                    maxWidth: collapsed ? 64 : 140,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: collapsed ? '0.64rem' : '0.9rem',
                    lineHeight: 1.1,
                  }}
                >
                  {collapsed ? shortLabel : label}
                </span>
              </button>
            );
          })}

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title={collapsed ? 'Logout' : ''}
              aria-label="Logout"
              style={{
                width: '100%',
                minHeight: collapsed ? 56 : 50,
                marginTop: '0.65rem',
                border: '1px solid rgba(239,68,68,0.16)',
                borderRadius: 18,
                background: 'rgba(254,242,242,0.64)',
                color: '#dc2626',
                display: 'flex',
                flexDirection: collapsed ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 4 : '0.75rem',
                padding: collapsed ? '0.45rem 0.25rem' : '0 0.9rem',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: collapsed ? '0.64rem' : '0.9rem',
                textAlign: collapsed ? 'center' : 'left',
              }}
            >
              <FaSignOutAlt size={17} />
              <span>{collapsed ? 'Logout' : 'Logout'}</span>
            </button>
          )}
        </nav>
      </div>

      <div
        style={{
          padding: collapsed ? '0.75rem 0.25rem' : '0.9rem',
          borderRadius: 20,
          background: 'rgba(255,255,255,0.38)',
          border: '1px solid rgba(255,255,255,0.18)',
          textAlign: 'center',
        }}
      >
        {!collapsed ? (
          <>
            <div
              style={{
                color: '#111827',
                fontWeight: 800,
                fontSize: '0.85rem',
                marginBottom: 2,
              }}
            >
              🔥 Keep pushing
            </div>

            <div
              style={{
                color: '#64748b',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              FitByLena © {new Date().getFullYear()}
            </div>
          </>
        ) : (
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#334155',
              lineHeight: 1.2,
            }}
          >
            🔥
            <br />
            Go
          </div>
        )}
      </div>
    </motion.aside>
  );
}


{/*
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
*/}