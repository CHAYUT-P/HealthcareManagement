import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-content">
          <h1>
            Your Health, <br />
            <span>Our Priority</span>
          </h1>
          <p>
            Experience a new standard of medical care where clinical excellence meets a restorative environment designed for your complete well-being.
          </p>
          <div className="hero-btns">
            <Link to="/appointment" className="btn-primary btn-hero-primary">
              Book an Appointment
              <span className="material-icons">calendar_today</span>
            </Link>
            <button className="btn-hero-secondary">
              Learn More
            </button>
          </div>
        </div>
        
        <div className="hero-image-container">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCofejYUY5Cc-Pgu2WZEaHlWAXWcowXLegkM57p_Zj_oDCF_7KTYJfkuNUmoE1As6D-HyyZHVIAWXLvmhZC_-KPcvZcXR0wLxuJgy_j7YQ7j9lH262tcJI11svZtXTbajpp2uBdL7eQQz6UixEQKh0FnM8VrADtMs46DQZLRzmnk97CWXqEldFnTgAE0ONmq-FD_To4Fm23YUpdVG0ApsQud0i6iz-JpQqxI0UolRqemhSNM4i5qLuW-EhFxcJVNynp-_rnioRtrsqc" 
            alt="Modern clinic reception" 
            className="hero-image"
            referrerPolicy="no-referrer"
          />
          <div className="floating-card">
            <div className="floating-icon">
              <span className="material-icons">verified_user</span>
            </div>
            <div className="floating-text">
              <h4>Trusted Excellence</h4>
              <p>Over 15,000 satisfied patients served annually.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
