import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  ScanSearch, 
  CloudSunRain, 
  Tractor, 
  TrendingUp, 
  Menu, 
  X,
  LogIn,
  User,
  LayoutDashboard,
  CalendarCheck,
  History,
  LogOut,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Users,
  Layers,
  UserPlus,
  Bell,
  CheckCheck,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRoleDisplayName } from '../services/authService';
import { notificationService, formatRelativeTime } from '../services/notificationService';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);
  
  const { user, isAuthenticated, role, isFarmer, isMachineryOwner, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Load and subscribe to notifications
  const refreshNotifications = () => {
    if (user && user.id) {
      const list = notificationService.getNotifications(user.id);
      setNotifications(list.slice(0, 5)); // Latest 5
      setUnreadCount(notificationService.getUnreadCount(user.id));
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    refreshNotifications();

    const handleUpdate = () => refreshNotifications();
    window.addEventListener('agro_smart_notifications_updated', handleUpdate);
    return () => window.removeEventListener('agro_smart_notifications_updated', handleUpdate);
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: Sprout },
    { name: 'Disease Detection', path: '/disease-detection', icon: ScanSearch },
    { name: 'Weather Intelligence', path: '/weather-intelligence', icon: CloudSunRain },
    { name: 'Machinery Rental', path: '/machinery-rental', icon: Tractor },
    { name: 'Market Intelligence', path: '/market-intelligence', icon: TrendingUp },
  ];

  const handleLogoutClick = () => {
    logout();
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleNotificationItemClick = (notif) => {
    notificationService.markAsRead(notif.id);
    setNotifDropdownOpen(false);
    refreshNotifications();
    if (notif.action_url) {
      navigate(notif.action_url);
    }
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    if (user?.id) {
      notificationService.markAllAsRead(user.id);
      refreshNotifications();
    }
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isMachineryOwner) return '/owner/dashboard';
    return '/dashboard';
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-brand">
          <div className="nav-logo-icon">
            <Sprout size={22} />
          </div>
          <div>
            <span style={{ color: 'var(--text-heading)', fontWeight: 800, letterSpacing: '-0.03em' }}>AGRO-</span>
            <span style={{ color: 'var(--primary-700)', fontWeight: 800 }}>SMART</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav>
          <ul className="nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    end={item.path === '/'}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right Toolbar: Notification Bell + Auth Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          
          {/* Notification Bell (Only for Authenticated Users) */}
          {isAuthenticated && user && (
            <div style={{ position: 'relative' }} ref={notifDropdownRef}>
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setUserDropdownOpen(false);
                }}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: notifDropdownOpen ? 'var(--primary-100)' : '#ffffff',
                  color: unreadCount > 0 ? 'var(--primary-800)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#dc2626',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      borderRadius: '10px',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      boxShadow: '0 2px 5px rgba(220, 38, 38, 0.4)'
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {notifDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '340px',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-green)',
                  zIndex: 300,
                  overflow: 'hidden'
                }}>
                  {/* Dropdown Header */}
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: '#f8faf7',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-heading)' }}>
                        Notifications
                      </strong>
                      {unreadCount > 0 && (
                        <span className="badge-pill badge-emerald" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-700)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          padding: 0
                        }}
                      >
                        <CheckCheck size={13} />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  {/* Notification Items List */}
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.84rem' }}>
                        <Bell size={28} style={{ color: 'var(--border-subtle)', margin: '0 auto 0.4rem auto' }} />
                        <div>No notifications yet.</div>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationItemClick(n)}
                          style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--border-subtle)',
                            background: n.read ? '#ffffff' : '#f0fdf4',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <strong style={{ fontSize: '0.86rem', color: 'var(--text-heading)', lineHeight: 1.3 }}>
                              {n.title}
                            </strong>
                            {!n.read && (
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-700)', flexShrink: 0, marginTop: '5px' }} />
                            )}
                          </div>
                          
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.35rem 0', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {n.message}
                          </p>
                          
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Clock size={11} />
                              {formatRelativeTime(n.created_at)}
                            </span>
                            <span style={{ color: 'var(--primary-800)', fontWeight: 600 }}>Open →</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <Link
                    to="/notifications"
                    onClick={() => setNotifDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.65rem',
                      background: '#f8faf7',
                      color: 'var(--primary-800)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      borderTop: '1px solid var(--border-subtle)'
                    }}
                  >
                    <span>View All Notifications</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* User Profile Pill / Menu */}
          {isAuthenticated && user ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotifDropdownOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${isAdmin ? '#fca5a5' : isMachineryOwner ? '#fde68a' : 'var(--border-green)'}`,
                  background: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{user.avatar || (isAdmin ? '🛡️' : isMachineryOwner ? '🚜' : '👨‍🌾')}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                  {user.name ? user.name.split(' ')[0] : 'User'}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--text-dim)' }} />
              </button>

              {/* Profile Dropdown Menu */}
              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '230px',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.5rem 0',
                  zIndex: 200
                }}>
                  <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: isAdmin ? '#991b1b' : isMachineryOwner ? '#b45309' : 'var(--primary-700)', fontWeight: 600 }}>
                      {getRoleDisplayName(user.role)} • {user.district || 'India'}
                    </div>
                  </div>

                  {/* ADMIN LINKS */}
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--text-heading)', textDecoration: 'none', fontWeight: 600 }}
                      >
                        <ShieldCheck size={15} style={{ color: '#991b1b' }} />
                        <span>Admin Dashboard</span>
                      </Link>
                      <Link
                        to="/admin/dashboard?tab=users"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--text-heading)', textDecoration: 'none' }}
                      >
                        <Users size={15} style={{ color: '#991b1b' }} />
                        <span>User Management</span>
                      </Link>
                      <Link
                        to="/admin/dashboard?tab=bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--text-heading)', textDecoration: 'none' }}
                      >
                        <CalendarCheck size={15} style={{ color: '#991b1b' }} />
                        <span>All Bookings</span>
                      </Link>
                    </>
                  )}

                  {/* MACHINERY OWNER LINKS */}
                  {isMachineryOwner && (
                    <>
                      <Link
                        to="/owner/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--text-heading)', textDecoration: 'none', fontWeight: 600 }}
                      >
                        <Tractor size={15} style={{ color: '#b45309' }} />
                        <span>Owner Dashboard</span>
                      </Link>
                      <Link
                        to="/owner/dashboard?tab=requests"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--text-heading)', textDecoration: 'none' }}
                      >
                        <CalendarCheck size={15} style={{ color: '#b45309' }} />
                        <span>Booking Requests</span>
                      </Link>
                      <Link
                        to="/owner/dashboard?tab=machinery"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--text-heading)', textDecoration: 'none' }}
                      >
                        <Layers size={15} style={{ color: '#b45309' }} />
                        <span>My Machinery Fleet</span>
                      </Link>
                    </>
                  )}

                  {/* FARMER LINKS */}
                  {isFarmer && (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--text-heading)', textDecoration: 'none', fontWeight: 600 }}
                      >
                        <LayoutDashboard size={15} style={{ color: 'var(--primary-700)' }} />
                        <span>Farmer Dashboard</span>
                      </Link>
                      <Link
                        to="/machinery-rental"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--text-heading)', textDecoration: 'none' }}
                      >
                        <CalendarCheck size={15} style={{ color: 'var(--primary-700)' }} />
                        <span>My Bookings</span>
                      </Link>
                      <Link
                        to="/disease-detection"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--text-heading)', textDecoration: 'none' }}
                      >
                        <History size={15} style={{ color: 'var(--primary-700)' }} />
                        <span>Scan History</span>
                      </Link>
                    </>
                  )}

                  {/* Common Notifications Link */}
                  <Link
                    to="/notifications"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--text-heading)', textDecoration: 'none' }}
                  >
                    <Bell size={15} style={{ color: 'var(--primary-700)' }} />
                    <span>Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}</span>
                  </Link>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.35rem', paddingTop: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 1rem',
                        fontSize: '0.84rem',
                        color: '#991b1b',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to="/login"
                className="btn btn-primary"
                style={{ padding: '0.42rem 0.85rem', fontSize: '0.82rem' }}
              >
                <LogIn size={14} />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="btn btn-secondary"
                style={{ padding: '0.42rem 0.85rem', fontSize: '0.82rem' }}
              >
                <UserPlus size={14} />
                <span>Register</span>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {isAuthenticated && user && (
          <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.5rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{user.name}</div>
            <div style={{ fontSize: '0.78rem', color: isAdmin ? '#991b1b' : 'var(--primary-700)' }}>
              {getRoleDisplayName(user.role)} • {user.district || 'India'}
            </div>
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
              end={item.path === '/'}
              style={{ padding: '0.8rem 1rem' }}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {isAuthenticated ? (
          <>
            <NavLink
              to="/notifications"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} />
                <span>Notifications</span>
              </div>
              {unreadCount > 0 && (
                <span className="badge-pill badge-red" style={{ fontSize: '0.7rem' }}>
                  {unreadCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to={getDashboardPath()}
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.8rem 1rem', fontWeight: 600 }}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            
            <button
              type="button"
              onClick={handleLogoutClick}
              className="nav-link"
              style={{ padding: '0.8rem 1rem', color: '#991b1b', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <div style={{ padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <NavLink
              to="/login"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: 'var(--primary-700)', fontWeight: 700 }}
            >
              <LogIn size={18} />
              <span>Sign In</span>
            </NavLink>
            <NavLink
              to="/register"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600 }}
            >
              <UserPlus size={18} />
              <span>Create Account</span>
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
