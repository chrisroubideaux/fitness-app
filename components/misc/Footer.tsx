// components/misc/Footer.tsx

import { FaInstagram, FaFacebookF, FaYoutube, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer pt-5 pb-3 mt-5">
      <div className="container mt-5">
        <div className="row gy-4 mt-3">
          {/* Branding */}
          <div className="col-lg-3 col-md-6">
            <h1 className="footer-brand fs-5">FitByLena</h1>
            <p className="text-muted">
              Your AI-powered personal trainer. Workouts, wellness, and
              motivation — all in one place.
            </p>
            <div className="social-icons mt-3">
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaYoutube /></a>
              <a href="#"><FaTiktok /></a>
            </div>
          </div>

          {/* Links */}
          <div className="col-lg-2 col-md-6">
            <h6 className="footer-title">About</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="footer-link">Meet Lena</a></li>
              <li><a href="#" className="footer-link">Social Feed</a></li>
              <li><a href="#" className="footer-link">Help</a></li>
              <li><a href="#" className="footer-link">Contact Us</a></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="footer-title">Resources</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="footer-link">Training Plans</a></li>
              <li><a href="#" className="footer-link">Videos</a></li>
              <li><a href="#" className="footer-link">Meal Guides</a></li>
              <li><a href="#" className="footer-link">Mobile App</a></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="footer-title">Blog</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="footer-link">Fitness Tips</a></li>
              <li><a href="#" className="footer-link">Nutrition</a></li>
              <li><a href="#" className="footer-link">Wellness</a></li>
              <li><a href="#" className="footer-link">Motivation</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-lg-3">
            <h6 className="footer-title">Stay Updated</h6>
            <p className="text-muted">Get weekly tips, workouts, and motivation from Lena.</p>
            <form className="newsletter-form d-flex">
              <input
                type="email"
                className="form-control me-2"
                placeholder="Email Address"
                required
              />
              <button type="submit" className="btn btn-sm">Subscribe</button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom text-center mt-4 pt-3 border-top">
          <p className="small mb-0 text-muted">
            © {new Date().getFullYear()} FitByLena · 
            <a href="#" className="footer-link ms-2">Privacy Policy</a> · 
            <a href="#" className="footer-link ms-2">Terms</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
