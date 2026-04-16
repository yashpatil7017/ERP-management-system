import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const displayName = currentUser?.name || currentUser?.email || 'User';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="navbar">
      <div className="navbar__left">
        <button
          type="button"
          className="navbar__menuBtn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <div className="navbar__title">ERP System</div>
      </div>

      <div className="navbar__right">
        <div className="navbar__user" title={displayName}>
          {displayName}
        </div>
        <button type="button" className="navbar__logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
