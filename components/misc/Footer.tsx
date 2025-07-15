// Footer component
import { FaInstagram, FaFacebookF, FaYoutube, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer pt-5 pb-3 text-body mt-5 h-100">
      <div className="container-fluid">
        <div className="row">
          {/* About */}
          <div className="col-lg-2 col-md-4 col-6 mb-4">
            <h5 className=" mb-3">About</h5>
            <ul className="list-unstyled">
              <li><a href="#" className="footer-link">Meet Lena</a></li>
              <li><a href="#" className="footer-link">Social Feed</a></li>
              <li><a href="#" className="footer-link">Help</a></li>
              <li><a href="#" className="footer-link">Contact Us</a></li>
            </ul>
          </div>

          {/* Blog */}
          <div className="col-lg-2 col-md-4 col-6 mb-4">
            <h5 className="mb-3">Blog</h5>
            <ul className="list-unstyled">
              <li><a href="#" className="footer-link">Fitness Tips</a></li>
              <li><a href="#" className="footer-link">Nutrition</a></li>
              <li><a href="#" className="footer-link">Wellness</a></li>
              <li><a href="#" className="footer-link">Motivation</a></li>
             
            </ul>
          </div>

          {/* Resources */}
          <div className="col-lg-2 col-md-4 col-6 mb-4">
            <h5 className="mb-3">Resources</h5>
            <ul className="list-unstyled">
              <li><a href="#" className="footer-link">Training Plans</a></li>
              <li><a href="#" className="footer-link">Videos</a></li>
              <li><a href="#" className="footer-link">Meal Guides</a></li>
              <li><a href="#" className="footer-link">Mobile App</a></li>
            </ul>
          </div>

          {/* Follow Me */}
          <div className="col-lg-2 col-md-4 col-6 mb-4">
            <h5 className="mb-3">Follow Me</h5>
            <ul className="list-unstyled">
              <li><a href="#" className="footer-link"><FaInstagram className="me-2" />Instagram</a></li>
              <li><a href="#" className="footer-link"><FaFacebookF className="me-2" />Facebook</a></li>
              <li><a href="#" className="footer-link"><FaYoutube className="me-2" />YouTube</a></li>
              <li><a href="#" className="footer-link"><FaTwitter className="me-2" />Twitter</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-lg-4 col-md-8 col-12 mb-4">
            <h5 className=" mb-3">Subscribe to Our Newsletter</h5>
            <p className="">Get weekly tips, workouts, and wellness advice from Lena.</p>
            <form>
              <div className="mb-3">
                <input type="email" className="form-control" placeholder="Email Address" required />
              </div>
              <button type="submit" className="btn btn-md">Subscribe</button>
            </form>
          </div>

          {/* Bottom Footer */}
          <div className="col-12 mt-4">
            <ul className="list-inline text-center text-white-50 mb-0">
              <li className="list-inline-item text-dark">© {new Date().getFullYear()} Lena Cruz</li>
              <li className="list-inline-item mx-3 text-dark"><a href="#" className="text-reset">Privacy Policy</a></li>
              <li className="list-inline-item text-dark"><a href="#" className="text-reset">Terms</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}