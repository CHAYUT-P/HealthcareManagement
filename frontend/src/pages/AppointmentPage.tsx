import React, { useState } from 'react';
import { Calendar, Clock, User, Mail, Phone, Stethoscope, ChevronRight, CheckCircle2, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AppointmentPage.css';

const services = [
  "General Consultation",
  "Dermatology",
  "Cardiology",
  "Pediatrics",
  "Physical Therapy",
  "Dental Care",
  "Mental Health Support"
];

const doctors = [
  { id: 1, name: "Dr. Sarah Mitchell", specialty: "General Practitioner" },
  { id: 2, name: "Dr. James Wilson", specialty: "Cardiologist" },
  { id: 3, name: "Dr. Elena Rodriguez", specialty: "Dermatologist" },
  { id: 4, name: "Dr. David Chen", specialty: "Pediatrician" }
];

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
];

const AppointmentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookingType, setBookingType] = useState<'guest' | null>(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    service: '',
    doctor: '',
    date: '',
    time: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const resetForm = () => {
    setIsSuccess(false);
    setBookingType(null);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      service: '',
      doctor: '',
      date: '',
      time: ''
    });
  };

  if (isSuccess) {
    return (
      <div className="appointment-page container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="success-card"
        >
          <div className="success-icon">
            <CheckCircle2 size={64} color="var(--secondary)" />
          </div>
          <h2>Appointment Confirmed!</h2>
          <p>Thank you, {formData.firstName} {formData.lastName}. Your appointment for {formData.service} with {formData.doctor} has been scheduled for {formData.date} at {formData.time}.</p>
          <p className="confirmation-note">A confirmation email has been sent to {formData.email}.</p>
          <button className="btn-primary" onClick={resetForm}>Book Another Appointment</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="appointment-page container">
      <div className="appointment-header">
        <h1>Book an Appointment</h1>
        <p>Choose your preferred way to schedule a visit with our specialists.</p>
      </div>

      <div className="appointment-container">
        <AnimatePresence mode="wait">
          {!user && !bookingType ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="selection-grid"
            >
              <div className="selection-card" onClick={() => setBookingType('guest')}>
                <div className="card-icon guest-icon">
                  <User size={32} />
                </div>
                <h3>Continue as Guest</h3>
                <p>Quick and easy booking without creating an account.</p>
                <div className="card-action">
                  <span>Start Booking</span>
                  <ChevronRight size={20} />
                </div>
              </div>

              <div className="selection-card" onClick={() => navigate('/signin')}>
                <div className="card-icon signin-icon">
                  <LogIn size={32} />
                </div>
                <h3>Sign In to Book</h3>
                <p>Access your securely stored details for faster checkout.</p>
                <div className="card-action">
                  <span>Go to Sign In</span>
                  <ChevronRight size={20} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="booking-form-wrapper"
            >
              {!user && bookingType === 'guest' && (
                <button className="btn-back" onClick={() => setBookingType(null)}>
                  <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                  <span>Change Booking Method</span>
                </button>
              )}

              <form onSubmit={handleSubmit} className="appointment-form">
                <div className="form-section">
                  <h3><User size={20} /> Patient Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <div className="input-wrapper">
                        <User className="input-icon" size={18} />
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          placeholder="Somchai"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <div className="input-wrapper">
                        <User className="input-icon" size={18} />
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          placeholder="Jaidee"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <div className="input-wrapper">
                        <Mail className="input-icon" size={18} />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          placeholder="john@example.com"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <div className="input-wrapper">
                        <Phone className="input-icon" size={18} />
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          placeholder="(555) 000-0000"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3><Stethoscope size={20} /> Appointment Details</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="service">Service</label>
                      <div className="input-wrapper">
                        <Stethoscope className="input-icon" size={18} />
                        <select
                          id="service"
                          name="service"
                          required
                          value={formData.service}
                          onChange={handleInputChange}
                        >
                          <option value="">Select a service</option>
                          {services.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="doctor">Preferred Doctor</label>
                      <div className="input-wrapper">
                        <User className="input-icon" size={18} />
                        <select
                          id="doctor"
                          name="doctor"
                          required
                          value={formData.doctor}
                          onChange={handleInputChange}
                        >
                          <option value="">Select a doctor</option>
                          {doctors.map(d => <option key={d.id} value={d.name}>{d.name} - {d.specialty}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3><Calendar size={20} /> Date & Time</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="date">Appointment Date</label>
                      <div className="input-wrapper">
                        <Calendar className="input-icon" size={18} />
                        <input
                          type="date"
                          id="date"
                          name="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={formData.date}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="time">Preferred Time</label>
                      <div className="input-wrapper">
                        <Clock className="input-icon" size={18} />
                        <select
                          id="time"
                          name="time"
                          required
                          value={formData.time}
                          onChange={handleInputChange}
                        >
                          <option value="">Select a time</option>
                          {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className={`btn-primary btn-large ${isSubmitting ? 'loading' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm Appointment'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppointmentPage;
