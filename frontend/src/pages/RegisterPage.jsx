import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Tractor, 
  ShieldCheck, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { normalizeRole } from '../services/authService';

const INDIAN_STATES = [
  'Maharashtra',
  'Bihar',
  'Punjab',
  'Haryana',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Gujarat',
  'Rajasthan',
  'Karnataka',
  'Telangana',
  'Tamil Nadu',
  'Andhra Pradesh',
  'West Bengal'
];

const DISTRICTS_MAP = {
  Maharashtra: ['Pune', 'Nashik', 'Nagpur', 'Ahmednagar', 'Baramati', 'Latur', 'Kolhapur', 'Akola'],
  Bihar: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Nalanda', 'Samastipur', 'Darbhanga'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Kapurthala'],
  Haryana: ['Karnal', 'Ambala', 'Hisar', 'Rohtak', 'Panipat', 'Kurukshetra', 'Sonipat'],
  'Uttar Pradesh': ['Agra', 'Varanasi', 'Lucknow', 'Kanpur', 'Prayagraj', 'Meerut', 'Bareilly'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur', 'Bikaner'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Hubballi', 'Belagavi', 'Belgaum'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  'Tamil Nadu': ['Coimbatore', 'Chennai', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Kurnool'],
  'West Bengal': ['Kolkata', 'Siliguri', 'Asansol', 'Durgapur', 'Bardhaman']
};

const RegisterPage = () => {
  const [role, setRole] = useState('farmer'); // 'farmer' or 'machine_owner'
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState('Pune');
  
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    const districts = DISTRICTS_MAP[newState] || ['Central District'];
    setSelectedDistrict(districts[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: fullName.trim(),
        phone: cleanPhone,
        email: email.trim().toLowerCase(),
        password,
        role: role,
        user_type: role === 'machine_owner' ? 'Machinery Owner' : 'Farmer',
        state: selectedState,
        district: selectedDistrict
      });

      const userRole = normalizeRole(res?.user?.role || role);
      if (userRole === 'machine_owner') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  const districtOptions = DISTRICTS_MAP[selectedState] || ['Central District'];

  return (
    <div className="page-wrapper container" style={{ maxWidth: '600px', margin: '2rem auto 3.5rem auto' }}>
      
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
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
          Create your free farm account in under 60 seconds
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

        {/* Account Type Selector (Farmer vs Machinery Owner) */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
            Select Your Account Type *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            
            <button
              type="button"
              onClick={() => setRole('farmer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: role === 'farmer' ? '2px solid var(--primary-700)' : '1px solid var(--border-subtle)',
                background: role === 'farmer' ? '#f0fdf4' : '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: role === 'farmer' ? 'var(--primary-200)' : 'var(--bg-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem'
              }}>
                👨‍🌾
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-heading)', fontSize: '0.92rem' }}>Farmer</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Diagnosis, weather & rent</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('machine_owner')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: role === 'machine_owner' ? '2px solid var(--primary-700)' : '1px solid var(--border-subtle)',
                background: role === 'machine_owner' ? '#f0fdf4' : '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: role === 'machine_owner' ? 'var(--primary-200)' : 'var(--bg-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem'
              }}>
                🚜
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-heading)', fontSize: '0.92rem' }}>Machinery Owner</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Rent tractors & equipment</span>
              </div>
            </button>

          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Full Name */}
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label className="form-label">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Rameshwar Patel"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Contact Fields (Grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.1rem' }}>
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                type="tel"
                className="form-control"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Location Fields (Grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.1rem' }}>
            <div className="form-group">
              <label className="form-label">State *</label>
              <select
                className="form-control"
                value={selectedState}
                onChange={handleStateChange}
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">District / Hub *</label>
              <select
                className="form-control"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                {districtOptions.map((dst) => (
                  <option key={dst} value={dst}>{dst}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Password Fields (Grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Show Password Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              id="showRegPassword"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              style={{ accentColor: 'var(--primary-700)', cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="showRegPassword" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
              Show password characters
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
              <span>Creating Account...</span>
            ) : (
              <>
                <CheckCircle size={18} />
                <span>Create Free Account</span>
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <span>Already registered? </span>
          <Link
            to="/login"
            style={{ color: 'var(--primary-700)', fontWeight: 700, textDecoration: 'none' }}
          >
            Sign In Here →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
