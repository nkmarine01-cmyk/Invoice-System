import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate empty fields
    if (!username || username.trim() === '') {
      setError('Username is required');
      return;
    }

    if (!password || password.trim() === '') {
      setError('Password is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username: username.trim(),
        password
      });

      const { token, username: returnedUsername } = response.data;
      
      // Store token and update auth state
      login(token, returnedUsername);
      
      // Redirect to main application
      navigate('/dashboard');
    } catch (err) {
      setIsLoading(false);
      
      if (err.response) {
        setError(err.response.data.error || 'Invalid username or password');
      } else if (err.request) {
        setError('Unable to connect. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'username') {
      setUsername(value);
    } else {
      setPassword(value);
    }
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  return (
    <div className="login-container">
      {/* Animated wave background */}
      <div className="waves-container">
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#4682b4" fillOpacity="0.3" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,117.3C672,107,768,117,864,138.7C960,160,1056,192,1152,186.7C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="wave wave1"></path>
          <path fill="#4682b4" fillOpacity="0.5" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,138.7C672,117,768,107,864,128C960,149,1056,203,1152,213.3C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="wave wave2"></path>
          <path fill="#4682b4" fillOpacity="0.7" d="M0,224L48,218.7C96,213,192,203,288,213.3C384,224,480,256,576,256C672,256,768,224,864,202.7C960,181,1056,171,1152,176C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="wave wave3"></path>
        </svg>
      </div>

      {/* Login card with glassmorphism */}
      <div className="login-card">
        <div className="logo-container">
          <h1 className="company-title">M MARINE SERVICES</h1>
          <p className="company-tagline">Marine Engineering Solutions & IT Services</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              disabled={isLoading}
              autoComplete="username"
              aria-label="Username"
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              aria-label="Password"
              aria-required="true"
            />
          </div>

          {error && (
            <div className="error-message" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
            aria-label="Login"
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="login-hint">
          <p>Default: admin / admin123</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
