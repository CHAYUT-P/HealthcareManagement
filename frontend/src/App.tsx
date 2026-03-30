import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/Variables.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ServicesPage from './pages/ServicesPage';
import DoctorsPage from './pages/DoctorsPage';
import ContactPage from './pages/ContactPage';
import AppointmentPage from './pages/AppointmentPage';
import SignInPage from './pages/SignInPage'
import AdminDashboard from './pages/AdminDashboard';
import PatientDashboard from './pages/PatientDashboard';
import StaffDashboard from './pages/StaffDashboard';
import PatientRecords from './pages/PatientRecords';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SearchPage } from './pages/nurse/SearchPage';
import { QueuePage } from './pages/nurse/QueuePage';
import { DoctorDashboard } from './pages/DoctorDashboard';

export default function App() {
  return (
    <Router>
      <AuthProvider>
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
              <Route path="/nurse/search" element={
                <ProtectedRoute allowedRoles={['nurse']}>
                  <SearchPage />
                </ProtectedRoute>
              } />
              <Route path="/nurse/queue" element={
                <ProtectedRoute allowedRoles={['nurse']}>
                  <QueuePage />
                </ProtectedRoute>
              } />
              <Route path="/doctor" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/patient" element={<PatientDashboard />} />
              <Route path="/staff" element={<StaffDashboard />} />
              <Route path="/staff/patient/:id" element={<PatientRecords />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
