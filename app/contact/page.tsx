// Contact page
// Contact page
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
          {/* Top Section */}
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

          {/* Centered Contact Info */}
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

        {/* Footer */}
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


{/*
import ContactForm from "@/components/contact/ContactForm"; 
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
         
          <div className="text-center mb-4">
            <AdminContact />
            <h1 className="fw-bold mt-3 fs-2">Contact Us</h1>
            <p className="text-muted">
              We’d love to hear from you. Send us a message or connect with us
              directly.
            </p>
          </div>

         
          <div className="row g-4">
         
            <div className="col-lg-6 col-12">
              <div className="card shadow-md border-0 rounded-4 h-100">
                <div className="card-body p-4">
                  <ContactForm />
                </div>
              </div>
            </div>

           
            <div className="col-lg-6 col-12">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body p-4">
                  <ContactInfo />
                </div>
              </div>
            </div>
          </div>
        </div>

       
        <TrainersFooter />
      </section>
    </>
  );
}

*/}

