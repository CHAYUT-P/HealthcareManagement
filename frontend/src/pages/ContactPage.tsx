import { useState } from 'react';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = "67011096@kmitl.ac.th";
    const mailSubject = encodeURIComponent(`${formData.subject} - ${formData.name}`);
    const mailBody = encodeURIComponent(`${formData.message}\n\n-----------------\nFrom: ${formData.name}\nReply-to: ${formData.email}`);
    
    window.location.href = `mailto:${targetEmail}?subject=${mailSubject}&body=${mailBody}`;
  };

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
                  <p>123 kmitl, Ladkrabang 10520</p>
                </div>
              </div>
              
              <div className="info-item">
                <span className="material-icons">phone</span>
                <div>
                  <h4>Call Us</h4>
                  <p>099-999-9999</p>
                </div>
              </div>
              
              <div className="info-item">
                <span className="material-icons">email</span>
                <div>
                  <h4>Email Us</h4>
                  <p>healthcareclinic@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="contact-form-container">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" placeholder="Enter your name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" placeholder="Enter your email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select id="subject" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                  <option>General Inquiry</option>
                  <option>Appointment Booking</option>
                  <option>Medical Records</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows={5} placeholder="How can we help you?" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required></textarea>
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
