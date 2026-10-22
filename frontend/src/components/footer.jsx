import React from "react";

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="container footer-grid">
        {/* Logo & About */}
        <div className="footer-about">
          <div className="footer-logo">
            <img src="/logon.png" alt="AyurSutra Logo" className="footer-logo-img" />
            <h3>AyurSutra</h3>
          </div>
          <p>
            Intelligent Therapy Recommendation and Scheduling Ayurvedic platform
            designed to bring holistic wellness through technology and tradition.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#hero">Home</a></li>
            <li><a href="#our-platform">Our Platform</a></li>
            <li><a href="#about-ayurveda">Ayurvedic Therapy</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/book-demo">Register</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p><i className="fas fa-envelope"></i> info@ayursutra.com</p>
          <p><i className="fas fa-phone"></i> +91 98765 43210</p>
          <p><i className="fas fa-map-marker-alt"></i> Pune, Maharashtra, India</p>
        </div>

        {/* Social Media */}
        <div className="footer-social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 AyurSutra. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;