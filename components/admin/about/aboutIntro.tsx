// AboutIntro component
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

export default function AboutIntro() {
  return (
    <section className="about-intro hero-section">
      <div className="container text-center pt-5">
        <h1 className="fw-bold mt-5 pt-5">About Me</h1>
        <p className="lead mb-4 pt-3">
          I’m Lena Cruz, a certified personal trainer and wellness coach passionate about helping you feel strong, confident, and empowered — inside and out.
        </p>

        <div className=" d-flex justify-content-center gap-4 mt-4 flex-wrap py-1">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon d-flex align-items-center gap-2 fs-6"
          >
            <FaFacebookF /> <span>Facebook</span>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon d-flex align-items-center gap-2 fs-6"
          >
            <FaInstagram /> <span>Instagram</span>
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon d-flex align-items-center gap-2 fs-6"
          >
            <FaYoutube className="social-icon" /> <span>YouTube</span>
          </a>
        </div>
      </div>
    </section>
  );
}




{/*
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

export default function AboutIntro() {
  return (
    <section className="about-intro hero-section">
      <div className="container text-center pt-5">
        <h1 className="fw-bold mt-5 pt-5">About Me</h1>
        <p className="lead mb-4">
          I’m Lena Cruz, a certified personal trainer and wellness coach passionate about helping you feel strong, confident, and empowered — inside and out.
        </p>

        <div className="social-links d-flex justify-content-center gap-4 mt-4">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-link">
            <FaFacebookF />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-link">
            <FaInstagram />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon-link">
            <FaYoutube />
          </a>
        </div>
      </div>
    </section>
  );
}

*/}