import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../store/authSlice';
import './AdminLogin.css';
import '../App.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@test.org');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://safevoice2-heuo.vercel.app/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(loginSuccess(data));
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-background"></div>
      
      <div className="admin-login-content">
        {/* Left Side - Branding */}
        <div className="admin-brand-section">
          <div className="admin-brand-content">
            <div className="admin-logo">
              <span className="admin-logo-icon">🛡️</span>
              <h1 className="admin-logo-text">SafeVoice</h1>
            </div>
            <h2 className="admin-brand-title">Admin Portal</h2>
            <p className="admin-brand-description">
              Secure administration dashboard for managing anonymous conversations 
              and ensuring platform integrity.
            </p>
            <div className="admin-features">
              <div className="admin-feature">
                <span className="admin-feature-icon">🔒</span>
                <span>Enterprise Security</span>
              </div>
              <div className="admin-feature">
                <span className="admin-feature-icon">📊</span>
                <span>Real-time Analytics</span>
              </div>
              <div className="admin-feature">
                <span className="admin-feature-icon">🌐</span>
                <span>Multi-tenant Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="admin-form-section">
          <div className="admin-form-container">
            <div className="admin-form-header">
              <h2 className="admin-form-title">Sign In</h2>
              <p className="admin-form-subtitle">Access your admin dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="admin-form">
              {error && (
                <div className="admin-error-alert">
                  <span className="admin-error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <div className="admin-input-group">
                <label className="admin-label">Email Address</label>
                <input
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-input"
                  placeholder="admin@yourorganization.com"
                  required
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Password</label>
                <input
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="admin-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="admin-button-spinner"></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </form>

            <div className="admin-demo-section">
              <h4 className="admin-demo-title">Demo Credentials</h4>
              <div className="admin-demo-credentials">
                <div className="admin-demo-item">
                  <strong>Email:</strong> *****
                </div>
                <div className="admin-demo-item">
                  <strong>Password:</strong> ****
                </div>
              </div>
            </div>

            <div className="admin-footer">
              <p className="admin-footer-text">
                Secure access • Encrypted connection • Activity monitored
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;