// /components/contact/ContactInfo.tsx
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

export default function ContactInfo() {
  return (
    <div className="p-4 rounded shadow-sm">
      <h4 className="mb-3 fw-bold">Get in Touch</h4>
      <ul className="list-unstyled mb-4">
        <li className="mb-2">
          <FaEnvelope className="social-icon me-2" />
          <span>lena@fitbylena.com</span>
        </li>
        <li className="mb-2">
          <FaPhoneAlt className="social-icon me-2" />
          <span>+1 (555) 123-4567</span>
        </li>
        <li className="mb-2">
          <FaMapMarkerAlt className="social-icon me-2" />
          <span>Brooklyn, NY</span>
        </li>
      </ul>
      <div className="d-flex gap-3">
        <a href="#"><FaFacebookF className="social-icon fs-5" /></a>
        <a href="#"><FaInstagram className="social-icon fs-5" /></a>
        <a href="#"><FaYoutube className="social-icon fs-3" /></a>
      </div>
       <h6 className="mt-3"><span >Copyright © 2025 Fit by Lena</span></h6>
    </div>
  );
}
