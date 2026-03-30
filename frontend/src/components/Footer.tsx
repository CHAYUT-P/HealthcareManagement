
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo" style={{ marginBottom: '1.5rem' }}>
              <span className="material-icons logo-icon" style={{ fontSize: '1.5rem' }}>spa</span>
              <span style={{ fontSize: '1.125rem' }}>Restorative Canvas</span>
            </Link>
            <p>A sanctuary of digital calm for your healthcare needs.</p>
            <p className="emergency">Emergency: 1169</p>
          </div>
          
          <div className="footer-links">
            <h4>Quick Links</h4>
            <nav className="footer-nav">
              <Link to="/">Home</Link>
              <Link to="/services">Our Services</Link>
              <Link to="/doctors">Find a Doctor</Link>
            </nav>
          </div>
          
          <div className="footer-links">
            <h4>Support</h4>
            <nav className="footer-nav">
              <Link to="/contact">Contact</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/portal">Patient Portal</Link>
            </nav>
          </div>
          
          <div className="newsletter">
            <h4>Newsletter</h4>
            <p>Get wellness tips and clinic updates delivered to your inbox.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Your email" />
              <button className="btn-send">
                <span className="material-icons" style={{ fontSize: '1rem' }}>send</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2024 Restorative Canvas Clinic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
