// components/profile/sidebar/Sidebar.tsx
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
  FaTimes,
} from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const expandedWidth = 220;
  const collapsedWidth = 86;

  const renderNav = (isMobileDrawer = false) => (
    <nav
      style={{
        display: 'grid',
        gap: isMobileDrawer ? '0.5rem' : '0.35rem',
      }}
    >
      {links.map(({ tab, label, shortLabel, icon, aria }) => {
        const isActive = activeTab === tab;
        const compact = collapsed && !isMobileDrawer;

        return (
          <button
            key={tab}
            type="button"
            onClick={() => {
              onTabChange(tab);
              if (isMobileDrawer) setMobileOpen(false);
            }}
            aria-label={aria}
            aria-current={isActive ? 'page' : undefined}
            title={compact ? label : ''}
            style={{
              width: '100%',
              minHeight: compact ? 44 : 44,
              border: isActive
                ? '1px solid rgba(139,92,246,0.22)'
                : '1px solid rgba(255,255,255,0.16)',
              borderRadius: 16,
              background: isActive
                ? 'linear-gradient(135deg, rgba(139,92,246,0.20), rgba(96,165,250,0.14))'
                : 'rgba(255,255,255,0.34)',
              color: isActive ? '#7c3aed' : '#334155',
              display: 'flex',
              flexDirection: compact ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: compact ? 'center' : 'flex-start',
              gap: compact ? 2 : '0.7rem',
              padding: compact ? '0.28rem 0.15rem' : '0 0.8rem',
              cursor: 'pointer',
              fontWeight: isActive ? 800 : 700,
              textAlign: compact ? 'center' : 'left',
              boxShadow: isActive
                ? '0 10px 24px rgba(139,92,246,0.10)'
                : 'none',
            }}
          >
            <span
              style={{
                fontSize: compact ? 15 : 16,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 19,
              }}
            >
              {icon}
            </span>

            <span
              style={{
                maxWidth: compact ? 64 : 150,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: compact ? '0.56rem' : '0.86rem',
                lineHeight: 1.05,
              }}
            >
              {compact ? shortLabel : label}
            </span>
          </button>
        );
      })}

      {onLogout && (
        <button
          type="button"
          onClick={() => {
            onLogout();
            if (isMobileDrawer) setMobileOpen(false);
          }}
          title={collapsed && !isMobileDrawer ? 'Logout' : ''}
          aria-label="Logout"
          style={{
            width: '100%',
            minHeight: collapsed && !isMobileDrawer ? 44 : 44,
            marginTop: '0.3rem',
            border: '1px solid rgba(239,68,68,0.16)',
            borderRadius: 16,
            background: 'rgba(254,242,242,0.64)',
            color: '#dc2626',
            display: 'flex',
            flexDirection: collapsed && !isMobileDrawer ? 'column' : 'row',
            alignItems: 'center',
            justifyContent:
              collapsed && !isMobileDrawer ? 'center' : 'flex-start',
            gap: collapsed && !isMobileDrawer ? 2 : '0.7rem',
            padding:
              collapsed && !isMobileDrawer ? '0.28rem 0.15rem' : '0 0.8rem',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: collapsed && !isMobileDrawer ? '0.56rem' : '0.86rem',
          }}
        >
          <FaSignOutAlt size={15} />
          <span>Logout</span>
        </button>
      )}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open profile menu"
        className="d-lg-none"
        style={{
          position: 'fixed',
          top: 14,
          left: 14,
          zIndex: 3000,
          width: 46,
          height: 46,
          borderRadius: 16,
          border: '1px solid rgba(139,92,246,0.16)',
          background: 'rgba(255,255,255,0.88)',
          color: '#334155',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 28px rgba(15,23,42,0.12)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <FaBars size={18} />
      </button>

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? collapsedWidth : expandedWidth }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        data-user-id={userId}
        className="d-none d-lg-flex"
        style={{
          height: 'calc(100vh - 16px)',
          position: 'sticky',
          top: 8,
          margin: '8px 0 8px 8px',
          zIndex: 1050,
          overflow: 'hidden',
          padding: '0.55rem 0.45rem',
          flexDirection: 'column',
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
        <div
          style={{
            flex: '0 0 auto',
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: '0.65rem',
            padding: collapsed ? '0' : '0 0.25rem',
            marginBottom: '0.4rem',
          }}
        >
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  color: '#111827',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Hi, {userName.split(' ')[0]}
              </div>

              <div
                style={{
                  color: '#64748b',
                  fontSize: '0.7rem',
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
              width: 40,
              height: 40,
              minWidth: 40,
              borderRadius: 15,
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
            <FaBars size={15} />
          </button>
        </div>

        <div
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            overflow: 'visible',
            paddingBottom: '0.35rem',
          }}
        >
          {renderNav(false)}
        </div>

        <div
          style={{
            flex: '0 0 auto',
            marginTop: '0.35rem',
            padding: collapsed ? '0.42rem 0.12rem' : '0.55rem',
            borderRadius: 18,
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
                  fontSize: '0.78rem',
                  lineHeight: 1.15,
                }}
              >
                🔥 Keep pushing
              </div>
              <div
                style={{
                  color: '#64748b',
                  fontSize: '0.66rem',
                  fontWeight: 700,
                }}
              >
                FitByLena © {new Date().getFullYear()}
              </div>
            </>
          ) : (
            <div
              style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                color: '#334155',
                lineHeight: 1.1,
              }}
            >
              🔥
              <br />
              Go
            </div>
          )}
        </div>
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="d-lg-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 3998,
                background: 'rgba(15,23,42,0.45)',
                backdropFilter: 'blur(6px)',
              }}
            />

            <motion.aside
              className="d-lg-none"
              initial={{ x: -310 }}
              animate={{ x: 0 }}
              exit={{ x: -310 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{
                position: 'fixed',
                top: 12,
                left: 12,
                bottom: 12,
                width: 'min(86vw, 300px)',
                zIndex: 3999,
                borderRadius: 28,
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                background:
                  'linear-gradient(180deg, rgba(239,246,255,0.96), rgba(245,243,255,0.96))',
                border: '1px solid rgba(255,255,255,0.36)',
                boxShadow: '0 30px 80px rgba(15,23,42,0.22)',
                overflow: 'hidden',
              }}
            >
              <div
                className="d-flex align-items-center justify-content-between"
                style={{ marginBottom: '1rem', flex: '0 0 auto' }}
              >
                <div>
                  <div style={{ color: '#111827', fontWeight: 900 }}>
                    Hi, {userName.split(' ')[0]}
                  </div>
                  <div
                    style={{
                      color: '#64748b',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    Member Dashboard
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close profile menu"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 15,
                    border: '1px solid rgba(139,92,246,0.12)',
                    background: 'rgba(255,255,255,0.76)',
                    color: '#334155',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {renderNav(true)}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
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