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
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
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
    setMobileMenuOpen(false);
    navigate('/');
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

        {/* Auth Profile / Login Button on Desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated && user ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${isAdmin ? '#fca5a5' : 'var(--border-green)'}`,
                  background: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{user.avatar || (isAdmin ? '🛡️' : '👨‍🌾')}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                  {isAdmin ? 'Admin' : user.name.split(' ')[0]}
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
                    <div style={{ fontSize: '0.72rem', color: isAdmin ? '#991b1b' : 'var(--primary-700)', fontWeight: 600 }}>
                      {user.user_type} • {user.district}
                    </div>
                  </div>

                  {isAdmin ? (
                    <>
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.6rem 1rem',
                          fontSize: '0.84rem',
                          color: 'var(--text-heading)',
                          textDecoration: 'none',
                          fontWeight: 600
                        }}
                      >
                        <ShieldCheck size={15} style={{ color: '#991b1b' }} />
                        <span>Admin Console</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.6rem 1rem',
                          fontSize: '0.84rem',
                          color: 'var(--text-heading)',
                          textDecoration: 'none'
                        }}
                      >
                        <LayoutDashboard size={15} style={{ color: 'var(--primary-700)' }} />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to="/machinery-rental"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.6rem 1rem',
                          fontSize: '0.84rem',
                          color: 'var(--text-heading)',
                          textDecoration: 'none'
                        }}
                      >
                        <CalendarCheck size={15} style={{ color: 'var(--primary-700)' }} />
                        <span>My Bookings</span>
                      </Link>

                      <Link
                        to="/disease-detection"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.6rem 1rem',
                          fontSize: '0.84rem',
                          color: 'var(--text-heading)',
                          textDecoration: 'none'
                        }}
                      >
                        <History size={15} style={{ color: 'var(--primary-700)' }} />
                        <span>Scan History</span>
                      </Link>
                    </>
                  )}

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
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              <LogIn size={15} />
              <span>Login</span>
            </Link>
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
              {user.user_type} • {user.district}
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
            {isAdmin ? (
              <NavLink
                to="/admin"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '0.8rem 1rem', color: '#991b1b', fontWeight: 700 }}
              >
                <ShieldCheck size={18} />
                <span>Admin Console</span>
              </NavLink>
            ) : (
              <NavLink
                to="/dashboard"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '0.8rem 1rem' }}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
            )}
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
          <NavLink
            to="/login"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.8rem 1rem', color: 'var(--primary-700)', fontWeight: 700 }}
          >
            <LogIn size={18} />
            <span>Login to AGRO-SMART</span>
          </NavLink>
        )}
      </div>
    </header>
  );
};

export default Navbar;
