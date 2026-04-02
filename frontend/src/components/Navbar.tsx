
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
          <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Contact</NavLink>

        </nav>

        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {user.role === 'ADMIN' && <Link to="/admin" className="btn-signin">Admin Panel</Link>}
              {user.role !== 'ADMIN' && <Link to="/patient" className="btn-signin" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>My Health Profile</Link>}
              {(user.role === 'nurse' || user.role === 'NURSE') && (
                <Link to="/nurse/dashboard" className="btn-signin" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>Nurse Dashboard</Link>
              )}
              {(user.role === 'doctor' || user.role === 'DOCTOR') && <Link to="/doctor" className="btn-signin">Doctor Dashboard</Link>}
              <button onClick={handleLogout} className="btn-signin" style={{ background: 'transparent', border: '1px solid var(--border)' }}>Logout</button>
            </div>
          ) : (
            <Link to="/signin" className="btn-signin">Sign In</Link>
          )}
          
          {(!user || !['nurse', 'doctor', 'NURSE', 'DOCTOR'].includes(user.role)) && (
            <Link to="/appointment" className="btn-primary">Book Appointment</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
