import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  ScanSearch, 
  CloudSunRain, 
  Tractor, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Sparkles, 
  ArrowRight, 
  Check, 
  X, 
  LogOut,
  AlertCircle,
  CalendarCheck,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import { diseaseService } from '../services/diseaseService';
import { weatherService } from '../services/weatherService';
import { marketService } from '../services/marketService';
import Modal from '../components/Modal';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isUnauthorized = location.state?.unauthorized;

  // Activity States
  const [recentScans, setRecentScans] = useState([]);
  const [farmerBookings, setFarmerBookings] = useState([]);
  const [weatherAlert, setWeatherAlert] = useState(null);
  const [marketTrends, setMarketTrends] = useState([]);
  const [bookingFilterStatus, setBookingFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Cancel Booking Modal State
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadFarmerData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Farmer Bookings from shared service
      const allBookings = await bookingService.getBookings();
      // Filter for this farmer
      const myBookings = allBookings.filter(b => 
        (user?.id && b.farmer_id === user.id) ||
        (user?.phone && (b.farmer_phone === user.phone || b.phone === user.phone)) ||
        (!user?.id && (b.farmer_phone === '9876543210' || b.farmer_id === 'usr-demo-farmer-01'))
      );
      setFarmerBookings(myBookings);

      // 2. Fetch Disease Scans
      diseaseService.getHistory().then((data) => {
        if (Array.isArray(data)) setRecentScans(data.slice(0, 5));
      });

      // 3. Fetch Agro Weather
      const locationQuery = `${user?.district || 'Patna'}, ${user?.state || 'Bihar'}`;
      weatherService.getWeatherRisk(locationQuery, 'Tomato').then((data) => {
        if (data) setWeatherAlert(data);
      });

      // 4. Fetch Market Prices
      marketService.getCropPrices('Tomato').then((data) => {
        if (data && data.mandis) setMarketTrends(data.mandis.slice(0, 3));
      });
    } catch (err) {
      console.warn('[FarmerDashboard] Data load notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarmerData();

    // Live synchronization listener
    const handleUpdate = () => loadFarmerData();
    window.addEventListener('agro_smart_bookings_updated', handleUpdate);
    return () => window.removeEventListener('agro_smart_bookings_updated', handleUpdate);
  }, [user]);

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setIsCancelling(true);
    try {
      await bookingService.cancelBooking(cancelModalBooking.id);
      showToast('Booking cancelled successfully.');
      setCancelModalBooking(null);
      loadFarmerData();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // Filtered Bookings
  const filteredBookings = farmerBookings.filter(b => {
    if (bookingFilterStatus === 'ALL') return true;
    return b.status === bookingFilterStatus;
  });

  return (
    <div className="page-wrapper container" style={{ maxWidth: '1200px' }}>
      
      {/* Unauthorized Access Notification Banner */}
      {isUnauthorized && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#991b1b',
          fontSize: '0.88rem'
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Access Restricted:</strong> You do not have permissions for that console. You have been redirected to your personal dashboard.
          </div>
        </div>
      )}

      {/* Top Welcome Header */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-green)',
        borderRadius: 'var(--radius-md)',
        padding: '1.75rem',
        marginBottom: '1.75rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--primary-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            border: '2px solid var(--border-green)'
          }}>
            {user?.avatar || '👨‍🌾'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.65rem', margin: 0, color: 'var(--text-heading)', fontWeight: 800 }}>
                Welcome, {user?.name || 'Farmer'}!
              </h1>
              <span className="badge-pill badge-emerald">
                <User size={12} /> Farmer Portal
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={14} style={{ color: 'var(--primary-700)' }} />
                {user?.district || 'Patna'}, {user?.state || 'Bihar'}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Phone size={14} />
                {user?.phone || '9876543210'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadFarmerData}
            title="Refresh Data"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-pulse' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div style={{
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : 'var(--border-green)'}`,
          color: toast.type === 'error' ? '#991b1b' : 'var(--primary-900)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem'
        }}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Quick Action Shortcuts Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--text-heading)', marginBottom: '0.85rem', fontWeight: 700 }}>
          Quick Farm Actions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}>
          <Link to="/disease-detection" className="glass-card" style={{ textDecoration: 'none', padding: '1.15rem 1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-700)' }}>
              <ScanSearch size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', color: 'var(--text-heading)', fontSize: '0.95rem' }}>Scan Crop Leaf</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Identify foliar diseases</span>
            </div>
          </Link>

          <Link to="/weather-intelligence" className="glass-card" style={{ textDecoration: 'none', padding: '1.15rem 1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1' }}>
              <CloudSunRain size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', color: 'var(--text-heading)', fontSize: '0.95rem' }}>Agro Weather</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Hazards & spray advisory</span>
            </div>
          </Link>

          <Link to="/machinery-rental" className="glass-card" style={{ textDecoration: 'none', padding: '1.15rem 1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
              <Tractor size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', color: 'var(--text-heading)', fontSize: '0.95rem' }}>Rent Machinery</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Tractors, tillers & harvesters</span>
            </div>
          </Link>

          <Link to="/market-intelligence" className="glass-card" style={{ textDecoration: 'none', padding: '1.15rem 1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', color: 'var(--text-heading)', fontSize: '0.95rem' }}>Mandi Prices</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Live rates & best sell window</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Section: My Machinery Bookings */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CalendarCheck size={20} style={{ color: 'var(--primary-700)' }} />
              My Machinery Bookings ({farmerBookings.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.15rem 0 0 0' }}>
              Live status updates synchronized with machinery owners
            </p>
          </div>

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'REJECTED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setBookingFilterStatus(st)}
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: bookingFilterStatus === st ? '1px solid var(--primary-700)' : '1px solid var(--border-subtle)',
                  background: bookingFilterStatus === st ? 'var(--primary-100)' : '#ffffff',
                  color: bookingFilterStatus === st ? 'var(--primary-900)' : 'var(--text-muted)',
                  fontWeight: bookingFilterStatus === st ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)' }}>
            <Tractor size={36} style={{ color: 'var(--border-subtle)', margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontSize: '0.9rem' }}>No machinery bookings found in this view.</div>
            <Link to="/machinery-rental" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: '0.85rem', padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}>
              Browse Available Machinery
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-heading)' }}>
                      {b.machine_name}
                    </strong>
                    <span className={`badge-pill ${
                      b.status === 'ACCEPTED' ? 'badge-emerald' :
                      b.status === 'COMPLETED' ? 'badge-emerald' :
                      b.status === 'PENDING' ? 'badge-amber' :
                      b.status === 'CANCELLED' ? 'badge-red' : 'badge-red'
                    }`} style={{ fontSize: '0.72rem' }}>
                      {b.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.84rem', color: 'var(--text-heading)', marginBottom: '0.2rem' }}>
                    Equipment Owner: <strong>{b.owner_name}</strong> • Contact: {b.owner_phone}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Booking Date: <strong>{b.booking_date}</strong> • Start: {b.start_time} • Duration: {b.duration || b.estimated_hours} hrs • Location: {b.service_location}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                      ₹{b.total_estimated_cost || b.estimated_cost}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Estimated Total</div>
                  </div>

                  {/* Cancel Button if PENDING or ACCEPTED */}
                  {(b.status === 'PENDING' || b.status === 'ACCEPTED') && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setCancelModalBooking(b)}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: '#991b1b' }}
                    >
                      <XCircle size={14} />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Grid: Weather & Recent Scans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        
        {/* Left: Weather Alert */}
        <div>
          {weatherAlert && (
            <div className="glass-card" style={{ background: '#f0fdf4', border: '1px solid var(--border-green)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge-pill badge-emerald" style={{ fontSize: '0.72rem' }}>
                  Hyperlocal Weather Advisory
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  {weatherAlert.location}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <CloudSunRain size={32} style={{ color: 'var(--primary-700)' }} />
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                    {weatherAlert.temperature}°C • {weatherAlert.weather_condition}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Humidity: {weatherAlert.humidity}% • Rain Chance: {weatherAlert.rain_chance}%
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--primary-900)', margin: 0, lineHeight: 1.4 }}>
                <strong>Agronomic Advice:</strong> {weatherAlert.recommendation}
              </p>
            </div>
          )}

          {/* Mandi Price Watch */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={17} style={{ color: 'var(--primary-700)' }} />
                Mandi Price Watch (Tomato)
              </h3>
              <Link to="/market-intelligence" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary-700)', textDecoration: 'none' }}>
                Full Trends →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {marketTrends.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.7rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-heading)' }}>{m.market_name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Arrivals: {m.arrivals_tonnes} tonnes</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                      ₹{m.modal_price_per_quintal}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>per Quintal</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recent Disease Scans */}
        <div>
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ScanSearch size={17} style={{ color: 'var(--primary-700)' }} />
                Recent Disease Scans
              </h3>
              <Link to="/disease-detection" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary-700)', textDecoration: 'none' }}>
                New Scan →
              </Link>
            </div>

            {recentScans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No scans recorded yet. Upload a crop leaf to identify foliar diseases!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {recentScans.map((scan, idx) => (
                  <div
                    key={scan.id || idx}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                        <span className="badge-pill badge-emerald" style={{ fontSize: '0.68rem' }}>{scan.crop || scan.crop_name}</span>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--text-heading)' }}>{scan.disease || scan.detected_disease}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Severity: {scan.severity} • {scan.timestamp || 'Recent'}
                      </div>
                    </div>
                    <span className="badge-pill badge-amber" style={{ fontSize: '0.68rem' }}>
                      Demo Result
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Cancel Booking Confirmation Modal */}
      {cancelModalBooking && (
        <Modal
          isOpen={!!cancelModalBooking}
          onClose={() => setCancelModalBooking(null)}
          title="Confirm Booking Cancellation"
        >
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-heading)', margin: '0 0 1rem 0' }}>
              Are you sure you want to cancel your booking for <strong>{cancelModalBooking.machine_name}</strong> on <strong>{cancelModalBooking.booking_date}</strong>?
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0 0 1.5rem 0' }}>
              The equipment owner will be notified immediately of this cancellation.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isCancelling}
                onClick={() => setCancelModalBooking(null)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Keep Booking
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                style={{ flex: 1, justifyContent: 'center', background: '#dc2626', borderColor: '#dc2626' }}
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default DashboardPage;
