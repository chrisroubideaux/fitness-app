// components/about/MissionSection.tsx
// components/about/MissionSection.tsx
'use client';

import { FaHandshake } from "react-icons/fa6";
import { motion } from "framer-motion";

export default function MissionSection() {
  return (
    <section className="mission-section pt-5">
      <div className="container-fluid my-5 pt-5">
        <div className="row align-items-center">
          
          {/* Left: Gradient Box with Icon */}
          <motion.div
            className="col-md-6 text-center mb-4 mb-md-0"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
            viewport={{ once: true }}
          >
            <div className="mission-gradient-box d-flex justify-content-center align-items-center">
              <FaHandshake className="mission-icon" />
            </div>
          </motion.div>

          {/* Right: Text Content */}
          <motion.div
            className="col-md-6 text-center text-md-start"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h1 className="fw-bold mb-4">My Mission</h1>

            {/* Single Box with Both Paragraphs */}
            <motion.div
              className="mission-text-box p-4 rounded shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h1 className="fw-semibold mb-3 fs-6">Empowering Every Step</h1>
              <p className="par fs-5 mb-4">
                To inspire a consistent, confident lifestyle through holistic training —
                combining strength, balance, and mindset coaching. Whether you&apos;re
                new to fitness or a seasoned athlete, I meet you exactly where you are.
                My mission is to help you build lasting habits, rediscover your inner
                power, and create a routine that feels sustainable — not stressful.
                This is more than just physical training; it&apos;s about mental
                resilience, self-love, and showing up for yourself every single day.
              </p>

              <h1 className="fw-semibold mb-3 fs-5">Building Lasting Habits</h1>
             
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}



{/*
import Image from "next/image";

export default function MissionSection() {
  return (
    <section className="mission-section pt-5 ">
      <div className="container-fluid my-5 pt-5">
        <div className="row align-items-center">
        
          <div className="col-md-6 text-center mb-4 mb-md-0">
            <Image
              src="/images/studio/image.png"
              alt="Mission Visual"
              width={300}
              height={300}
              className="img-fluid shadow mission-img"
            />
          </div>

       
          <div className="col-md-6 text-center text-md-start">
            <h1 className="fw-bold mb-3">My Mission</h1>
            <p className="text-dark fs-5">
             To inspire a consistent, confident lifestyle through holistic training — combining strength, balance, and mindset coaching. Whether you&apos;re new to fitness or a seasoned athlete, I meet you exactly where you are.

             My mission is to help you build lasting habits, rediscover your inner power, and create a routine that feels sustainable — not stressful. This is more than just physical training; it&apos;s about mental resilience, self-love, and showing up for yourself every single day.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
*/}