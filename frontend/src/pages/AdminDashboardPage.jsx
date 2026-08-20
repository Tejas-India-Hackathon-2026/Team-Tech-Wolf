import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Tractor, 
  CalendarCheck, 
  ScanSearch, 
  CloudSunRain, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Trash2, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  Eye, 
  Sparkles, 
  Layers, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  SlidersHorizontal,
  ChevronRight,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Admin Data Stores
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [machineryList, setMachineryList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [activityLogs, setActivityLogs] = useState({ disease_scans: [], weather_checks: [] });
  const [marketSummary, setMarketSummary] = useState([]);

  // Search & Filter
  const [userFilterRole, setUserFilterRole] = useState('All');
  const [userSearch, setUserSearch] = useState('');
  const [machineSearch, setMachineSearch] = useState('');

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, machineryData, bookingsData, activityData, marketData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getMachinery(),
        adminService.getBookings(),
        adminService.getActivityLogs(),
        adminService.getMarketOverview()
      ]);

      if (statsData) setStats(statsData);
      if (Array.isArray(usersData)) setUsersList(usersData);
      if (Array.isArray(machineryData)) setMachineryList(machineryData);
      if (Array.isArray(bookingsData)) setBookingsList(bookingsData);
      if (activityData) setActivityLogs(activityData);
      if (Array.isArray(marketData)) setMarketSummary(marketData);
    } catch (err) {
      console.warn('[AdminDashboard] Data fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const triggerToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // User Actions
  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await adminService.toggleUserStatus(userId);
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'Active' ? 'Disabled' : 'Active' } : u));
      triggerToast('User status updated successfully.');
    } catch (err) {
      triggerToast(err.message || 'Failed to update user status.', 'error');
    }
  };

  const handleChangeUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'Farmer' ? 'Machinery Owner' : 'Farmer';
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, user_type: newRole, avatar: newRole === 'Machinery Owner' ? '🚜' : '👨‍🌾' } : u));
      triggerToast(`User role updated to ${newRole}.`);
    } catch (err) {
      triggerToast(err.message || 'Failed to update role.', 'error');
    }
  };

  // Machinery Actions
  const handleUpdateMachineryStatus = async (machineryId, newStatus) => {
    try {
      await adminService.updateMachineryStatus(machineryId, newStatus);
      setMachineryList(prev => prev.map(m => m.id === machineryId ? { ...m, availability: newStatus } : m));
      triggerToast(`Machinery status set to ${newStatus}.`);
    } catch (err) {
      triggerToast(err.message || 'Failed to update machinery.', 'error');
    }
  };

  const handleDeleteMachinery = async (machineryId) => {
    if (!window.confirm('Are you sure you want to remove this machinery listing?')) return;
    try {
      await adminService.deleteMachinery(machineryId);
      setMachineryList(prev => prev.filter(m => m.id !== machineryId));
      triggerToast('Machinery listing removed from marketplace.');
    } catch (err) {
      triggerToast(err.message || 'Failed to remove listing.', 'error');
    }
  };

  // Filtered Users
  const filteredUsers = usersList.filter(u => {
    const matchesRole = userFilterRole === 'All' || u.user_type === userFilterRole;
    const matchesSearch = !userSearch || 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch);
    return matchesRole && matchesSearch;
  });

  // Filtered Machinery
  const filteredMachinery = machineryList.filter(m => {
    return !machineSearch ||
      m.machine_name.toLowerCase().includes(machineSearch.toLowerCase()) ||
      m.machine_type.toLowerCase().includes(machineSearch.toLowerCase()) ||
      m.owner_name?.toLowerCase().includes(machineSearch.toLowerCase()) ||
      m.location?.toLowerCase().includes(machineSearch.toLowerCase());
  });

  return (
    <div className="page-wrapper container" style={{ maxWidth: '1200px' }}>
      
      {/* Top Banner */}
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
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #15803d, #166534)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(22, 101, 52, 0.25)'
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.65rem', margin: 0, color: 'var(--text-heading)', fontWeight: 800 }}>
                AGRO-SMART Admin Console
              </h1>
              <span className="badge-pill badge-red" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={12} /> System Administrator
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: '0.2rem 0 0 0' }}>
              Platform management for users, equipment listings, bookings, and diagnostic telemetry
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <span className="badge-pill badge-amber" style={{ fontSize: '0.75rem' }}>
            <Sparkles size={12} /> Demo Authentication Mode
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadAllAdminData}
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
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div style={{
          background: notification.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${notification.type === 'error' ? '#fecaca' : 'var(--border-green)'}`,
          color: notification.type === 'error' ? '#991b1b' : 'var(--primary-900)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem'
        }}>
          {notification.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid var(--border-subtle)',
        marginBottom: '1.75rem',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'overview', label: 'Platform Overview', icon: Layers },
          { id: 'users', label: `User Management (${usersList.length})`, icon: Users },
          { id: 'machinery', label: `Machinery Moderation (${machineryList.length})`, icon: Tractor },
          { id: 'bookings', label: `Rental Bookings (${bookingsList.length})`, icon: CalendarCheck },
          { id: 'activity', label: 'Telemetry & Activity', icon: ScanSearch },
          { id: 'market', label: 'Market Intelligence', icon: TrendingUp }
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
                padding: '0.65rem 1rem',
                border: 'none',
                background: 'none',
                borderBottom: isActive ? '3px solid var(--primary-700)' : '3px solid transparent',
                color: isActive ? 'var(--primary-800)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Platform Overview */}
      {activeTab === 'overview' && (
        <div>
          {/* Summary Metric Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Total Registered Users</span>
                <Users size={18} style={{ color: 'var(--primary-700)' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {stats?.total_users || usersList.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                {stats?.farmers_count || 1} Farmers • {stats?.owners_count || 1} Owners
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Machinery Catalog</span>
                <Tractor size={18} style={{ color: '#b45309' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {stats?.total_listings || machineryList.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)', marginTop: '0.2rem' }}>
                {stats?.active_listings || machineryList.length} Available Listings
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Rental Bookings</span>
                <CalendarCheck size={18} style={{ color: '#0369a1' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {stats?.total_bookings || bookingsList.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                {bookingsList.filter(b => b.status === 'Accepted' || b.status === 'Confirmed').length} Confirmed
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Foliar Scans & Weather</span>
                <ScanSearch size={18} style={{ color: '#15803d' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {(stats?.total_scans || 0) + (stats?.total_weather_checks || 0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                {activityLogs.disease_scans.length} Scans • {activityLogs.weather_checks.length} Weather Checks
              </div>
            </div>
          </div>

          {/* Quick System Architecture Note */}
          <div className="glass-card" style={{ background: '#f8faf7', border: '1px solid var(--border-green)', marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-heading)', margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--primary-700)' }} />
              Admin Security & Role Boundary Constraints
            </h3>
            <ul style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <li><strong>Zero Self-Promotion:</strong> Public registration is strictly limited to Farmers and Machinery Owners. No public user can register as Admin.</li>
              <li><strong>Demo Mode Integrity:</strong> All statistics and telemetry reflect live in-memory stores and local session persistence.</li>
              <li><strong>Future Supabase Auth:</strong> Admin role checks use standardized RBAC ready for Supabase JWT claims integration.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: User Management */}
      {activeTab === 'users' && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: 0 }}>
                Platform Demo User Accounts
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.15rem 0 0 0' }}>
                Manage account access, toggle user activation status, and adjust roles
              </p>
            </div>

            {/* Filter controls */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search name, email, phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{ width: '220px', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
              />
              <select
                className="form-control"
                value={userFilterRole}
                onChange={(e) => setUserFilterRole(e.target.value)}
                style={{ width: '140px', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
              >
                <option value="All">All Roles</option>
                <option value="Farmer">Farmer</option>
                <option value="Machinery Owner">Machinery Owner</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#f8faf7', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>User</th>
                  <th style={{ padding: '0.75rem' }}>Contact</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem' }}>Location</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{u.avatar || '👤'}</span>
                        <div>
                          <strong style={{ color: 'var(--text-heading)', display: 'block' }}>{u.name}</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>ID: {u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-heading)' }}>{u.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge-pill ${
                        u.user_type === 'Admin' 
                          ? 'badge-red' 
                          : u.user_type === 'Machinery Owner' 
                          ? 'badge-amber' 
                          : 'badge-emerald'
                      }`}>
                        {u.user_type}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                      {u.district}, {u.state}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge-pill ${u.status === 'Active' ? 'badge-emerald' : 'badge-red'}`}>
                        {u.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      {u.user_type !== 'Admin' ? (
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleChangeUserRole(u.id, u.user_type)}
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                            title={`Switch to ${u.user_type === 'Farmer' ? 'Machinery Owner' : 'Farmer'}`}
                          >
                            Switch Role
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleToggleUserStatus(u.id)}
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', color: u.status === 'Active' ? '#991b1b' : '#15803d' }}
                          >
                            {u.status === 'Active' ? <UserX size={13} /> : <UserCheck size={13} />}
                            <span>{u.status === 'Active' ? 'Disable' : 'Enable'}</span>
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Machinery Moderation */}
      {activeTab === 'machinery' && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: 0 }}>
                Machinery Marketplace Moderation
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.15rem 0 0 0' }}>
                Inspect equipment listings, approve new submissions, and toggle availability
              </p>
            </div>

            <input
              type="text"
              className="form-control"
              placeholder="Search machinery, location, owner..."
              value={machineSearch}
              onChange={(e) => setMachineSearch(e.target.value)}
              style={{ width: '260px', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#f8faf7', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>Equipment</th>
                  <th style={{ padding: '0.75rem' }}>Category</th>
                  <th style={{ padding: '0.75rem' }}>Owner</th>
                  <th style={{ padding: '0.75rem' }}>Rate</th>
                  <th style={{ padding: '0.75rem' }}>Location</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Moderation</th>
                </tr>
              </thead>
              <tbody>
                {filteredMachinery.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <strong style={{ color: 'var(--text-heading)', display: 'block' }}>{m.machine_name}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>ID: {m.id}</span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="badge-pill badge-emerald" style={{ fontSize: '0.7rem' }}>{m.machine_type}</span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-heading)' }}>{m.owner_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{m.owner_phone}</div>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary-800)' }}>
                      ₹{m.price_per_hour}/hr
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                      {m.location}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge-pill ${m.availability === 'Available Now' || m.availability === 'Available' ? 'badge-emerald' : 'badge-amber'}`}>
                        {m.availability}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {m.availability !== 'Available Now' && m.availability !== 'Available' ? (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleUpdateMachineryStatus(m.id, 'Available')}
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleUpdateMachineryStatus(m.id, 'Unavailable')}
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                          >
                            Mark Busy
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleDeleteMachinery(m.id)}
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', color: '#991b1b' }}
                          title="Remove Listing"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Bookings Inspection */}
      {activeTab === 'bookings' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: '0 0 1rem 0' }}>
            All Rental Bookings & Farmer Transactions
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#f8faf7', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>Booking ID</th>
                  <th style={{ padding: '0.75rem' }}>Farmer</th>
                  <th style={{ padding: '0.75rem' }}>Machinery</th>
                  <th style={{ padding: '0.75rem' }}>Owner</th>
                  <th style={{ padding: '0.75rem' }}>Date & Hours</th>
                  <th style={{ padding: '0.75rem' }}>Estimated Cost</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookingsList.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--primary-800)' }}>
                      {b.id}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{b.farmer_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{b.phone}</div>
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-heading)' }}>
                      {b.machine_name}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div>{b.owner_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{b.owner_phone}</div>
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                      {b.booking_date} ({b.estimated_hours} hrs)
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                      ₹{b.total_estimated_cost || (b.price_per_hour * b.estimated_hours)}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge-pill ${
                        b.status === 'Accepted' || b.status === 'Confirmed' 
                          ? 'badge-emerald' 
                          : b.status === 'Rejected' 
                          ? 'badge-red' 
                          : 'badge-amber'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Activity & Telemetry */}
      {activeTab === 'activity' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Disease Scans Log */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-heading)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ScanSearch size={18} style={{ color: 'var(--primary-700)' }} />
              Recent Disease Scans Log
            </h3>
            {activityLogs.disease_scans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No recent scans in memory.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {activityLogs.disease_scans.slice(0, 8).map((s, idx) => (
                  <div key={idx} style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span className="badge-pill badge-emerald" style={{ fontSize: '0.7rem' }}>{s.crop || s.crop_name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{s.timestamp || 'Recorded'}</span>
                    </div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-heading)', display: 'block' }}>
                      {s.disease || s.detected_disease}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Severity: {s.severity} • {s.is_demo ? 'Demo Analysis' : 'Live AI'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weather Checks Log */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-heading)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CloudSunRain size={18} style={{ color: '#0369a1' }} />
              Recent Agro Weather Checks
            </h3>
            {activityLogs.weather_checks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No weather queries recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {activityLogs.weather_checks.slice(0, 8).map((w, idx) => (
                  <div key={idx} style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-heading)' }}>{w.location}</strong>
                      <span className="badge-pill badge-emerald" style={{ fontSize: '0.68rem' }}>{w.crop}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {w.temperature}°C • {w.weather_condition} (Risk: {w.risk_level})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Market Intelligence Overview */}
      {activeTab === 'market' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: '0 0 1rem 0' }}>
            APMC Mandi Hubs & Monitored Crops
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {marketSummary.map((m, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-heading)' }}>{m.crop}</strong>
                  <span className="badge-pill badge-emerald" style={{ fontSize: '0.7rem' }}>{m.mandis_count} Mandis</span>
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-800)', margin: '0.25rem 0' }}>
                  ₹{m.avg_modal_price}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Avg Modal Rate per Quintal across active trading hubs
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;
