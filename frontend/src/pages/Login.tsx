import React, { useState } from 'react';
import { api } from '../api';

interface LoginProps {
  onLoginSuccess: (token: string, username: string, role: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Tester');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isRegister) {
        await api.post('Auth/register', { username, password, role });
        setSuccess('Registration successful! Please login.');
        setIsRegister(false);
        setPassword('');
      } else {
        const data = await api.post('Auth/login', { username, password });
        onLoginSuccess(data.token, data.username, data.role);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fadeIn">
        <div className="auth-header">
          <div className="auth-logo">T</div>
          <h2 className="auth-title">Testing Tracker</h2>
          <p className="auth-subtitle">
            {isRegister ? 'Create an account to start tracking' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && (
          <div className="auth-error" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label" htmlFor="role">Role</label>
              <select
                id="role"
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Tester">Tester</option>
                <option value="QA Lead">QA Lead</option>
                <option value="Developer">Developer</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          )}

          <button id="auth-submit-btn" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          {isRegister ? (
            <>
              Already have an account?
              <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setIsRegister(false); setError(null); }}>Sign In</a>
            </>
          ) : (
            <>
              Don't have an account?
              <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setIsRegister(true); setError(null); }}>Register</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
