// app/contact/page.tsx
'use client';

import { motion } from 'framer-motion';
import { FaComments } from 'react-icons/fa';
import Nav from '@/components/navbar/Nav';
import ChatWindow from '@/components/contact/ChatWindow';
import TrainersFooter from "@/components/admin/trainers/TrainerFooter";

export default function Contact() {
  return (
    <>
    <div className='layout h-100'>
      <Nav />
      <main
        className="d-flex flex-column align-items-center justify-content-center text-center"
        style={{ minHeight: '100vh', padding: '40px 0' }}
      >
        {/* Title Section */}
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
            <FaComments size={28} style={{ color: 'rgba(214, 132, 255, 0.9)' }} />
            <h3
              className="fw-bold mb-0"
              style={{
                fontSize: '1.9rem',
                background:
                  'linear-gradient(90deg, rgba(218,112,255,1) 0%, rgba(255,128,171,1) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 6px rgba(218,112,255,0.4))',
              }}
            >
              Let’s Chat
            </h3>
          </div>

          <motion.span
            className="d-block mx-auto"
            style={{
              width: '180px',
              height: '2px',
              background:
                'linear-gradient(90deg, rgba(170,0,255,0.8), rgba(255,255,255,0.3), transparent)',
              borderRadius: '2px',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />

          <motion.p
            className="text-muted mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Drop a message or ask Lena about fitness, nutrition, or your workout plans.
          </motion.p>
        </motion.div>

        {/* Chat Window */}
        <ChatWindow />
      </main>
      <TrainersFooter />
    </div>
    </>
  );
}

