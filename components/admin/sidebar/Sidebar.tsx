// components/admin/sidebar/Sidebar.tsx
// components/admin/sidebar/Sidebar.tsx
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
  FaTimes,
} from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

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

const links: {
  tab: AdminSidebarTab;
  label: string;
  shortLabel: string;
  icon: React.ReactElement;
  aria: string;
}[] = [
  { tab: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: <FaHome />, aria: 'Admin Dashboard' },
  { tab: 'calendar', label: 'Calendar', shortLabel: 'Calendar', icon: <FaCalendarAlt />, aria: 'Admin Calendar' },
  { tab: 'notifications', label: 'Notifications', shortLabel: 'Alerts', icon: <IoNotificationsOutline />, aria: 'Admin Notifications' },
  { tab: 'plans', label: 'Plans', shortLabel: 'Plans', icon: <FaCrown />, aria: 'Manage Membership Plans' },
  { tab: 'users', label: 'Users', shortLabel: 'Users', icon: <FaUsers />, aria: 'Manage Users' },
  { tab: 'messages', label: 'Messages', shortLabel: 'Chat', icon: <FaComments />, aria: 'Admin Messages' },
  { tab: 'ai', label: 'AI Insights', shortLabel: 'AI', icon: <FaRobot />, aria: 'AI Insights' },
  { tab: 'settings', label: 'Settings', shortLabel: 'Settings', icon: <FaCog />, aria: 'Admin Settings' },
];

export default function AdminSidebar({
  adminId,
  adminName,
  activeTab,
  onTabChange,
  onLogout,
}: AdminSidebarProps) {
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
              minHeight: 44,
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
            minHeight: 44,
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
        aria-label="Open admin menu"
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
        data-admin-id={adminId}
        data-role="admin"
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
                Hi, {adminName.split(' ')[0]}
              </div>

              <div
                style={{
                  color: '#64748b',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Admin Dashboard
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label="Toggle admin sidebar menu"
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
                🔐 Admin mode
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
              🔐
              <br />
              Admin
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
                    Hi, {adminName.split(' ')[0]}
                  </div>
                  <div
                    style={{
                      color: '#64748b',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    Admin Dashboard
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close admin menu"
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
                <span className="me-2"><FaSignOutAlt className="me-2" /></span>
                {!collapsed && 'Logout'}
              </button>
            </li>
          )}
        </ul>
      </div>

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

*/}

