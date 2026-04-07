// components/navbar/Nav.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu,
  FiX,
  FiHome,
  FiClipboard,
  FiCalendar,
  FiInfo,
  FiMail,
  FiUser,
} from 'react-icons/fi';

const navItems = [
  { href: '/', label: 'Home', icon: <FiHome /> },
  { href: '/plans', label: 'Plans', icon: <FiClipboard /> },
  { href: '/events', label: 'Events', icon: <FiCalendar /> },
  { href: '/about', label: 'About', icon: <FiInfo /> },
  { href: '/contact', label: 'Contact', icon: <FiMail /> },
];

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const accent = '#8b5cf6';
  const textPrimary = '#ffffff';
  const textMuted = 'rgba(255,255,255,0.68)';
  const panelBg = 'rgba(15, 15, 22, 0.78)';
  const panelBorder = 'rgba(255,255,255,0.08)';
  const mobileBg = 'rgba(10,10,16,0.97)';

  return (
    <>
      {/* MOBILE FLOATING HAMBURGER */}
      <div
        className="d-flex d-lg-none align-items-center justify-content-between"
        style={{
          position: 'fixed',
          top: 14,
          left: 14,
          right: 14,
          height: 58,
          padding: '0 1rem',
          zIndex: 9999,
          borderRadius: 18,
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          background: 'rgba(243, 243, 249, 0.45)',
          border: `1px solid ${panelBorder}`,
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            color: textPrimary,
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
          }}
        >
          FitByLena
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          style={{
            border: 'none',
            background: 'transparent',
            color: textPrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {isOpen ? <FiX size={26} /> : <FiMenu size={26} />}
        </button>
      </div>

      {/* DESKTOP SIDEBAR */}
      <motion.aside
        className="d-none d-lg-flex"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        style={{
          width: 78,
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          height: '100vh',
          zIndex: 2000,
          padding: '1rem 0.4rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          background: panelBg,
          borderRight: `1px solid ${panelBorder}`,
          borderTop: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          borderRadius: 0,
          boxShadow: `
            inset 0 0 25px rgba(68, 124, 235, 0.02),
            0 10px 40px rgba(0,0,0,0.35),
            0 0 24px rgba(139,92,246,0.14)
          `,
        }}
      >
        <div style={{ width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1.2rem',
            }}
          >
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                color: textPrimary,
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textAlign: 'center',
                lineHeight: 1.1,
              }}
            >
              FitByLena
            </Link>
          </div>

          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              alignItems: 'center',
            }}
          >
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ textDecoration: 'none' }}
                >
                  <motion.div
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      position: 'relative',
                      width: 54,
                      minHeight: 54,
                      borderRadius: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      color: active ? textPrimary : textMuted,
                      background: active
                        ? 'linear-gradient(180deg, rgba(139,92,246,0.24), rgba(139,92,246,0.10))'
                        : 'transparent',
                      border: active
                        ? '1px solid rgba(139,92,246,0.35)'
                        : '1px solid transparent',
                      boxShadow: active
                        ? '0 0 18px rgba(139,92,246,0.18)'
                        : 'none',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {active && (
                      <motion.div
                        layoutId="fit-sidebar-indicator"
                        style={{
                          position: 'absolute',
                          left: -6,
                          top: '22%',
                          height: '56%',
                          width: 3,
                          borderRadius: 999,
                          background: accent,
                          boxShadow: `
                            0 0 10px ${accent},
                            0 0 20px ${accent}
                          `,
                        }}
                      />
                    )}

                    <div style={{ fontSize: 18 }}>{item.icon}</div>

                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              style={{
                width: 54,
                minHeight: 54,
                borderRadius: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                color: textPrimary,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${panelBorder}`,
              }}
            >
              <FiUser size={18} />
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                Login
              </span>
            </motion.div>
          </Link>
        </div>
      </motion.aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="d-lg-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.45)',
                zIndex: 9997,
              }}
            />

            <motion.aside
              className="d-lg-none"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: 270,
                height: '100vh',
                zIndex: 9998,
                padding: '5rem 1.25rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                background: mobileBg,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRight: `1px solid ${panelBorder}`,
                boxShadow: '0 0 30px rgba(0,0,0,0.35)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                {navItems.map((item) => {
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      style={{ textDecoration: 'none' }}
                    >
                      <motion.div
                        whileHover={{ x: 4 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '0.9rem 1rem',
                          borderRadius: 14,
                          color: active ? textPrimary : textMuted,
                          background: active
                            ? 'rgba(139,92,246,0.18)'
                            : 'rgba(255,255,255,0.03)',
                          border: active
                            ? '1px solid rgba(139,92,246,0.28)'
                            : `1px solid ${panelBorder}`,
                          fontWeight: active ? 600 : 500,
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{item.icon}</span>
                        <span>{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}

                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  style={{ textDecoration: 'none', marginTop: '0.5rem' }}
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '0.9rem 1rem',
                      borderRadius: 14,
                      color: textPrimary,
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${panelBorder}`,
                      fontWeight: 600,
                    }}
                  >
                    <FiUser size={18} />
                    <span>Login</span>
                  </motion.div>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

{/*

// components/navbar/Nav.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser } from 'react-icons/fi';

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="d-flex align-items-center justify-content-between px-4 py-3 position-relative shadow-sm"
      style={{
        background: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
     
      <Link
        href="/"
        className="fw-bold fs-5 nav-link text-decoration-none"
        style={{ letterSpacing: '0.5px' }}
      >
        FitByLena
      </Link>

     
      <ul className="d-none d-lg-flex list-unstyled mb-0 align-items-center gap-4">
        <li>
          <Link href="/plans" className="nav-link text-decoration-none fw-medium">
            Plans
          </Link>
        </li>
        <li>
          <Link href="/events" className="nav-link text-decoration-none fw-medium">
            Events
          </Link>
        </li>
        <li>
          <Link href="/about" className="nav-link text-decoration-none fw-medium">
            About
          </Link>
        </li>
        <li>
          <Link href="/contact" className="nav-link text-decoration-none fw-medium">
            Contact
          </Link>
        </li>
        <li>
          <Link
            href="/login"
            className="btn btn-sm px-4 py-2 rounded-pill text-white fw-semibold d-flex align-items-center gap-2"
          >
            <FiUser className='bio-icon' size={18} /> Login
          </Link>
        </li>
      </ul>

      <button
        className="d-lg-none btn border-0 p-0"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        {isOpen ? (
          <FiX size={28} className="bio-icon" />
        ) : (
          <FiMenu size={28} className="bio-icon" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="position-absolute top-100 start-0 w-100 bg-white shadow-lg rounded-bottom py-3 d-lg-none"
            style={{ zIndex: 999 }}
          >
            <ul className="list-unstyled mb-0 text-center">
              {[
                { href: '/plans', label: 'Plans' },
                { href: '/events', label: 'Events' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' },
              ].map((item) => (
                <li key={item.href} className="my-3">
                  <Link
                    href={item.href}
                    className="text-dark fw-medium text-decoration-none"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-4">
                <Link
                  href="/login"
                  className="btn btn-sm px-4 py-2 rounded-pill text-white d-inline-flex align-items-center gap-2"
                 
                  onClick={() => setIsOpen(false)}
                >
                  <FiUser className='bio-icon' size={18} /> Login
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}


*/}
