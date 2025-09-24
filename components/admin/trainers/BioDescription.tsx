"use client";

import { motion } from "framer-motion";

type Props = {
  bio: string | null;
};

export default function BioDescription({ bio }: Props) {
  if (!bio) return null;

  return (
    <motion.div
      className="mb-5 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <p className="fs-5 text-muted mx-auto" style={{ maxWidth: "800px" }}>
        {bio}
      </p>
    </motion.div>
  );
}
