// Contact pag3
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



{/*

  "use client";

import { motion } from "framer-motion";
import ContactInfo from "@/components/contact/contactInfo";
import Nav from "@/components/navbar/Nav";
import AdminContact from "@/components/admin/about/adminContact";
import TrainersFooter from "@/components/admin/trainers/TrainerFooter";

export default function Contact() {
  return (
    <>
      <Nav />

      <section
        className="min-vh-100 d-flex flex-column justify-content-between"
        style={{
          background: "linear-gradient(135deg, #fdfbfb, #ebedee)",
        }}
      >
        <div className="container py-5">
         
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <AdminContact />
            <h1 className="fw-bold mt-3 fs-2">Contact Us</h1>
            <p className="text-muted">
              We’d love to hear from you. Connect with us directly below.
            </p>
          </motion.div>

        
          <div className="d-flex justify-content-center align-items-center">
            <motion.div
              className="card shadow-lg border-0 rounded-4"
              style={{ maxWidth: "600px", width: "100%" }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <div className="card-body p-5">
                <ContactInfo />
              </div>
            </motion.div>
          </div>
        </div>

      
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <TrainersFooter />
        </motion.div>
      </section>
    </>
  );
}

*/}

