
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="logo">
          <span className="material-icons logo-icon">spa</span>
          <span>Healthcare</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
          <NavLink to="/services" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Our Services</NavLink>
          <NavLink to="/doctors" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Find a Doctor</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Contact</NavLink>

        </nav>

        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {user.role === 'ADMIN' && <Link to="/admin" className="btn-signin">Admin Panel</Link>}
              {(!user.role || user.role === 'PATIENT') && <Link to="/patient" className="btn-signin">Patient Profile</Link>}
              {user.role === 'nurse' && (
                <>
                  <Link to="/nurse/search" className="btn-signin" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>Patient Search</Link>
                  <Link to="/nurse/queue" className="btn-signin">Active Queue</Link>
                </>
              )}
              {user.role === 'doctor' && <Link to="/doctor" className="btn-signin">Doctor Dashboard</Link>}
              {(user.role === 'NURSE' || user.role === 'DOCTOR') && <Link to="/staff" className="btn-signin">Staff Portal</Link>}
              <button onClick={handleLogout} className="btn-signin" style={{ background: 'transparent', border: '1px solid var(--border)' }}>Logout</button>
            </div>
          ) : (
            <Link to="/signin" className="btn-signin">Sign In</Link>
          )}
          <Link to="/appointment" className="btn-primary">Book Appointment</Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
