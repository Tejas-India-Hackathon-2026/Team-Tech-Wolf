import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Plus, 
  Layers, 
  Calendar, 
  MapPin, 
  Phone, 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  Check, 
  X, 
  Info,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { diseaseService } from '../services/diseaseService';
import { machineryService } from '../services/machineryService';
import { weatherService } from '../services/weatherService';
import { marketService } from '../services/marketService';
import { formatCurrency } from '../utils/formatters';
import Modal from '../components/Modal';

const DashboardPage = () => {
  const { user, logout, isFarmer, isMachineryOwner } = useAuth();
  const navigate = useNavigate();

  // Activity States
  const [recentScans, setRecentScans] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [weatherAlert, setWeatherAlert] = useState(null);
  const [marketTrends, setMarketTrends] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Machinery Owner Fleet State
  const [ownerEquipment, setOwnerEquipment] = useState([]);
  const [isAddMachineModalOpen, setIsAddMachineModalOpen] = useState(false);
  const [newMachine, setNewMachine] = useState({
    name: '',
    type: 'Tractor',
    pricePerHour: 850,
    location: `${user?.district || 'Pune'}, ${user?.state || 'Maharashtra'}`,
    specs: '55 HP, 4WD, Power Steering',
    phone: user?.phone || '9876543211'
  });

  useEffect(() => {
    // 1. Fetch Disease Scans
    diseaseService.getHistory().then((data) => {
      if (Array.isArray(data)) setRecentScans(data.slice(0, 5));
    });

    // 2. Fetch Machinery Bookings
    machineryService.getBookings().then((data) => {
      if (Array.isArray(data)) setBookingsList(data);
    });

    // 3. Fetch Agro Weather for user location
    const locationQuery = `${user?.district || 'Pune'}, ${user?.state || 'Maharashtra'}`;
    weatherService.getWeatherRisk(locationQuery, 'Tomato').then((data) => {
      if (data) setWeatherAlert(data);
    });

    // 4. Fetch Market Prices
    marketService.getCropPrices('Tomato').then((data) => {
      if (data && data.mandis) setMarketTrends(data.mandis.slice(0, 3));
    });

    // 5. Initial Owner Equipment (Demo Fleet)
    if (user?.user_type === 'Machinery Owner') {
      machineryService.getListings({ location: user.district }).then((listings) => {
        if (Array.isArray(listings) && listings.length > 0) {
          setOwnerEquipment(listings.slice(0, 3));
        } else {
          setOwnerEquipment([
            {
              id: 'eq-owner-1',
              machine_name: 'Mahindra 575 DI Tractor (50 HP)',
              machine_type: 'Tractor',
              price_per_hour: 800,
              location: `${user?.district || 'Pune'}, ${user?.state || 'Maharashtra'}`,
              availability: 'Available',
              owner_name: user?.name || 'Suresh Singh',
              owner_phone: user?.phone || '9876543211',
              image_url: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=600&auto=format&fit=crop&q=80'
            },
            {
              id: 'eq-owner-2',
              machine_name: 'Fieldking Heavy Rotary Tiller / Rotavator',
              machine_type: 'Rotavator',
              price_per_hour: 550,
              location: `${user?.district || 'Pune'}, ${user?.state || 'Maharashtra'}`,
              availability: 'Available',
              owner_name: user?.name || 'Suresh Singh',
              owner_phone: user?.phone || '9876543211',
              image_url: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=600&auto=format&fit=crop&q=80'
            }
          ]);
        }
      });
    }
  }, [user]);

  const handleToggleAvailability = (eqId) => {
    setOwnerEquipment((prev) =>
      prev.map((item) =>
        item.id === eqId
          ? { ...item, availability: item.availability === 'Available' ? 'In Maintenance' : 'Available' }
          : item
      )
    );
  };

  const handleAddEquipmentSubmit = (e) => {
    e.preventDefault();
    if (!newMachine.name) return;

    const created = {
      id: `eq-custom-${Date.now()}`,
      machine_name: newMachine.name,
      machine_type: newMachine.type,
      price_per_hour: Number(newMachine.pricePerHour),
      location: newMachine.location,
      availability: 'Available',
      owner_name: user?.name || 'Farm Equipment Owner',
      owner_phone: newMachine.phone,
      specs: newMachine.specs,
      image_url: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=600&auto=format&fit=crop&q=80'
    };

    setOwnerEquipment([created, ...ownerEquipment]);
    setIsAddMachineModalOpen(false);
    setNewMachine({
      name: '',
      type: 'Tractor',
      pricePerHour: 850,
      location: `${user?.district || 'Pune'}, ${user?.state || 'Maharashtra'}`,
      specs: '',
      phone: user?.phone || ''
    });
  };

  const handleBookingAction = async (bookingId, newStatus) => {
    try {
      await machineryService.updateBookingStatus(bookingId, newStatus);
      setBookingsList((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch {
      // Local demo fallback state update
      setBookingsList((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    }
  };

  return (
    <div className="page-wrapper container">
      
      {/* Top Welcome Header */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-green)',
        borderRadius: 'var(--radius-md)',
        padding: '1.75rem',
        marginBottom: '2rem',
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
              <span className={`badge-pill ${user?.user_type === 'Machinery Owner' ? 'badge-amber' : 'badge-emerald'}`}>
                {user?.user_type === 'Machinery Owner' ? <Tractor size={12} /> : <User size={12} />}
                {user?.user_type || 'Farmer'}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={14} style={{ color: 'var(--primary-700)' }} />
                {user?.district}, {user?.state}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Phone size={14} />
                {user?.phone}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="badge-pill badge-emerald" style={{ fontSize: '0.75rem' }}>
            <ShieldCheck size={13} /> Active Demo Session
          </span>
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
          
          <Link
            to="/disease-detection"
            className="glass-card"
            style={{
              textDecoration: 'none',
              padding: '1.15rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              transition: 'transform 0.15s, box-shadow 0.15s',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-700)', flexShrink: 0 }}>
              <ScanSearch size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', color: 'var(--text-heading)', fontSize: '0.95rem' }}>Scan Crop Leaf</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Identify foliar diseases & advice</span>
            </div>
          </Link>

          <Link
            to="/weather-intelligence"
            className="glass-card"
            style={{
              textDecoration: 'none',
              padding: '1.15rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              transition: 'transform 0.15s, box-shadow 0.15s',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1', flexShrink: 0 }}>
              <CloudSunRain size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', color: 'var(--text-heading)', fontSize: '0.95rem' }}>Agro Weather</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Hazards, spray & harvest advisory</span>
            </div>
          </Link>

          <Link
            to="/machinery-rental"
            className="glass-card"
            style={{
              textDecoration: 'none',
              padding: '1.15rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              transition: 'transform 0.15s, box-shadow 0.15s',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309', flexShrink: 0 }}>
              <Tractor size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', color: 'var(--text-heading)', fontSize: '0.95rem' }}>Find Machinery</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Tractors, harvesters & rotavators</span>
            </div>
          </Link>

          <Link
            to="/market-intelligence"
            className="glass-card"
            style={{
              textDecoration: 'none',
              padding: '1.15rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              transition: 'transform 0.15s, box-shadow 0.15s',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d', flexShrink: 0 }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', color: 'var(--text-heading)', fontSize: '0.95rem' }}>Mandi Prices</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Live modal rates & best sell window</span>
            </div>
          </Link>

        </div>
      </div>

      {/* Machinery Owner Fleet Management Panel (If Machinery Owner) */}
      {isMachineryOwner && (
        <div className="glass-card" style={{ marginBottom: '2.5rem', border: '2px solid var(--border-green)', background: '#f8faf7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tractor size={20} style={{ color: 'var(--primary-700)' }} />
                My Machinery & Equipment Fleet
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: '0.2rem 0 0 0' }}>
                Manage listings, toggle real-time availability, and process incoming rental requests
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsAddMachineModalOpen(true)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <Plus size={16} />
              <span>Add Equipment</span>
            </button>
          </div>

          {/* Owner Equipment Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {ownerEquipment.map((eq) => (
              <div
                key={eq.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span className="badge-pill badge-emerald" style={{ fontSize: '0.7rem' }}>{eq.machine_type}</span>
                  <span className={`badge-pill ${eq.availability === 'Available' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
                    {eq.availability}
                  </span>
                </div>
                <strong style={{ fontSize: '0.98rem', color: 'var(--text-heading)', display: 'block', marginBottom: '0.25rem' }}>
                  {eq.machine_name}
                </strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary-800)', fontWeight: 700, marginBottom: '0.4rem' }}>
                  ₹{eq.price_per_hour} / hr
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                  Location: {eq.location}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleToggleAvailability(eq.id)}
                  style={{ width: '100%', fontSize: '0.78rem', padding: '0.35rem', justifyContent: 'center' }}
                >
                  Toggle Availability ({eq.availability === 'Available' ? 'Mark Busy' : 'Mark Available'})
                </button>
              </div>
            ))}
          </div>

          {/* Incoming Bookings Table for Owner */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-heading)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} style={{ color: 'var(--primary-700)' }} />
              Incoming Equipment Booking Requests ({bookingsList.length})
            </h4>

            {bookingsList.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1.5rem' }}>
                No active booking requests yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {bookingsList.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-heading)' }}>
                        {b.machine_name} ({b.farmer_name})
                      </strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        Date: {b.booking_date} • {b.estimated_hours} hrs • Total: ₹{b.total_estimated_cost || (b.price_per_hour * b.estimated_hours)} • Phone: {b.phone}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge-pill ${
                        b.status === 'Confirmed' || b.status === 'Accepted'
                          ? 'badge-emerald'
                          : b.status === 'Rejected' || b.status === 'Cancelled'
                          ? 'badge-red'
                          : 'badge-amber'
                      }`}>
                        {b.status}
                      </span>

                      {b.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleBookingAction(b.id, 'Confirmed')}
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            title="Accept Booking"
                          >
                            <Check size={14} /> Accept
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleBookingAction(b.id, 'Rejected')}
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', color: '#991b1b' }}
                            title="Reject Booking"
                          >
                            <X size={14} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Two-Column Activity Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        
        {/* Left Column: Recent Disease Scans & Weather Alert */}
        <div>
          {/* Weather Alert Banner */}
          {weatherAlert && (
            <div className="glass-card" style={{ marginBottom: '1.5rem', background: '#f0fdf4', border: '1px solid var(--border-green)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge-pill badge-emerald" style={{ fontSize: '0.72rem' }}>
                  Hyperlocal Weather
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

          {/* Recent Disease Scans Card */}
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
                No scans recorded yet. Try scanning a crop leaf!
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

        {/* Right Column: Machinery Bookings & Market Intelligence */}
        <div>
          {/* Farmer's Machinery Bookings */}
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Tractor size={17} style={{ color: 'var(--primary-700)' }} />
                My Farm Machinery Bookings
              </h3>
              <Link to="/machinery-rental" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary-700)', textDecoration: 'none' }}>
                Rent Machinery →
              </Link>
            </div>

            {bookingsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No machinery booked yet. Browse local tractors and tillers!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {bookingsList.slice(0, 4).map((b) => (
                  <div
                    key={b.id}
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
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-heading)', display: 'block' }}>
                        {b.machine_name}
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Date: {b.booking_date} • {b.estimated_hours} hrs • ₹{b.total_estimated_cost || (b.price_per_hour * b.estimated_hours)}
                      </div>
                    </div>
                    <span className={`badge-pill ${
                      b.status === 'Confirmed' || b.status === 'Accepted'
                        ? 'badge-emerald'
                        : 'badge-amber'
                    }`} style={{ fontSize: '0.7rem' }}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mandi Price Watch */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={17} style={{ color: 'var(--primary-700)' }} />
                Regional Mandi Price Watch (Tomato)
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

      </div>

      {/* Add Machinery Listing Modal for Machinery Owners */}
      {isAddMachineModalOpen && (
        <Modal
          isOpen={isAddMachineModalOpen}
          onClose={() => setIsAddMachineModalOpen(false)}
          title="Add New Farm Machinery to Fleet"
        >
          <form onSubmit={handleAddEquipmentSubmit}>
            <div className="form-group">
              <label className="form-label">Machine Name / Model *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. John Deere 5050 D Tractor (50 HP)"
                value={newMachine.name}
                onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Machine Category *</label>
                <select
                  className="form-control"
                  value={newMachine.type}
                  onChange={(e) => setNewMachine({ ...newMachine, type: e.target.value })}
                >
                  <option value="Tractor">Tractor</option>
                  <option value="Harvester">Harvester</option>
                  <option value="Rotavator">Rotavator</option>
                  <option value="Cultivator">Cultivator</option>
                  <option value="Seed Drill">Seed Drill</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Hourly Rental Rate (₹) *</label>
                <input
                  type="number"
                  className="form-control"
                  value={newMachine.pricePerHour}
                  onChange={(e) => setNewMachine({ ...newMachine, pricePerHour: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Operating Location *</label>
              <input
                type="text"
                className="form-control"
                value={newMachine.location}
                onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Key Specifications</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 50 HP, 4WD, Multi-Speed PTO"
                value={newMachine.specs}
                onChange={(e) => setNewMachine({ ...newMachine, specs: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setIsAddMachineModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Save Equipment
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default DashboardPage;
