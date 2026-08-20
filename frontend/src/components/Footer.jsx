import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Database, Cpu } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="nav-brand" style={{ marginBottom: '0.85rem' }}>
              <div className="nav-logo-icon">
                <Sprout size={20} />
              </div>
              <div>
                <span style={{ color: 'var(--text-heading)', fontWeight: 800 }}>AGRO-</span>
                <span style={{ color: 'var(--primary-700)', fontWeight: 800 }}>SMART</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '340px', marginBottom: '1.2rem' }}>
              Smart Farming. Smarter Decisions. Better Harvests. Empowering farmers with AI diagnostics, agro-meteorological alerts, machinery access, and real-time mandi intelligence.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span className="badge-pill badge-emerald"><Cpu size={12} /> AI Pathology Engine</span>
              <span className="badge-pill badge-amber"><Database size={12} /> Supabase PostgreSQL</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Core Services</h4>
            <ul className="footer-links">
              <li><Link to="/disease-detection">AI Disease Detection</Link></li>
              <li><Link to="/weather-intelligence">Weather Risk Alerts</Link></li>
              <li><Link to="/machinery-rental">Machinery Marketplace</Link></li>
              <li><Link to="/market-intelligence">Mandi Price Intelligence</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Agro Resources</h4>
            <ul className="footer-links">
              <li><Link to="/disease-detection">Fungicide & Bio-spray Guide</Link></li>
              <li><Link to="/weather-intelligence">Spray Window Forecasts</Link></li>
              <li><Link to="/machinery-rental">Tractor & Drone Rates</Link></li>
              <li><Link to="/market-intelligence">Mandi Arbitrage Calculator</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Hackathon Tech</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
              Built with React, Python Flask, and Supabase for the National Agriculture Hackathon.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-700)', fontSize: '0.85rem', fontWeight: 600 }}>
              <ShieldCheck size={16} /> Ready for Real Field Deployment
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} AGRO-SMART Platform. Smart Farming. Smarter Decisions. Better Harvests.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Built with precision for modern Indian agriculture
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
