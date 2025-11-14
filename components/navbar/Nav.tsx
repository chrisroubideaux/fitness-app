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
      {/* Brand */}
      <Link
        href="/"
        className="fw-bold fs-5 nav-link text-decoration-none"
        style={{ letterSpacing: '0.5px' }}
      >
        FitByLena
      </Link>

      {/* Desktop Menu */}
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

      {/* Mobile Toggle */}
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

      {/* Mobile Menu Overlay */}
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

