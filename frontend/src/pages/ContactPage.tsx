import React from 'react';
import './ContactPage.css';

const ContactPage = () => {
  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-grid">
          <div className="contact-info">
            <div className="section-header">
              <h1>Get in Touch</h1>
              <p>We're here to answer your questions and help you start your restorative journey.</p>
              <div className="header-line"></div>
            </div>
            
            <div className="info-items">
              <div className="info-item">
                <span className="material-icons">location_on</span>
                <div>
                  <h4>Visit Us</h4>
                  <p>123 Serenity Lane, Wellness Valley, CA 90210</p>
                </div>
              </div>
              
              <div className="info-item">
                <span className="material-icons">phone</span>
                <div>
                  <h4>Call Us</h4>
                  <p>+1 (555) 000-1169</p>
                </div>
              </div>
              
              <div className="info-item">
                <span className="material-icons">email</span>
                <div>
                  <h4>Email Us</h4>
                  <p>hello@restorativecanvas.com</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="contact-form-container">
            <form className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" placeholder="Enter your name" />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" placeholder="Enter your email" />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select id="subject">
                  <option>General Inquiry</option>
                  <option>Appointment Booking</option>
                  <option>Medical Records</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows={5} placeholder="How can we help you?"></textarea>
              </div>
              
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
