import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sprout, 
  Lock, 
  Phone, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_CREDENTIALS, normalizeRole } from '../services/authService';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromLocation = location.state?.from?.pathname || null;
  const pendingAction = location.state?.action || null;
  const targetEquipment = location.state?.targetEquipment || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage('Please enter your mobile number or email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(cleanId, password, rememberMe);
      const userRole = normalizeRole(res?.user?.role || res?.user?.user_type);
      
      // If there was an intercepted booking attempt, return there
      if (fromLocation && targetEquipment) {
        navigate(fromLocation, { replace: true, state: { targetEquipment, action: pendingAction } });
        return;
      }

      // Role-based dashboard routing
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (userRole === 'machine_owner') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email/mobile or password.');
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
    <div className="page-wrapper container" style={{ maxWidth: '500px', margin: '2rem auto 3.5rem auto' }}>
      
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
        borderRadius: 'var(--radius-md)'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', margin: 0, fontWeight: 700 }}>
              Sign In to AGRO-SMART
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.15rem 0 0 0' }}>
              Access AI diagnostics, agro weather, and farm machinery
            </p>
          </div>
          <span className="badge-pill badge-emerald" style={{ fontSize: '0.7rem' }}>
            <ShieldCheck size={12} /> Demo Auth
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
            Quick Demo Fill:
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
              🚜 Machinery Owner
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
          
          <div className="form-group" style={{ marginBottom: '1.15rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={14} style={{ color: 'var(--primary-700)' }} />
              <span>Mobile Number or Email *</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 9876543210 or farmer@agro-smart.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.15rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lock size={14} style={{ color: 'var(--primary-700)' }} />
                <span>Password *</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(true);
                  setForgotSuccess(false);
                  setForgotEmail(identifier.includes('@') ? identifier : '');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-700)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.35rem' }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: 'var(--primary-700)', cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="rememberMe" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
              Remember me on this device
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', fontSize: '0.95rem' }}
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In to AGRO-SMART</span>
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <span>Don't have an account yet? </span>
          <Link
            to="/register"
            style={{ color: 'var(--primary-700)', fontWeight: 700, textDecoration: 'none' }}
          >
            Create Account →
          </Link>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
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
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem',
            maxWidth: '420px',
            width: '100%',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: '0 0 0.5rem 0' }}>
              Password Reset Assistance
            </h3>
            {forgotSuccess ? (
              <div>
                <div style={{ background: '#f0fdf4', border: '1px solid var(--border-green)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--primary-900)', fontSize: '0.84rem', marginBottom: '1rem' }}>
                  Demo reset instructions simulated for <strong>{forgotEmail}</strong>. (For demo accounts, use <code>Farmer@123</code> or <code>Owner@123</code>).
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsForgotModalOpen(false)}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: '0 0 1rem 0' }}>
                  Enter your registered mobile or email to receive password recovery instructions.
                </p>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter email or mobile"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsForgotModalOpen(false)}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Send Link
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
