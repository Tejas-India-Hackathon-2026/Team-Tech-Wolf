import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sprout, 
  LogIn, 
  Eye, 
  EyeOff, 
  Lock, 
  Phone, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  Tractor,
  User,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_CREDENTIALS } from '../services/authService';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine redirect target
  const fromLocation = location.state?.from?.pathname || '/dashboard';
  const pendingAction = location.state?.action;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your mobile number or email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(identifier, password, rememberMe);
      const userRole = res?.user?.user_type;
      
      // Navigate to admin console if admin, or previous intended destination
      if (userRole === 'Admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(fromLocation, { replace: true, state: { pendingAction } });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    setErrorMessage(null);
    if (type === 'farmer') {
      setIdentifier(DEMO_CREDENTIALS.farmer.identifier);
      setPassword(DEMO_CREDENTIALS.farmer.password);
    } else if (type === 'owner') {
      setIdentifier(DEMO_CREDENTIALS.owner.identifier);
      setPassword(DEMO_CREDENTIALS.owner.password);
    } else if (type === 'admin') {
      setIdentifier(DEMO_CREDENTIALS.admin.identifier);
      setPassword(DEMO_CREDENTIALS.admin.password);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
  };

  return (
    <div className="page-wrapper container" style={{ maxWidth: '520px', margin: '1.5rem auto 3rem auto' }}>
      
      {/* Branding Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 0.75rem auto',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #15803d, #166534)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(22, 101, 52, 0.25)'
        }}>
          <Sprout size={28} />
        </div>
        <h1 style={{ fontSize: '1.85rem', color: 'var(--text-heading)', margin: '0 0 0.25rem 0', fontWeight: 800 }}>
          AGRO-<span style={{ color: 'var(--primary-700)' }}>SMART</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
          Smart Farming. Smarter Decisions. Better Harvests.
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="glass-card" style={{
        background: '#ffffff',
        border: '1px solid var(--border-green)',
        boxShadow: 'var(--shadow-md)',
        padding: '2rem 1.75rem',
        borderRadius: 'var(--radius-md)',
        position: 'relative'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', margin: 0, fontWeight: 700 }}>
              Sign In to Your Account
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.15rem 0 0 0' }}>
              Access AI diagnostics, agro weather, and farm machinery
            </p>
          </div>
          <span className="badge-pill badge-emerald" style={{ fontSize: '0.7rem' }}>
            <ShieldCheck size={12} /> Prototype Auth
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 0.9rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#991b1b',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick Demo Pre-fill Toolbar */}
        <div style={{
          background: '#f8faf7',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.65rem 0.85rem',
          marginBottom: '1.35rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={13} style={{ color: 'var(--accent-gold)' }} />
            Quick Demo Login:
          </span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleFillDemo('farmer')}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff',
                border: '1px solid var(--border-green)',
                color: 'var(--primary-800)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              👨‍🌾 Farmer
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('owner')}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff',
                border: '1px solid var(--border-green)',
                color: 'var(--primary-800)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              🚜 Owner
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff',
                border: '1px solid #fca5a5',
                color: '#991b1b',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              🛡️ Demo Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Mobile / Email Input */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
              Mobile Number or Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 9876543210 or farmer@agro-smart.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
                autoComplete="username"
              />
              <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
                {identifier.includes('@') ? <Mail size={16} /> : <Phone size={16} />}
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{ background: 'none', border: 'none', color: 'var(--primary-700)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                autoComplete="current-password"
              />
              <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
                <Lock size={16} />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.8rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: 0
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: 'var(--primary-700)', width: '16px', height: '16px' }}
            />
            <label htmlFor="remember-me" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer', margin: 0, userSelect: 'none' }}>
              Remember me on this browser
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700, justifyContent: 'center' }}
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In to AGRO-SMART</span>
              </>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            New to AGRO-SMART?{' '}
          </span>
          <Link
            to="/register"
            style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-700)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
          >
            Create Account <ArrowRight size={14} />
          </Link>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{ background: '#ffffff', maxWidth: '420px', width: '100%', padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: '0 0 0.5rem 0' }}>
              Reset Your Password
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              In prototype demo mode, enter your email or mobile to receive a simulated reset OTP.
            </p>

            {forgotSuccess ? (
              <div>
                <div style={{ background: '#f0fdf4', border: '1px solid var(--border-green)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', color: 'var(--primary-900)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  ✓ Demo password reset instructions sent! For testing you can sign in using default password <strong>Farmer@123</strong> or <strong>Owner@123</strong>.
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSuccess(false);
                  }}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit}>
                <div className="form-group">
                  <label className="form-label">Registered Mobile or Email</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 9876543210 or farmer@agro-smart.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;
