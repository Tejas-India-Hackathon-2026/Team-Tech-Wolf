import React, { useState, useEffect } from 'react';
import { 
  Tractor, 
  MapPin, 
  Star, 
  Search, 
  CheckCircle,
  Phone,
  DollarSign
} from 'lucide-react';
import { machineryService } from '../services/machineryService';
import { formatCurrency, formatDistance } from '../utils/formatters';
import Modal from '../components/Modal';
import LoadingSkeleton from '../components/LoadingSkeleton';

const CATEGORIES = ['All', 'Tractor', 'Harvester', 'Drone Sprayer', 'Tillage', 'Sowing'];

const MachineryRentalPage = () => {
  const [machineryList, setMachineryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxDistance, setMaxDistance] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Modal State
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-08-22');
  const [durationHours, setDurationHours] = useState(4);
  const [acresToCover, setAcresToCover] = useState(3.0);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const fetchMachinery = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (maxDistance) params.max_distance = maxDistance;
      if (searchQuery) params.search = searchQuery;

      const data = await machineryService.getListings(params);
      setMachineryList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachinery();
  }, [selectedCategory, maxDistance, searchQuery]);

  const handleOpenBooking = (equipment) => {
    setSelectedEquipment(equipment);
    setBookingSuccess(null);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!farmerName || !farmerPhone) return;

    const totalAmount = selectedEquipment.price_per_hour * Number(durationHours);
    const bookingPayload = {
      machinery_id: selectedEquipment.id,
      machinery_name: selectedEquipment.name,
      farmer_name: farmerName,
      farmer_phone: farmerPhone,
      booking_date: bookingDate,
      duration_hours: Number(durationHours),
      acres_to_cover: Number(acresToCover),
      total_amount: totalAmount,
    };

    const res = await machineryService.book(bookingPayload);
    setBookingSuccess(res);
  };

  return (
    <div className="page-wrapper container">
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span className="badge-pill badge-amber">
            <Tractor size={14} /> Service 3 of 4
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>On-Demand Machinery Marketplace</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>Farm Machinery Rental</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '680px' }}>
          Location-based marketplace to book tractors, harvesters, laser land levelers, and spray drones on demand. Zero capital investment—pay strictly per hour or per acre.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
          
          {/* Search Box */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search Equipment or Location</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="e.g. Mahindra 575, Harvester, Drone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Max Distance Slider */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Max Radius</label>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: 700 }}>{maxDistance} km</span>
            </div>
            <input
              type="range"
              min="3"
              max="35"
              step="1"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary-600)' }}
            />
          </div>

        </div>
      </div>

      {loading && <LoadingSkeleton text="Locating verified machinery in your radius..." />}

      {/* Machinery Catalog Grid */}
      {!loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem'
        }}>
          {machineryList.map((item) => (
            <div key={item.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span className="badge-pill badge-emerald" style={{ marginBottom: '0.4rem' }}>
                    {item.category}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', lineHeight: '1.3' }}>
                    {item.name}
                  </h3>
                </div>
                {item.badge && (
                  <span className="badge-pill badge-amber" style={{ fontSize: '0.72rem' }}>
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Specs & Owner Meta */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} style={{ color: 'var(--primary-700)' }} />
                  <span>{item.location_city} ({formatDistance(item.distance_km)})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Star size={14} style={{ color: 'var(--accent-amber)', fill: 'var(--accent-amber)' }} />
                  <strong style={{ color: 'var(--text-heading)' }}>{item.rating}</strong> ({item.reviews_count || 24} jobs)
                </div>
                {item.horse_power > 0 && (
                  <div style={{ color: 'var(--text-dim)' }}>
                    • {item.horse_power} HP
                  </div>
                )}
              </div>

              {/* Feature Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
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

              {/* Price & Action Row */}
              <div style={{ marginTop: 'auto', paddingTop: '1.2rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                >
                  Book Equipment
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Booking Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={bookingSuccess ? 'Booking Confirmed!' : `Reserve ${selectedEquipment?.name || 'Equipment'}`}
      >
        {bookingSuccess ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
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
            <h4 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>Reservation Receipt</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Booking Reference: <strong style={{ color: 'var(--primary-700)' }}>{bookingSuccess.booking_id}</strong>
            </p>

            <div style={{ background: '#f8faf7', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'left', marginBottom: '1.75rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Machinery:</span>
                <strong style={{ color: 'var(--text-heading)' }}>{bookingSuccess.machinery_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Farmer Name:</span>
                <span style={{ color: 'var(--text-heading)' }}>{bookingSuccess.farmer_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Scheduled Date:</span>
                <span style={{ color: 'var(--text-heading)' }}>{bookingSuccess.booking_date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
                <span style={{ color: 'var(--text-heading)' }}>{bookingSuccess.duration_hours} hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem' }}>
                <strong style={{ color: 'var(--text-heading)' }}>Estimated Total:</strong>
                <strong style={{ color: 'var(--primary-700)', fontSize: '1.15rem' }}>{formatCurrency(bookingSuccess.total_amount)}</strong>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setIsModalOpen(false)}>
              Done & Return to Fleet
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirmBooking}>
            <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: '#f8faf7', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Equipment Rate:</div>
              <div style={{ color: 'var(--primary-700)', fontWeight: 700, fontSize: '1.1rem' }}>
                {formatCurrency(selectedEquipment?.price_per_hour)} / hour
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                Owner: {selectedEquipment?.owner_name} ({selectedEquipment?.owner_phone})
              </div>
            </div>

            <div className="form-group">
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

            <div className="form-group">
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Booking Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hours Required</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  className="form-control"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Acreage to Cover (Acres)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                className="form-control"
                value={acresToCover}
                onChange={(e) => setAcresToCover(e.target.value)}
              />
            </div>

            {/* Total Estimated Cost Calculator */}
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
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Estimated Booking Cost:</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  ({durationHours} hrs × {formatCurrency(selectedEquipment?.price_per_hour)})
                </div>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-heading)' }}>
                {formatCurrency((selectedEquipment?.price_per_hour || 0) * Number(durationHours))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Confirm Machinery Reservation
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default MachineryRentalPage;
