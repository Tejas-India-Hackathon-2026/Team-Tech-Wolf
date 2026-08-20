import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Tractor, 
  MapPin, 
  Star, 
  Search, 
  CheckCircle, 
  Phone, 
  DollarSign, 
  Clock, 
  Calendar, 
  User, 
  Filter, 
  Sparkles, 
  ArrowUpDown, 
  Compass, 
  RefreshCw, 
  Briefcase, 
  ShieldCheck, 
  Award, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { machineryService } from '../services/machineryService';
import { bookingService } from '../services/bookingService';
import { formatCurrency, formatDistance } from '../utils/formatters';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import LoadingSkeleton from '../components/LoadingSkeleton';

const MACHINERY_TYPES = ['All', 'Tractor', 'Harvester', 'Rotavator', 'Cultivator', 'Seed Drill'];

const PRESET_LOCATIONS = [
  'All Locations',
  'Patna, Bihar',
  'Pune, Maharashtra',
  'Nashik, Maharashtra',
  'Karnal, Haryana',
  'Ludhiana, Punjab',
  'Agra, Uttar Pradesh',
  'Ahmednagar, Maharashtra',
  'Baramati, Maharashtra'
];

const MachineryRentalPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [machineryList, setMachineryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  const [locationInput, setLocationInput] = useState('');
  const [selectedSort, setSelectedSort] = useState('distance_asc');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Booking Modal State
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [farmerName, setFarmerName] = useState(user?.name || '');
  const [farmerPhone, setFarmerPhone] = useState(user?.phone || '');
  const [serviceLocation, setServiceLocation] = useState(user ? `${user.district || 'Pune'}, ${user.state || 'Maharashtra'}` : 'Patna Rural, Bihar');
  const [bookingDate, setBookingDate] = useState('2026-08-25');
  const [startTime, setStartTime] = useState('08:00 AM');
  const [estimatedHours, setEstimatedHours] = useState(4);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  // My Bookings Drawer
  const [bookingsList, setBookingsList] = useState([]);
  const [showMyBookings, setShowMyBookings] = useState(false);

  const geo = useGeolocation();

  const fetchMachinery = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedType !== 'All') params.type = selectedType;
      if (locationInput && locationInput !== 'All Locations') params.location = locationInput;
      if (selectedSort) params.sort = selectedSort;
      if (searchQuery) params.search = searchQuery;

      const data = await machineryService.getListings(params);
      setMachineryList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getBookings();
      if (Array.isArray(data)) setBookingsList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMachinery();
    fetchBookings();

    // Check if returning from login redirect with target equipment
    if (location.state?.targetEquipment && isAuthenticated) {
      handleOpenBooking(location.state.targetEquipment);
    }
  }, [selectedType, selectedSort]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    fetchMachinery();
  };

  const handleOpenBooking = (equipment) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location, targetEquipment: equipment, action: 'open_booking' } });
      return;
    }

    setSelectedEquipment(equipment);
    setFarmerName(user?.name || '');
    setFarmerPhone(user?.phone || '');
    setServiceLocation(equipment.location || (user ? `${user.district}, ${user.state}` : 'Local Farm Plot'));
    setBookingSuccess(null);
    setBookingError(null);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!farmerName || !farmerPhone || !serviceLocation || !bookingDate) {
      setBookingError('Please complete all required fields.');
      return;
    }

    setBookingError(null);
    setIsBookingSubmitting(true);

    try {
      const payload = {
        machinery_id: selectedEquipment.id,
        machine_name: selectedEquipment.machine_name,
        machine_type: selectedEquipment.machine_type,
        farmer_id: user?.id || 'usr-demo-farmer-01',
        farmer_name: farmerName,
        farmer_phone: farmerPhone,
        phone: farmerPhone,
        service_location: serviceLocation,
        booking_date: bookingDate,
        start_time: startTime,
        duration: Number(estimatedHours),
        estimated_hours: Number(estimatedHours),
        price_per_hour: selectedEquipment.price_per_hour,
        total_estimated_cost: selectedEquipment.price_per_hour * Number(estimatedHours),
        owner_id: selectedEquipment.owner_id || 'usr-demo-owner-02',
        owner_name: selectedEquipment.owner_name,
        owner_phone: selectedEquipment.owner_phone
      };

      const res = await bookingService.createBooking(payload);
      setBookingSuccess(res);
      fetchBookings();
    } catch (err) {
      setBookingError(err.message || 'Booking submission failed. Please try again.');
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    await bookingService.updateBookingStatus(bookingId, newStatus);
    fetchBookings();
  };

  const handleUseGPS = () => {
    if (geo.latitude && geo.longitude) {
      setLocationInput(`GPS Farm (${geo.latitude.toFixed(2)}, ${geo.longitude.toFixed(2)})`);
      fetchMachinery();
    } else {
      geo.refresh();
      if (geo.latitude && geo.longitude) {
        setLocationInput(`GPS Farm (${geo.latitude.toFixed(2)}, ${geo.longitude.toFixed(2)})`);
        fetchMachinery();
      }
    }
  };

  // Dynamic estimated cost
  const currentCost = (selectedEquipment?.price_per_hour || 0) * Number(estimatedHours || 1);

  return (
    <div className="page-wrapper container">
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge-pill badge-emerald">
              <Tractor size={14} /> Service 3 of 4
            </span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>"Uber for Tractors" On-Demand Marketplace</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
            onClick={() => setShowMyBookings(!showMyBookings)}
          >
            <Briefcase size={14} style={{ color: 'var(--primary-700)' }} />
            <span>{showMyBookings ? 'Hide My Bookings' : `My Bookings (${bookingsList.length})`}</span>
          </button>
        </div>

        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>
          Farm Machinery Rental
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '720px' }}>
          Connecting small farmers with verified tractor, harvester, and implement owners. Zero capital machinery ownership—book strictly per hour or per acre on demand.
        </p>
      </div>

      {/* Farmer Flow Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.6rem',
        marginBottom: '2rem',
        background: '#ffffff',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-700)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-heading)' }}>Enter Location</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-700)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-heading)' }}>Find Machines</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-700)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-heading)' }}>Compare Price</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-700)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-heading)' }}>Book Machine</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-700)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-heading)' }}>Owner Accepts</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-700)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>6</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-heading)' }}>Service Done</span>
        </div>
      </div>

      {/* My Bookings Section */}
      {showMyBookings && (
        <div className="glass-card" style={{ marginBottom: '2rem', background: '#f8faf7', border: '1px solid var(--border-green)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Briefcase size={16} style={{ color: 'var(--primary-700)' }} />
              My Machinery Bookings Log
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              {bookingsList.length} total bookings
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {bookingsList.map((bk) => {
              const statusClass = 
                bk.status === 'Accepted' || bk.status === 'Completed' 
                  ? 'badge-emerald' 
                  : bk.status === 'Pending' 
                  ? 'badge-amber' 
                  : 'badge-red';

              return (
                <div 
                  key={bk.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <span className="badge-pill badge-emerald" style={{ fontSize: '0.7rem' }}>
                      {bk.machine_type || 'Tractor'}
                    </span>
                    <span className={`badge-pill ${statusClass}`} style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                      {bk.status}
                    </span>
                  </div>

                  <strong style={{ fontSize: '0.98rem', color: 'var(--text-heading)', display: 'block', marginBottom: '0.35rem' }}>
                    {bk.machine_name}
                  </strong>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.75rem' }}>
                    <div>📍 {bk.service_location}</div>
                    <div>📅 {bk.booking_date} at {bk.start_time} ({bk.estimated_hours} hrs)</div>
                    <div>👤 Farmer: {bk.farmer_name} ({bk.phone})</div>
                    <div>🚜 Owner: {bk.owner_name} ({bk.owner_phone})</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total Cost: </span>
                      <strong style={{ color: 'var(--primary-700)', fontSize: '0.95rem' }}>{formatCurrency(bk.estimated_cost)}</strong>
                    </div>

                    {/* Status Changer for Demo */}
                    <select
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: '#f9fafb' }}
                      value={bk.status}
                      onChange={(e) => handleUpdateStatus(bk.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
          
          {/* 1. Location Input */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">1. Enter Service Location / Hub</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="e.g. Pune, Patna, Karnal..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
              />
            </div>
          </div>

          {/* 2. Machinery Type Selector */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">2. Machinery Type</label>
            <select
              className="form-control"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {MACHINERY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* 3. Sort Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">3. Sort Listings By</label>
            <select
              className="form-control"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
            >
              <option value="distance_asc">Distance (Nearest First)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="rating_desc">Rating (Highest First)</option>
            </select>
          </div>

          {/* 4. Action Search Button */}
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.8rem 1rem' }}
            >
              <Search size={16} />
              <span>Find Machines</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleUseGPS}
              title="Use GPS Location"
              style={{ padding: '0.8rem' }}
            >
              <Compass size={18} style={{ color: 'var(--primary-700)' }} />
            </button>
          </div>

        </div>
      </form>

      {/* Machinery Catalog Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>
          Available Machinery ({machineryList.length} verified listings)
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          Showing {selectedType} machines near {locationInput || 'All Regions'}
        </div>
      </div>

      {loading && <LoadingSkeleton text="Locating verified machinery in your radius..." />}

      {/* No Machines Found Empty State */}
      {!loading && machineryList.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-dim)',
            margin: '0 auto 1rem auto'
          }}>
            <Tractor size={28} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: 'var(--text-heading)' }}>
            No Machinery Listings Found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto 1.25rem auto' }}>
            No active equipment matching your filter criteria. Try resetting the location or selecting "All" machinery types.
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSelectedType('All');
              setLocationInput('');
              setSearchQuery('');
              fetchMachinery();
            }}
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Machinery Cards Grid */}
      {!loading && machineryList.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem',
          marginBottom: '3.5rem'
        }}>
          {machineryList.map((item) => (
            <div key={item.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Card Header & Badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <div>
                  <span className="badge-pill badge-emerald" style={{ marginBottom: '0.4rem' }}>
                    {item.machine_type}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', lineHeight: '1.3' }}>
                    {item.machine_name}
                  </h3>
                </div>

                <span className="badge-pill badge-emerald" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                  ✓ {item.availability || 'Available'}
                </span>
              </div>

              {/* Owner Meta & Distance */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} style={{ color: 'var(--primary-700)' }} />
                  <span>{item.location} ({formatDistance(item.distance_km)})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Star size={14} style={{ color: 'var(--accent-amber)', fill: 'var(--accent-amber)' }} />
                  <strong style={{ color: 'var(--text-heading)' }}>{item.rating}</strong> ({item.reviews_count || 24} jobs)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <User size={14} style={{ color: 'var(--text-dim)' }} />
                  <span>Owner: {item.owner_name}</span>
                </div>
              </div>

              {/* Specification Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                {item.features?.map((f, idx) => (
                  <span key={idx} style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    background: '#f3f4f6',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)'
                  }}>
                    {f}
                  </span>
                ))}
              </div>

              {/* Price & Book Action Row */}
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-heading)' }}>
                    {formatCurrency(item.price_per_hour)}<span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 500 }}> / hr</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    or {formatCurrency(item.price_per_day)} / full day
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => handleOpenBooking(item)}
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  Book Machine
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Business Model & Monetization Information Section */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div className="glass-card" style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <span className="badge-pill badge-amber">Platform Economics</span>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--text-heading)' }}>
              How the "Uber for Tractors" Model Works
            </h3>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem', maxWidth: '850px' }}>
            AGRO-SMART unlocks idle machinery capacity across Indian villages. Tractor and harvester owners monetize idle assets, while smallholders gain mechanization access at up to 70% lower operational cost.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: '#f8faf7', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: 'var(--primary-700)', fontWeight: 700, fontSize: '0.92rem' }}>
                <TrendingUp size={16} /> 1. Marketplace Commission
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                8-10% service fee per completed machine booking, covered via transparent billing.
              </p>
            </div>

            <div style={{ background: '#f8faf7', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: 'var(--primary-700)', fontWeight: 700, fontSize: '0.92rem' }}>
                <Award size={16} /> 2. Verified Owner Listings
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Priority ranking and verified badges for equipment owners maintaining 4.8+ star ratings.
              </p>
            </div>

            <div style={{ background: '#f8faf7', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: 'var(--primary-700)', fontWeight: 700, fontSize: '0.92rem' }}>
                <Layers size={16} /> 3. FPO & Custom Hiring Plans
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Seasonal booking packages for Farmer Producer Organizations (FPOs) and cluster farming.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={bookingSuccess ? 'Booking Confirmed!' : `Reserve ${selectedEquipment?.machine_name || 'Equipment'}`}
      >
        {bookingSuccess ? (
          <div style={{ textAlign: 'center', padding: '1.25rem 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--primary-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-700)',
              margin: '0 auto 1.25rem auto'
            }}>
              <CheckCircle size={36} />
            </div>

            <h4 style={{ fontSize: '1.35rem', marginBottom: '0.35rem', color: 'var(--text-heading)' }}>
              Machinery Reservation Confirmed!
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Booking Reference ID: <strong style={{ color: 'var(--primary-700)' }}>{bookingSuccess.id}</strong>
            </p>

            {/* Receipt Box */}
            <div style={{
              background: '#f8faf7',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
              fontSize: '0.88rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Equipment:</span>
                <strong style={{ color: 'var(--text-heading)' }}>{bookingSuccess.machine_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Farmer:</span>
                <span style={{ color: 'var(--text-heading)' }}>{bookingSuccess.farmer_name} ({bookingSuccess.phone})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Service Location:</span>
                <span style={{ color: 'var(--text-heading)' }}>{bookingSuccess.service_location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Schedule:</span>
                <span style={{ color: 'var(--text-heading)' }}>{bookingSuccess.booking_date} at {bookingSuccess.start_time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
                <span style={{ color: 'var(--text-heading)' }}>{bookingSuccess.estimated_hours} hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span className="badge-pill badge-emerald" style={{ fontSize: '0.7rem' }}>{bookingSuccess.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem', marginTop: '0.3rem' }}>
                <strong style={{ color: 'var(--text-heading)' }}>Estimated Total Cost:</strong>
                <strong style={{ color: 'var(--primary-700)', fontSize: '1.15rem' }}>{formatCurrency(bookingSuccess.estimated_cost)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1 }}
                onClick={() => {
                  setIsModalOpen(false);
                  setShowMyBookings(true);
                }}
              >
                View in My Bookings
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmBooking}>
            {bookingError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {bookingError}
              </div>
            )}

            {/* Equipment Rate Overview */}
            <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: '#f8faf7', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Selected Machine:</div>
              <strong style={{ color: 'var(--text-heading)', fontSize: '1rem' }}>{selectedEquipment?.machine_name} ({selectedEquipment?.machine_type})</strong>
              <div style={{ color: 'var(--primary-700)', fontWeight: 700, marginTop: '0.2rem' }}>
                Rate: {formatCurrency(selectedEquipment?.price_per_hour)} / hour
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                Owner: {selectedEquipment?.owner_name} ({selectedEquipment?.owner_phone})
              </div>
            </div>

            {/* Farmer Name & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Farmer Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ramesh Deshmukh"
                  required
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  required
                  value={farmerPhone}
                  onChange={(e) => setFarmerPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Service Location */}
            <div className="form-group">
              <label className="form-label">Service Farm Location / Village *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Plot No. 14, Patna Rural, Bihar"
                required
                value={serviceLocation}
                onChange={(e) => setServiceLocation(e.target.value)}
              />
            </div>

            {/* Date & Start Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Booking Date *</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Start Time</label>
                <select
                  className="form-control"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  <option value="06:00 AM">06:00 AM (Early Morning)</option>
                  <option value="08:00 AM">08:00 AM (Morning)</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="02:00 PM">02:00 PM (Afternoon)</option>
                  <option value="04:00 PM">04:00 PM (Evening)</option>
                </select>
              </div>
            </div>

            {/* Estimated Hours */}
            <div className="form-group">
              <label className="form-label">Estimated Operating Duration (Hours) *</label>
              <input
                type="number"
                min="1"
                max="24"
                className="form-control"
                required
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </div>

            {/* Dynamic Cost Calculator Box */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid var(--border-green)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Estimated Booking Total:</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  ({estimatedHours} hrs × {formatCurrency(selectedEquipment?.price_per_hour)})
                </div>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-heading)' }}>
                {formatCurrency(currentCost)}
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.85rem' }}
              disabled={isBookingSubmitting}
            >
              {isBookingSubmitting ? 'Confirming Reservation...' : 'Confirm Machinery Booking'}
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default MachineryRentalPage;
