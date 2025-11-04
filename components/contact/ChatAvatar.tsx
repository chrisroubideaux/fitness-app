// components/contact/ChatAvatar.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ChatAvatar() {
  return (
    <motion.div
      className="d-flex flex-column align-items-center text-center mb-3"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div
        className="rounded-circle shadow-lg"
        style={{
          width: '100px',
          height: '100px',
          border: '3px solid rgba(170,0,255,0.6)',
          overflow: 'hidden',
          boxShadow: '0 0 20px rgba(170,0,255,0.4)',
        }}
      >
        <Image
          src="/images/admin/image2.png"
          alt="Lena Cruz"
          width={100}
          height={100}
          style={{ objectFit: 'cover' }}
        />
      </div>
      <motion.h5
        className="fw-bold mt-3 mb-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Lena Cruz
      </motion.h5>
      <motion.p
        className="text-muted"
        style={{ fontSize: '0.9rem' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Your Fitness Coach 💬
      </motion.p>
    </motion.div>
  );
}
