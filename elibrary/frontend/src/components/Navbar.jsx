import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/books" className="navbar-logo">
          📚 E-Library
        </Link>
        
        <div className="navbar-menu">
          <Link to="/books" className="navbar-link">Browse Books</Link>
          
          {isAuthenticated() ? (
            <>
              {isAdmin() && (
                <Link to="/admin" className="navbar-link admin-link">Admin Dashboard</Link>
              )}
              <Link to="/my-rentals" className="navbar-link">My Rentals</Link>
              <span className="navbar-user">Hello, {user?.name}</span>
              <button onClick={handleLogout} className="btn btn-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-secondary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
