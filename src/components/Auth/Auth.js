import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const { token } = useParams(); // For reset password
  const location = useLocation();
  const [mode, setMode] = useState('login'); // 'login', 'forgot', 'reset'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.pathname === '/forgot-password') {
      setMode('forgot');
    } else if (location.pathname.startsWith('/reset-password')) {
      setMode('reset');
    } else {
      setMode('login');
    }
  }, [location.pathname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate API call
      console.log('Logging in with:', formData.email, formData.password);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // On success, navigate to home
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      // Simulate API call to send reset email
      console.log('Sending reset email to:', formData.email);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage('If an account with that email exists, a password reset link has been sent.');
      
      // Switch back to login after success
      setTimeout(() => {
        setMode('login');
        setMessage('');
        setFormData({ email: '', password: '', confirmPassword: '' });
      }, 3000);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to reset password using the token
      console.log('Resetting password for token:', token, 'New password:', formData.password);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setMessage('Password has been successfully reset. Redirecting to login...');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        setMode('login');
        setMessage('');
        setFormData({ email: '', password: '', confirmPassword: '' });
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Failed to reset password. The link may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setMessage('');
    setFormData({ email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {mode === 'login' && (
          <>
            <h1>Login</h1>
            
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
              </div>
              <button type="submit" className="auth-btn-submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="auth-links">
              <button onClick={() => switchMode('forgot')} className="link-btn">
                Forgot Password?
              </button>
              <button onClick={() => navigate('/register')} className="link-btn">
                Don't have an account? Register
              </button>
            </div>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <h1>Forgot Password</h1>
            
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            {!message && (
              <form onSubmit={handleForgotPassword} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email address"
                  />
                </div>
                <button type="submit" className="auth-btn-submit" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}

            <div className="auth-links">
              <button onClick={() => switchMode('login')} className="link-btn">
                Back to Login
              </button>
            </div>
          </>
        )}

        {mode === 'reset' && (
          <>
            <h1>Reset Password</h1>
            
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            {!message && (
              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="form-group">
                  <label htmlFor="password">New Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm new password"
                  />
                </div>
                <button type="submit" className="auth-btn-submit" disabled={isLoading}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;