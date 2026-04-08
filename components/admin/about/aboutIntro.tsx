// components/admin/about/aboutIntro.tsx
'use client';

import { useEffect, useState } from 'react';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { motion } from 'framer-motion';

function SocialLink({
  href,
  icon,
  label,
  hoverBackground,
  hoverColor,
  hoverBorder,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  hoverBackground: string;
  hoverColor: string;
  hoverBorder: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.85rem 1rem',
        borderRadius: 16,
        textDecoration: 'none',
        fontWeight: 700,
        fontSize: '0.95rem',
        background: isHovered ? hoverBackground : 'rgba(255,255,255,0.08)',
        color: isHovered ? hoverColor : '#ffffff',
        border: isHovered
          ? hoverBorder
          : '1px solid rgba(255,255,255,0.14)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        transform: isHovered
          ? 'translateY(-3px) scale(1.02)'
          : 'translateY(0) scale(1)',
        boxShadow: isHovered
          ? '0 14px 28px rgba(15,23,42,0.16)'
          : 'none',
        transition:
          'background 0.22s ease, color 0.22s ease, border 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease',
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.12)',
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span>{label}</span>
    </a>
  );
}

export default function AboutIntro() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      style={{
        width: '100%',
        padding: isDesktop ? '6rem 2rem 6rem 7.25rem' : '4.5rem 1rem',
        background:
          'linear-gradient(135deg, #111827 0%, #1f2937 35%, #7c3aed 85%, #ec4899 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top right, rgba(255,255,255,0.12), transparent 30%), radial-gradient(circle at bottom left, rgba(255,255,255,0.08), transparent 28%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-60px',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '-130px',
          left: isDesktop ? '100px' : '-50px',
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          filter: 'blur(52px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div className="row justify-content-center">
          <motion.div
            className="col-12 col-xl-9"
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            <div
              style={{
                borderRadius: 34,
                padding: isDesktop ? '3rem' : '1.5rem',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))',
                border: '1px solid rgba(255,255,255,0.14)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                boxShadow:
                  '0 20px 50px rgba(15,23,42,0.22), inset 0 0 0 1px rgba(255,255,255,0.05)',
              }}
            >
              <div
                style={{
                  maxWidth: '860px',
                  margin: '0 auto',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.45rem 0.9rem',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.12)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                    border: '1px solid rgba(255,255,255,0.16)',
                  }}
                >
                  About Lena
                </span>

                <h1
                  style={{
                    fontSize: 'clamp(2.4rem, 5vw, 4.8rem)',
                    lineHeight: 0.96,
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    color: '#ffffff',
                    marginBottom: '1.25rem',
                  }}
                >
                  Strong coaching.
                  <br />
                  Real support.
                  <br />
                  A more confident you.
                </h1>

                <p
                  style={{
                    fontSize: 'clamp(1rem, 1.5vw, 1.14rem)',
                    lineHeight: 1.9,
                    color: 'rgba(255,255,255,0.84)',
                    marginBottom: '1.25rem',
                    maxWidth: '760px',
                    marginInline: 'auto',
                  }}
                >
                  I’m Lena Cruz, a certified personal trainer and wellness coach
                  passionate about helping you feel strong, confident, and
                  empowered — inside and out.
                </p>

                <p
                  style={{
                    fontSize: '1rem',
                    lineHeight: 1.85,
                    color: 'rgba(255,255,255,0.76)',
                    marginBottom: '2rem',
                    maxWidth: '720px',
                    marginInline: 'auto',
                  }}
                >
                  My approach blends personalized training, sustainable
                  structure, and real accountability so your fitness journey
                  feels motivating, modern, and built around your actual life.
                </p>

                <div
                  className="d-flex justify-content-center flex-wrap"
                  style={{
                    gap: '0.85rem',
                  }}
                >
                  <SocialLink
                    href="https://facebook.com"
                    label="Facebook"
                    icon={<FaFacebookF />}
                    hoverBackground="rgba(59,130,246,0.14)"
                    hoverColor="#93c5fd"
                    hoverBorder="1px solid rgba(59,130,246,0.22)"
                  />

                  <SocialLink
                    href="https://instagram.com"
                    label="Instagram"
                    icon={<FaInstagram />}
                    hoverBackground="linear-gradient(135deg, rgba(236,72,153,0.16), rgba(168,85,247,0.16))"
                    hoverColor="#f9a8d4"
                    hoverBorder="1px solid rgba(236,72,153,0.22)"
                  />

                  <SocialLink
                    href="https://youtube.com"
                    label="YouTube"
                    icon={<FaYoutube />}
                    hoverBackground="rgba(239,68,68,0.14)"
                    hoverColor="#fca5a5"
                    hoverBorder="1px solid rgba(239,68,68,0.22)"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
{/*
'use client';

import Image from "next/image";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { motion } from "framer-motion";

export default function AboutIntro() {
  return (
    <section className="about-intro hero-section shadow-lg">
      <div className="container">
        <div className="row align-items-center">
          
          <motion.div
            className="col-md-6 text-center text-md-start"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h1 className="fw-bold mb-4">About Me</h1>
            <p className="lead mb-4">
              I’m Lena Cruz, a certified personal trainer and wellness coach
              passionate about helping you feel strong, confident, and empowered —
              inside and out.
            </p>
            <div className="d-flex justify-content-center justify-content-md-start gap-3 flex-wrap">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon d-flex align-items-center gap-2 fs-6"
              >
                <FaFacebookF /> <span>Facebook</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon d-flex align-items-center gap-2 fs-6"
              >
                <FaInstagram /> <span>Instagram</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon d-flex align-items-center gap-2 fs-6"
              >
                <FaYoutube /> <span>YouTube</span>
              </a>
            </div>
          </motion.div>

          <motion.div
            className="col-md-6 text-center mt-5 mt-md-0"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Image
              src="/images/admin/image5.png"
              alt="Lena Cruz"
              width={420}
              height={420}
              className=" shadow-lg about-image"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

*/}

