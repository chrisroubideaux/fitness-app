// components/profile/messages/ChatAvatar.tsx

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ChatAvatar() {
  return (
    <motion.div
      className="d-flex align-items-center gap-3 mb-4"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="rounded-circle overflow-hidden shadow-sm"
        style={{
          width: 58,
          height: 58,
          border: '2px solid rgba(214,132,255,0.45)',
          flexShrink: 0,
        }}
      >
        <Image
          src="/images/admin/image2.png"
          alt="Lena"
          width={58}
          height={58}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      <div className="text-start">
        <h5
          className="mb-1 fw-semibold"
          style={{
            background:
              'linear-gradient(90deg, rgba(218,112,255,1) 0%, rgba(255,128,171,1) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Lena AI Coach
        </h5>
        <p className="mb-0 text-muted" style={{ fontSize: '0.92rem' }}>
          Ask about training, recovery, nutrition, and your membership plan.
        </p>
      </div>
    </motion.div>
  );
}