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
            src="https://vsqclinic.com/wp-content/uploads/2025/09/%E0%B8%84%E0%B8%A5%E0%B8%B4%E0%B8%99%E0%B8%B4%E0%B8%81%E0%B9%80%E0%B8%AA%E0%B8%A3%E0%B8%B4%E0%B8%A1%E0%B8%84%E0%B8%A7%E0%B8%B2%E0%B8%A1%E0%B8%87%E0%B8%B2%E0%B8%A1%E0%B8%AA%E0%B8%B0%E0%B8%AD%E0%B8%B2%E0%B8%94.jpg" 
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
              <p>Track your Health.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
