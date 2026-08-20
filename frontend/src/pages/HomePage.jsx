import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ScanSearch, 
  CloudSunRain, 
  Tractor, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import { marketService } from '../services/marketService';

const HomePage = () => {
  const [tickerPrices, setTickerPrices] = useState([]);

  useEffect(() => {
    marketService.getPrices().then((prices) => {
      setTickerPrices(prices.slice(0, 5));
    });
  }, []);

  return (
    <div className="home-page">
      {/* Top Commodity Live Ribbon */}
      <div style={{
        background: '#f0fdf4',
        borderBottom: '1px solid var(--border-green)',
        padding: '0.65rem 0',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-800)', fontSize: '0.82rem', fontWeight: 700 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-600)', display: 'inline-block' }} />
            LIVE MANDI APMC SPOT RATES:
          </div>
          <div style={{ display: 'flex', gap: '1.75rem', fontSize: '0.85rem' }}>
            {tickerPrices.map((item) => (
              <span key={item.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <strong style={{ color: 'var(--text-heading)' }}>{item.commodity}</strong>
                <span style={{ color: 'var(--text-dim)' }}>({item.mandi_name.split(' ')[0]}):</span>
                <span style={{ color: 'var(--primary-700)', fontWeight: 700 }}>₹{item.modal_price}/Q</span>
                <span style={{ 
                  color: item.price_trend === 'Bullish' ? 'var(--primary-700)' : item.price_trend === 'Bearish' ? 'var(--status-danger)' : 'var(--accent-amber)',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {item.price_trend === 'Bullish' ? '▲' : item.price_trend === 'Bearish' ? '▼' : '●'} {item.price_trend}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section style={{ padding: '4.5rem 0 3.5rem 0', position: 'relative' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '880px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span className="badge-pill badge-emerald">
              <Sparkles size={14} /> National Agri-Tech Hackathon Edition
            </span>
          </div>

          {/* Exact Prescribed Headline */}
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)', 
            fontWeight: 800, 
            letterSpacing: '-0.03em', 
            marginBottom: '1rem',
            color: 'var(--text-heading)'
          }}>
            <span className="gradient-text">AGRO-SMART</span>
          </h1>

          {/* Exact Prescribed Subtitle */}
          <p style={{ 
            fontSize: 'clamp(1.2rem, 2.8vw, 1.85rem)', 
            fontWeight: 700, 
            color: 'var(--accent-gold)',
            marginBottom: '1.25rem',
            fontFamily: 'var(--font-heading)'
          }}>
            Smart Farming. Smarter Decisions. Better Harvests.
          </p>

          {/* Exact Prescribed Description */}
          <p style={{ 
            fontSize: '1.15rem', 
            color: 'var(--text-muted)', 
            lineHeight: '1.7', 
            maxWidth: '680px', 
            margin: '0 auto 2.5rem auto' 
          }}>
            An AI-powered digital platform for smarter agriculture.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/disease-detection" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
              <ScanSearch size={18} />
              <span>Diagnose Crop Health</span>
            </Link>
            <Link to="/market-intelligence" className="btn btn-secondary" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
              <TrendingUp size={18} style={{ color: 'var(--primary-700)' }} />
              <span>Explore Mandi Prices</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem',
            marginTop: '3.5rem',
            paddingTop: '2.5rem',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)', fontFamily: 'var(--font-heading)' }}>95.4%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>AI Diagnosis Accuracy</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-heading)' }}>7-Day</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Micro-Weather Risk Window</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'var(--font-heading)' }}>15 km</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Hyperlocal Machinery Radius</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-sky)', fontFamily: 'var(--font-heading)' }}>8+ APMCs</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Live Mandi Arbitrage Feeds</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section style={{ padding: '2rem 0 5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge-pill badge-emerald" style={{ marginBottom: '0.75rem' }}>
              Four Core Agricultural Services
            </span>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>
              Engineered Strictly for High-Impact Farming
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              Every module is designed to solve critical farmer pain points from seed to harvest.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '1.75rem'
          }}>
            {/* Feature 1: AI Disease Detection */}
            <FeatureCard
              title="AI Disease Detection"
              description="Upload a photo. Get a preliminary diagnosis and actionable advice instantly."
              icon={ScanSearch}
              path="/disease-detection"
              badge="Computer Vision"
              iconBg="var(--primary-100)"
              iconColor="var(--primary-700)"
              actionText="Scan Crop Leaf"
            />

            {/* Feature 2: Weather Risk Alerts */}
            <FeatureCard
              title="Weather Risk Alerts"
              description="Crop-specific risk warnings powered by real-time weather data."
              icon={CloudSunRain}
              path="/weather-intelligence"
              badge="Agro-Meteorology"
              iconBg="var(--accent-sky-light)"
              iconColor="var(--accent-sky)"
              actionText="Check Crop Risks"
            />

            {/* Feature 3: Machinery Rental */}
            <FeatureCard
              title="Machinery Rental"
              description="Location-based marketplace to book tractors and harvesters on demand."
              icon={Tractor}
              path="/machinery-rental"
              badge="On-Demand Fleet"
              iconBg="var(--accent-amber-light)"
              iconColor="var(--accent-gold)"
              actionText="Rent Machinery"
            />

            {/* Feature 4: Price Intelligence */}
            <FeatureCard
              title="Price Intelligence"
              description="Historical trends and forecasts to decide when and where to sell."
              icon={TrendingUp}
              path="/market-intelligence"
              badge="APMC Mandi AI"
              iconBg="#f0fdf4"
              iconColor="var(--primary-700)"
              actionText="Analyze Mandi Prices"
            />
          </div>
        </div>
      </section>

      {/* Decision Workflow Overview */}
      <section style={{ padding: '0 0 5rem 0' }}>
        <div className="container">
          <div className="glass-card" style={{ padding: '2.5rem', background: '#ffffff', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              <div>
                <span className="badge-pill badge-amber" style={{ marginBottom: '1rem' }}>End-to-End Farming Cycle</span>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--text-heading)' }}>Why Farmers Rely on AGRO-SMART</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                  Traditional farming decisions rely on guesswork and fragmented middlemen. AGRO-SMART connects field-level computer vision diagnostics, weather vulnerability forecasts, shared machinery rental, and live APMC market prices into one unified dashboard.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-heading)', fontSize: '0.92rem' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--primary-700)' }} /> Instant organic vs chemical spray guidance
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-heading)', fontSize: '0.92rem' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--primary-700)' }} /> Optimal foliar spray window to save chemical costs
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-heading)', fontSize: '0.92rem' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--primary-700)' }} /> Zero-ownership equipment rental to lower capital burden
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-heading)', fontSize: '0.92rem' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--primary-700)' }} /> Mandi arbitrage calculation with transport deduction
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#f8faf7', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <ScanSearch size={20} style={{ color: 'var(--primary-700)' }} />
                    <strong style={{ color: 'var(--text-heading)' }}>Step 1: Early Leaf Diagnosis</strong>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Detect rust, blight, or bacterial wilt before infection spreads to entire farm parcel.</p>
                </div>

                <div style={{ background: '#f8faf7', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <CloudSunRain size={20} style={{ color: 'var(--accent-sky)' }} />
                    <strong style={{ color: 'var(--text-heading)' }}>Step 2: Weather & Spray Timing</strong>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verify wind and humidity before applying remedies so sprays don't wash off in rain.</p>
                </div>

                <div style={{ background: '#f8faf7', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <TrendingUp size={20} style={{ color: 'var(--accent-gold)' }} />
                    <strong style={{ color: 'var(--text-heading)' }}>Step 3: Sell at Peak Mandi Rate</strong>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Compare prices across nearby APMCs to maximize farmer net profit per quintal.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
