// /components/contact/ContactInfo.tsx
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

export default function ContactInfo() {
  return (
    <div>
      <h5 className="fw-bold mb-3">Get in Touch</h5>
      <ul className="list-unstyled mb-4">
        <li className="mb-3 d-flex align-items-center">
          <FaEnvelope className="me-3 social-icon" />
          <span>lena@fitbylena.com</span>
        </li>
        <li className="mb-3 d-flex align-items-center">
          <FaPhoneAlt className="me-3 social-icon" />
          <span>+1 (555) 123-4567</span>
        </li>
        <li className="mb-3 d-flex align-items-center">
          <FaMapMarkerAlt className="me-3 social-icon " />
          <span>Brooklyn, NY</span>
        </li>
      </ul>
      <div className="d-flex gap-3">
        <a href="#"><FaFacebookF size={24} className="social-icon" /></a>
        <a href="#"><FaInstagram size={24} className="social-icon" /></a>
        <a href="#"><FaYoutube size={28} className="social-icon " /></a>
      </div>
      <p className="small text-muted mt-4 mb-0">
        © 2025 Fit by Lena. All rights reserved.
      </p>
    </div>
  );
}
