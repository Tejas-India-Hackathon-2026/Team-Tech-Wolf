import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Sprout, 
  ScanSearch, 
  CloudSunRain, 
  Tractor, 
  TrendingUp, 
  Menu, 
  X
} from 'lucide-react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: Sprout },
    { name: 'Disease Detection', path: '/disease-detection', icon: ScanSearch },
    { name: 'Weather Intelligence', path: '/weather-intelligence', icon: CloudSunRain },
    { name: 'Machinery Rental', path: '/machinery-rental', icon: Tractor },
    { name: 'Market Intelligence', path: '/market-intelligence', icon: TrendingUp },
  ];

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

        {/* Mobile Hamburger Button */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
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
      </div>
    </header>
  );
};

export default Navbar;
