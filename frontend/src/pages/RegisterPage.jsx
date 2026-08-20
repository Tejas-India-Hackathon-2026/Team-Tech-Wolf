import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Lock, 
  Phone, 
  Mail, 
  User, 
  MapPin, 
  Tractor, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATE_DISTRICTS = {
  Maharashtra: ['Pune', 'Nashik', 'Ahmednagar', 'Baramati', 'Nagpur', 'Kolhapur', 'Aurangabad', 'Solapur'],
  Bihar: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Nalanda', 'Purnia', 'Darbhanga', 'Samastipur'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Hoshiarpur', 'Sangrur'],
  Haryana: ['Karnal', 'Hisar', 'Ambala', 'Rohtak', 'Kurukshetra', 'Panipat', 'Sirsa'],
  'Uttar Pradesh': ['Agra', 'Varanasi', 'Lucknow', 'Kanpur', 'Prayagraj', 'Meerut', 'Bareilly'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur', 'Bikaner', 'Ajmer', 'Alwar'],
  Gujarat: ['Ahmedabad', 'Surat', 'Rajkot', 'Vadodara', 'Bhavnagar', 'Junagadh'],
  Karnataka: ['Bengaluru Rural', 'Mysuru', 'Belagavi', 'Hubballi', 'Dharwad', 'Ballari']
};

const STATES = Object.keys(STATE_DISTRICTS);

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('Farmer');
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState('Pune');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    const districts = STATE_DISTRICTS[stateName] || ['District'];
    setSelectedDistrict(districts[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: fullName.trim(),
        phone: mobileNumber.trim(),
        email: email.trim().toLowerCase(),
        password,
        user_type: userType,
        state: selectedState,
        district: selectedDistrict
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your information and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper container" style={{ maxWidth: '600px', margin: '1.5rem auto 3rem auto' }}>
      
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
          Join AGRO-<span style={{ color: 'var(--primary-700)' }}>SMART</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
          Create an account for AI Crop Disease Protection & Smart Farm Management
        </p>
      </div>

      {/* Main Registration Card */}
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
              Create Your Farm Account
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.15rem 0 0 0' }}>
              Select your role and enter your location details
            </p>
          </div>
          <span className="badge-pill badge-emerald" style={{ fontSize: '0.7rem' }}>
            <ShieldCheck size={12} /> Prototype Registration
          </span>
        </div>

        {/* Error Alert Banner */}
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

        <form onSubmit={handleSubmit}>
          
          {/* User Type Selection Tabs */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
              Select Account Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setUserType('Farmer')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${userType === 'Farmer' ? 'var(--primary-700)' : 'var(--border-subtle)'}`,
                  background: userType === 'Farmer' ? 'var(--primary-100)' : '#ffffff',
                  color: userType === 'Farmer' ? 'var(--primary-900)' : 'var(--text-muted)',
                  fontWeight: userType === 'Farmer' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <User size={18} style={{ color: userType === 'Farmer' ? 'var(--primary-700)' : 'var(--text-dim)' }} />
                <span>Farmer</span>
              </button>

              <button
                type="button"
                onClick={() => setUserType('Machinery Owner')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${userType === 'Machinery Owner' ? 'var(--primary-700)' : 'var(--border-subtle)'}`,
                  background: userType === 'Machinery Owner' ? 'var(--primary-100)' : '#ffffff',
                  color: userType === 'Machinery Owner' ? 'var(--primary-900)' : 'var(--text-muted)',
                  fontWeight: userType === 'Machinery Owner' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Tractor size={18} style={{ color: userType === 'Machinery Owner' ? 'var(--primary-700)' : 'var(--text-dim)' }} />
                <span>Machinery Owner</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Rajesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
                required
              />
              <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
                <User size={16} />
              </div>
            </div>
          </div>

          {/* Mobile Number & Email Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Mobile Number *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="10-digit number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  style={{ paddingLeft: '2.4rem' }}
                  required
                />
                <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
                  <Phone size={16} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  placeholder="farmer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.4rem' }}
                  required
                />
                <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
                  <Mail size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* State & District Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                State *
              </label>
              <select
                className="form-control"
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
              >
                {STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                District *
              </label>
              <select
                className="form-control"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                {(STATE_DISTRICTS[selectedState] || []).map((dst) => (
                  <option key={dst} value={dst}>{dst}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Password & Confirm Password Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                  required
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
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Confirm Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                  required
                />
                <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
                  <Lock size={16} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700, marginTop: '0.5rem', justifyContent: 'center' }}
          >
            {loading ? (
              <span>Creating your account...</span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create {userType} Account</span>
              </>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already registered?{' '}
          </span>
          <Link
            to="/login"
            style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-700)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
          >
            Sign In here <ArrowRight size={14} />
          </Link>
        </div>

      </div>

    </div>
  );
};

export default RegisterPage;
