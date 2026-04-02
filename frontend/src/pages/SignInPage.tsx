import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SignInPage.css';

const SignInPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    citizenId: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg("Passwords do not match");
        return;
      }
      if (!formData.citizenId) {
        setErrorMsg("National ID is required");
        return;
      }
      setIsLoading(true);

      try {
        const response = await fetch('http://localhost:8000/patients/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            national_id: formData.citizenId,
            password: formData.password,
            name: formData.fullName || 'Patient',
            email: formData.email,
          })
        });
        if (!response.ok) {
          const err = await response.json();
          setErrorMsg(err.detail || "Registration failed");
          setIsLoading(false);
          return;
        }
        setIsLoading(false);
        setIsSuccess(true);
      } catch (e: any) {
        setErrorMsg(e.message || "Registration failed");
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);

      setTimeout(async () => {
        try {
          const response = await fetch('http://localhost:8000/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ username: formData.email, password: formData.password })
          });
          if (!response.ok) throw new Error("Invalid credentials");
          const data = await response.json();

          login(data.access_token, data.role);
          setIsLoading(false);
          setIsSuccess(true);
        } catch (e: any) {
          setErrorMsg(e.message || "Invalid credentials");
          setIsLoading(false);
        }
      }, 500);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setIsSuccess(false);
    setErrorMsg('');
  };

  if (isSuccess) {
    return (
      <div className="signin-page container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="auth-success-card"
        >
          <div className="success-icon">
            <CheckCircle2 size={64} color="var(--secondary)" />
          </div>
          <h2>{isSignUp ? 'Account Created!' : 'Welcome Back!'}</h2>
          <p>
            {isSignUp
              ? `Thank you for joining us. You can now sign in with your National ID.`
              : `Successfully signed in. Redirecting you to your dashboard...`}
          </p>
          {isSignUp ? (
            <button onClick={() => { setIsSuccess(false); setIsSignUp(false); }} className="btn-primary">Go to Sign In</button>
          ) : (
            <Link to="/" className="btn-primary">Go to Home</Link>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="signin-page container">
      <div className="auth-wrapper">
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, maxWidth: isSignUp ? 600 : 450 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.1 }}
          className="auth-card"
        >
          <div className="auth-header">
            <div className="auth-logo">
              <span className="material-icons">spa</span>
            </div>
            <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
            <p>{isSignUp ? 'Join our community for personalized care.' : 'Sign in to manage your health journey.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  layout
                  key="signup-extra-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="fullName">Full Name</label>
                    <div className="input-wrapper">
                      <UserPlus className="input-icon" size={18} />
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        placeholder="Somchai Jaidee"
                        required={isSignUp}
                        value={formData.fullName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="citizenId">National ID (บัตรประชาชน)</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={18} />
                      <input
                        type="text"
                        id="citizenId"
                        name="citizenId"
                        placeholder="1-2345-67890-12-3"
                        required={isSignUp}
                        value={formData.citizenId}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-wrapper">
                      <Phone className="input-icon" size={18} />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="+66 XX XXX XXXX"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="email">{isSignUp ? 'Email Address' : 'Email / National ID'}</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type={isSignUp ? "email" : "text"}
                  id="email"
                  name="email"
                  placeholder={isSignUp ? "your@email.com" : "nurse1@example.com or National ID"}
                  required={!isSignUp}
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  layout
                  key="confirm-password-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="••••••••"
                        required={isSignUp}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {errorMsg && (
              <div style={{ color: 'var(--destructive)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
                {errorMsg}
              </div>
            )}

            {!isSignUp && (
              <div className="forgot-password">
                <a href="#">Forgot password?</a>
              </div>
            )}

            <button
              type="submit"
              className={`btn-primary btn-auth ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button onClick={toggleMode} className="btn-text">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </motion.div>

        <div className="auth-info">
          <div className="info-item">
            <div className="info-icon">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4>Faster Booking</h4>
              <p>Your details are pre-filled for quick scheduling.</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4>Health History</h4>
              <p>Access your past appointments and medical records.</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4>Personalized Care</h4>
              <p>Get tailored recommendations and reminders.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
