// components/contact/ContactForm.tsx

"use client";
import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted:", formData);
  };

  return (
    <form onSubmit={handleSubmit} className=" p-4 rounded-4">
      <h5 className="fw-bold mb-3">Send a Message</h5>
      <div className="mb-3">
        <input
          type="text"
          name="name"
          className="form-control rounded-pill px-3 py-2"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="email"
          name="email"
          className="form-control rounded-pill px-3 py-2"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <textarea
          name="message"
          rows={4}
          className="form-control rounded-4 px-3 py-2"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>
      <button
        type="submit"
        className="btn w-100 text-white fw-semibold rounded-pill py-2"
        style={{
          background: "linear-gradient(90deg, #be83feff, #2575fc)",
          border: "none",
        }}
      >
        Send Message
      </button>
    </form>
  );
}
