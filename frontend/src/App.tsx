import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/Variables.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ServicesPage from './pages/ServicesPage';
import DoctorsPage from './pages/DoctorsPage';
import ContactPage from './pages/ContactPage';
import AppointmentPage from './pages/AppointmentPage';
import SignInPage from './pages/SignInPage'
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/appointment" element={<AppointmentPage />} />
              <Route path="/signin" element={<SignInPage />} />
              {/* Dummy route for profile to prevent 404s when user clicks Patient Profile */}
              <Route path="/profile" element={
                <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                  <h2>Patient Profile</h2>
                  <p>Your appointments and health records will appear here.</p>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
