import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Tractor, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  DollarSign, 
  Sparkles, 
  Layers, 
  Check, 
  X, 
  LogOut, 
  AlertCircle,
  CalendarCheck,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import { machineryService } from '../services/machineryService';
import Modal from '../components/Modal';

const OwnerDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'accepted', 'history', 'machinery'
  const [bookings, setBookings] = useState([]);
  const [machinery, setMachinery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  // Add Equipment Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMachine, setNewMachine] = useState({
    name: '',
    type: 'Tractor',
    pricePerHour: 850,
    location: `${user?.district || 'Pune'}, ${user?.state || 'Maharashtra'}`,
    specs: '55 HP, 4WD, Power Steering',
    phone: user?.phone || '9876543211'
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadOwnerData = async () => {
    setLoading(true);
    try {
      // 1. Fetch relevant bookings for this owner
      const allBookings = await bookingService.getBookings();
      // Owner matches by owner_id OR owner_phone
      const ownerBookings = allBookings.filter(b => 
        (user?.id && b.owner_id === user.id) ||
        (user?.phone && (b.owner_phone === user.phone || b.owner_phone === '9876543211')) ||
        (!user?.id && b.owner_phone === '9876543211')
      );
      setBookings(ownerBookings);

      // 2. Fetch Owner's machinery listings
      const listings = await machineryService.getListings();
      setMachinery(listings);
    } catch (err) {
      console.warn('[OwnerDashboard] Data load notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwnerData();

    // Listen for live updates
    const handleUpdate = () => loadOwnerData();
    window.addEventListener('agro_smart_bookings_updated', handleUpdate);
    return () => window.removeEventListener('agro_smart_bookings_updated', handleUpdate);
  }, [user]);

  // Status transitions: ACCEPT, REJECT, COMPLETED
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setActionLoadingId(bookingId);
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      showToast(`Booking request marked as ${newStatus}!`);
      loadOwnerData();
    } catch (err) {
      showToast(err.message || 'Failed to update booking status.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleAvailability = (machineId) => {
    setMachinery(prev => prev.map(m => {
      if (m.id === machineId) {
        const isAvail = m.availability === 'Available' || m.availability === 'Available Now';
        return { ...m, availability: isAvail ? 'In Maintenance' : 'Available' };
      }
      return m;
    }));
    showToast('Machinery availability status updated.');
  };

  const handleAddEquipment = (e) => {
    e.preventDefault();
    if (!newMachine.name.trim()) return;

    const created = {
      id: `eq-custom-${Date.now()}`,
      machine_name: newMachine.name,
      machine_type: newMachine.type,
      price_per_hour: Number(newMachine.pricePerHour),
      location: newMachine.location,
      availability: 'Available',
      owner_id: user?.id || 'usr-demo-owner-02',
      owner_name: user?.name || 'Suresh Singh Machinery',
      owner_phone: newMachine.phone || user?.phone || '9876543211',
      specs: newMachine.specs,
      image_url: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=600&auto=format&fit=crop&q=80'
    };

    setMachinery([created, ...machinery]);
    setIsAddModalOpen(false);
    showToast('New machinery listing added to fleet!');
    setNewMachine({
      name: '',
      type: 'Tractor',
      pricePerHour: 850,
      location: `${user?.district || 'Pune'}, ${user?.state || 'Maharashtra'}`,
      specs: '',
      phone: user?.phone || '9876543211'
    });
  };

  // Group bookings
  const pendingRequests = bookings.filter(b => b.status === 'PENDING');
  const acceptedBookings = bookings.filter(b => b.status === 'ACCEPTED');
  const historyBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED' || b.status === 'REJECTED');
  
  // Calculate total earnings
  const completedEarnings = bookings
    .filter(b => b.status === 'COMPLETED' || b.status === 'ACCEPTED')
    .reduce((sum, b) => sum + (Number(b.total_estimated_cost || b.estimated_cost) || 0), 0);

  return (
    <div className="page-wrapper container" style={{ maxWidth: '1200px' }}>
      
      {/* Top Welcome Banner */}
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
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#fef3c7',
            border: '2px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem'
          }}>
            🚜
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.65rem', margin: 0, color: 'var(--text-heading)', fontWeight: 800 }}>
                {user?.name || 'Machinery Owner'}
              </h1>
              <span className="badge-pill badge-amber" style={{ fontSize: '0.72rem' }}>
                <Tractor size={12} /> Machinery Owner Console
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={13} style={{ color: 'var(--primary-700)' }} />
                {user?.district || 'Pune'}, {user?.state || 'Maharashtra'}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Phone size={13} />
                {user?.phone || '9876543211'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadOwnerData}
            title="Refresh Bookings"
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

      {/* Metric Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div className="glass-card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Total Fleet</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '0.2rem' }}>
            {machinery.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--primary-700)' }}>
            {machinery.filter(m => m.availability === 'Available' || m.availability === 'Available Now').length} Active Listings
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.15rem', border: pendingRequests.length > 0 ? '2px solid #fbbf24' : '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Pending Requests</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: pendingRequests.length > 0 ? '#b45309' : 'var(--text-heading)', marginTop: '0.2rem' }}>
            {pendingRequests.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Requires your response
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Accepted Bookings</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d', marginTop: '0.2rem' }}>
            {acceptedBookings.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Scheduled for dispatch
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Completed Jobs</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '0.2rem' }}>
            {historyBookings.filter(b => b.status === 'COMPLETED').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Successful rentals
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.15rem', background: '#f0fdf4' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary-800)', fontWeight: 600 }}>Projected Earnings</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-800)', marginTop: '0.2rem' }}>
            ₹{completedEarnings}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Demo Gross Revenue
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid var(--border-subtle)',
        marginBottom: '1.75rem',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'requests', label: `Pending Requests (${pendingRequests.length})`, icon: Clock },
          { id: 'accepted', label: `Accepted Bookings (${acceptedBookings.length})`, icon: CheckCircle },
          { id: 'history', label: `Booking History (${historyBookings.length})`, icon: CalendarCheck },
          { id: 'machinery', label: `My Machinery Fleet (${machinery.length})`, icon: Tractor }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.1rem',
                border: 'none',
                background: 'none',
                borderBottom: isActive ? '3px solid var(--primary-700)' : '3px solid transparent',
                color: isActive ? 'var(--primary-800)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Pending Booking Requests */}
      {activeTab === 'requests' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: 0 }}>
                Incoming Equipment Rental Requests
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.15rem 0 0 0' }}>
                Accept or reject pending machinery rental requests from verified farmers
              </p>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              <Clock size={36} style={{ color: 'var(--border-subtle)', margin: '0 auto 0.75rem auto' }} />
              <div>No pending booking requests at this moment.</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                New farmer requests will automatically show here in real time.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {pendingRequests.map((b) => (
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-heading)' }}>
                        {b.machine_name}
                      </strong>
                      <span className="badge-pill badge-amber" style={{ fontSize: '0.72rem' }}>
                        PENDING APPROVAL
                      </span>
                    </div>

                    <div style={{ fontSize: '0.84rem', color: 'var(--text-heading)', marginBottom: '0.2rem' }}>
                      Farmer: <strong>{b.farmer_name}</strong> • Phone: <a href={`tel:${b.farmer_phone || b.phone}`} style={{ color: 'var(--primary-700)', textDecoration: 'none' }}>{b.farmer_phone || b.phone}</a>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      Location: {b.service_location} • Date: <strong>{b.booking_date}</strong> • Start: {b.start_time} • Duration: {b.duration || b.estimated_hours} hrs
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                        ₹{b.total_estimated_cost || b.estimated_cost}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Total Estimated</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={actionLoadingId === b.id}
                        onClick={() => handleUpdateStatus(b.id, 'ACCEPTED')}
                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
                      >
                        <Check size={14} />
                        <span>Accept</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={actionLoadingId === b.id}
                        onClick={() => handleUpdateStatus(b.id, 'REJECTED')}
                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', color: '#991b1b' }}
                      >
                        <X size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Accepted Bookings */}
      {activeTab === 'accepted' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: '0 0 1.25rem 0' }}>
            Accepted & Active Deployments
          </h3>

          {acceptedBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              <CheckCircle size={36} style={{ color: 'var(--border-subtle)', margin: '0 auto 0.75rem auto' }} />
              <div>No accepted bookings currently active.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {acceptedBookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-green)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-heading)' }}>
                        {b.machine_name}
                      </strong>
                      <span className="badge-pill badge-emerald" style={{ fontSize: '0.72rem' }}>
                        ACCEPTED / SCHEDULED
                      </span>
                    </div>

                    <div style={{ fontSize: '0.84rem', color: 'var(--text-heading)', marginBottom: '0.2rem' }}>
                      Farmer: <strong>{b.farmer_name}</strong> • Phone: {b.farmer_phone || b.phone}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      Location: {b.service_location} • Date: {b.booking_date} ({b.duration || b.estimated_hours} hrs)
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                        ₹{b.total_estimated_cost || b.estimated_cost}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Rental Total</div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={actionLoadingId === b.id}
                      onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
                    >
                      <CheckCircle size={14} />
                      <span>Mark Completed</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Booking History */}
      {activeTab === 'history' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: '0 0 1.25rem 0' }}>
            Machinery Rental History
          </h3>

          {historyBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              No completed or historical bookings recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {historyBookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.9rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-heading)', display: 'block' }}>
                      {b.machine_name} ({b.farmer_name})
                    </strong>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                      Date: {b.booking_date} • {b.duration || b.estimated_hours} hrs • ₹{b.total_estimated_cost || b.estimated_cost}
                    </div>
                  </div>

                  <span className={`badge-pill ${
                    b.status === 'COMPLETED' ? 'badge-emerald' : b.status === 'CANCELLED' ? 'badge-red' : 'badge-amber'
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: My Machinery Fleet */}
      {activeTab === 'machinery' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: 0 }}>
                My Equipment & Machinery Fleet
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.15rem 0 0 0' }}>
                Toggle availability or add new equipment to the AGRO-SMART marketplace
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsAddModalOpen(true)}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
            >
              <Plus size={15} />
              <span>Add Equipment</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {machinery.map((m) => (
              <div
                key={m.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <span className="badge-pill badge-emerald" style={{ fontSize: '0.7rem' }}>{m.machine_type}</span>
                  <span className={`badge-pill ${m.availability === 'Available' || m.availability === 'Available Now' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
                    {m.availability}
                  </span>
                </div>

                <strong style={{ fontSize: '0.98rem', color: 'var(--text-heading)', display: 'block', marginBottom: '0.25rem' }}>
                  {m.machine_name}
                </strong>

                <div style={{ fontSize: '0.88rem', color: 'var(--primary-800)', fontWeight: 700, marginBottom: '0.35rem' }}>
                  ₹{m.price_per_hour} / hr
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.85rem' }}>
                  Location: {m.location}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleToggleAvailability(m.id)}
                  style={{ width: '100%', fontSize: '0.78rem', padding: '0.35rem', justifyContent: 'center' }}
                >
                  Toggle Availability ({m.availability === 'Available' || m.availability === 'Available Now' ? 'Mark Busy' : 'Mark Available'})
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Machinery to Your Fleet"
        >
          <form onSubmit={handleAddEquipment}>
            <div className="form-group">
              <label className="form-label">Machine Model / Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Mahindra 575 DI Power Plus"
                value={newMachine.name}
                onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
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
                <label className="form-label">Rate per Hour (₹) *</label>
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
                placeholder="e.g. 50 HP, 4WD, Power Steering"
                value={newMachine.specs}
                onChange={(e) => setNewMachine({ ...newMachine, specs: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Save Machinery
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default OwnerDashboardPage;
