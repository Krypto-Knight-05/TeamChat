import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import useAuth from '../context/authContext';
import axios from '../api/axios';

const Signin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/signin', form);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💬</div>
          <span className="auth-logo-text">TeamChat</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue to your workspace.</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="signin-email">Email Address</label>
            <input
              id="signin-email"
              className="form-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signin-password">Password</label>
            <input
              id="signin-password"
              className="form-input"
              type="password"
              name="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            id="signin-submit-btn"
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-link">
          New to TeamChat? <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Signin;
