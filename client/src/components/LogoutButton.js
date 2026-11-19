import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LogoutButton.css';

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication
    logout();
    
    // Force redirect to login page
    navigate('/login', { replace: true });
    
    // Fallback: hard refresh to ensure clean state
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  };

  return (
    <button className="logout-button" onClick={handleLogout}>
      <span className="logout-icon">🚪</span>
      Logout
    </button>
  );
}

export default LogoutButton;
