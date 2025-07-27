//  ContactForm.tsx
// /components/contact/ContactForm.tsx
"use client";
import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send formData to backend or email API
    console.log("Submitted:", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded shadow-sm ">
      <h5 className="mb-3 fw-bold">Send a Message</h5>
      <div className="mb-3">
        <input
          type="text"
          name="name"
          className="form-control"
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
          className="form-control"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <textarea
          name="message"
          rows={5}
          className="form-control"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="btn btn-md w-100">Send</button>
    </form>
  );
}
