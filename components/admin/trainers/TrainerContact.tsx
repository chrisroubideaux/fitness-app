// components/admin/trainers/TrainerContact.tsx
"use client";

import { motion, Variants } from "framer-motion";
import { FaEnvelope, FaPhone } from "react-icons/fa";

type Props = {
  email?: string | null;
  phone_number?: string | null;
};

// Parent container animation
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Child item animation
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function TrainerContact({ email, phone_number }: Props) {
  return (
    <motion.div
      className="row text-center mb-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="col-md-6" variants={itemVariants}>
        <FaEnvelope className="social-icon fs-4 me-2 text-info" />
        <span>{email || "Not available"}</span>
      </motion.div>

      <motion.div className="col-md-6" variants={itemVariants}>
        <FaPhone className="fs-4 social-icon me-2 text-success" />
        <span>{phone_number || "Not available"}</span>
      </motion.div>
    </motion.div>
  );
}

