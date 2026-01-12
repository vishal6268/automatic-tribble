import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">MCQ Platform</Link>
      </div>
      <ul className="navbar-nav">
        <li className="nav-item"><Link to="/" className="nav-link">Home</Link></li>
        <li className="nav-item"><Link to="/practice" className="nav-link">Practice</Link></li>
        <li className="nav-item"><Link to="/leaderboard" className="nav-link">Leaderboard</Link></li>
        <li className="nav-item"><Link to="/login" className="nav-link login-btn">Login</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;