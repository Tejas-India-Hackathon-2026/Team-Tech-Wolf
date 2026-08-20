import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  Calculator, 
  MapPin, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  Info, 
  RefreshCw, 
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { marketService } from '../services/marketService';
import { formatCurrency, formatPercent } from '../utils/formatters';
import LoadingSkeleton from '../components/LoadingSkeleton';

const CROPS = ['Tomato', 'Potato', 'Onion', 'Wheat', 'Rice', 'Maize'];

const PRESET_MANDIS = [
  { id: 'patna', name: 'Patna Mandi (Bihar)', location: 'Patna, Bihar' },
  { id: 'pune', name: 'Pune Mandi - Gultekdi (MH)', location: 'Pune, Maharashtra' },
  { id: 'nashik', name: 'Nashik APMC (MH)', location: 'Nashik, Maharashtra' },
  { id: 'lasalgaon', name: 'Lasalgaon Mandi (MH)', location: 'Nashik, Maharashtra' },
  { id: 'karnal', name: 'Karnal APMC (Haryana)', location: 'Karnal, Haryana' },
  { id: 'agra', name: 'Agra APMC (Uttar Pradesh)', location: 'Agra, Uttar Pradesh' },
  { id: 'latur', name: 'Latur APMC (MH)', location: 'Latur, Maharashtra' }
];

const MarketIntelligencePage = () => {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedLocation, setSelectedLocation] = useState('Patna Mandi, Bihar');
  const [selectedDays, setSelectedDays] = useState(30);
  
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Hovered chart point
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Arbitrage Calculator State
  const [calcQuantity, setCalcQuantity] = useState(50);
  const [calcTransportRate, setCalcTransportRate] = useState(15);
  const [arbitrageResults, setArbitrageResults] = useState([]);

  const runMarketAnalysis = async (crop = selectedCrop, location = selectedLocation, days = selectedDays) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await marketService.getAnalysis(crop, location, days);
      setAnalysisData(data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch market analysis.');
    } finally {
      setLoading(false);
    }
  };

  const fetchArbitrage = async () => {
    try {
      const data = await marketService.getArbitrage(selectedCrop, calcQuantity, calcTransportRate);
      setArbitrageResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    runMarketAnalysis('Tomato', 'Patna Mandi, Bihar', 30);
  }, []);

  useEffect(() => {
    fetchArbitrage();
  }, [selectedCrop, calcQuantity, calcTransportRate]);

  const handleAnalyzeClick = (e) => {
    e?.preventDefault();
    runMarketAnalysis(selectedCrop, selectedLocation, selectedDays);
  };

  // Determine Recommendation Badge Styling
  const rec = analysisData?.recommendation?.toUpperCase() || 'MONITOR';
  const isSell = rec.includes('SELL');
  const isWait = rec.includes('WAIT');

  // Chart SVG Coordinates Generator
  const renderChart = () => {
    if (!analysisData?.historical_prices || analysisData.historical_prices.length === 0) return null;

    const series = analysisData.historical_prices;
    const prices = series.map((s) => s.price);
    const minP = Math.min(...prices) * 0.96;
    const maxP = Math.max(...prices) * 1.04;
    const rangeP = maxP - minP || 100;

    const svgWidth = 700;
    const svgHeight = 240;
    const paddingX = 45;
    const paddingY = 30;

    const plotWidth = svgWidth - paddingX * 2;
    const plotHeight = svgHeight - paddingY * 2;

    const points = series.map((item, index) => {
      const x = paddingX + (index / (series.length - 1)) * plotWidth;
      const y = paddingY + plotHeight - ((item.price - minP) / rangeP) * plotHeight;
      return { x, y, ...item };
    });

    const pathD = points.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '');
    const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${svgHeight - paddingY} L ${points[0].x.toFixed(1)} ${svgHeight - paddingY} Z`;

    const strokeColor = isSell ? '#dc2626' : isWait ? '#2e7d32' : '#d97706';
    const fillColor = isSell ? 'rgba(220, 38, 38, 0.08)' : isWait ? 'rgba(46, 125, 50, 0.08)' : 'rgba(217, 119, 6, 0.08)';

    return (
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', minWidth: '550px' }}>
          <defs>
            <linearGradient id="marketAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#e5e7eb" strokeDasharray="3 3" />
          <line x1={paddingX} y1={paddingY + plotHeight / 2} x2={svgWidth - paddingX} y2={paddingY + plotHeight / 2} stroke="#e5e7eb" strokeDasharray="3 3" />
          <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#cbd5e1" />

          {/* Y-Axis Label Indicators */}
          <text x={paddingX - 8} y={paddingY + 4} textAnchor="end" fontSize="11" fill="#6b7280">₹{Math.round(maxP)}</text>
          <text x={paddingX - 8} y={paddingY + plotHeight / 2 + 4} textAnchor="end" fontSize="11" fill="#6b7280">₹{Math.round((maxP + minP) / 2)}</text>
          <text x={paddingX - 8} y={svgHeight - paddingY} textAnchor="end" fontSize="11" fill="#6b7280">₹{Math.round(minP)}</text>

          {/* Area Fill */}
          <path d={areaD} fill="url(#marketAreaGrad)" />

          {/* Trend Line */}
          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredPoint?.date === pt.date;
            const isLast = idx === points.length - 1;

            return (
              <g key={idx} onMouseEnter={() => setHoveredPoint(pt)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered || isLast ? 6 : 3.5}
                  fill={isLast ? strokeColor : '#ffffff'}
                  stroke={strokeColor}
                  strokeWidth={isLast ? 3 : 2}
                />
                {(idx === 0 || isLast || idx === Math.floor(points.length / 2)) && (
                  <text
                    x={pt.x}
                    y={svgHeight - paddingY + 18}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6b7280"
                    fontWeight="500"
                  >
                    {pt.formatted_date}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Dynamic Hover Tooltip */}
        {hoveredPoint && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '15px',
            background: '#ffffff',
            border: '1px solid var(--border-green)',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-sm)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Calendar size={13} style={{ color: 'var(--primary-700)' }} />
            <span style={{ color: 'var(--text-dim)' }}>{hoveredPoint.date}:</span>
            <strong style={{ color: 'var(--primary-700)' }}>₹{hoveredPoint.price} / Q</strong>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-wrapper container">
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span className="badge-pill badge-emerald">
            <TrendingUp size={14} /> Service 4 of 4
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>APMC Mandi Intelligence & Decision Engine</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>
          Market Intelligence & Selling Decisions
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '720px' }}>
          Data-driven decision support to help farmers evaluate historical spot trends, transparent price estimates, and actionable selling recommendations (<strong>SELL</strong>, <strong>MONITOR</strong>, or <strong>WAIT</strong>).
        </p>
      </div>

      {/* User Flow Ribbon */}
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
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-heading)' }}>Select Crop</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-700)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-heading)' }}>Select Mandi</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-700)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-heading)' }}>Analyze Trends</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-700)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-heading)' }}>Generate Estimate</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-700)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-heading)' }}>Recommend Action</span>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          color: '#991b1b',
          fontSize: '0.88rem'
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Control Input Selector Bar */}
      <form onSubmit={handleAnalyzeClick} className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
          
          {/* 1. Crop Selector */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">1. Select Crop</label>
            <select
              className="form-control"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              {CROPS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 2. Mandi / Location Selector */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">2. Target Mandi / APMC Hub</label>
            <select
              className="form-control"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              {PRESET_MANDIS.map((m) => (
                <option key={m.id} value={m.location}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* 3. Time Period Selector */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">3. Time Period</label>
            <select
              className="form-control"
              value={selectedDays}
              onChange={(e) => setSelectedDays(Number(e.target.value))}
            >
              <option value={7}>7 Days Historical</option>
              <option value={15}>15 Days Historical</option>
              <option value={30}>30 Days Historical</option>
            </select>
          </div>

          {/* 4. Action Button */}
          <div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem 1rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-pulse" />
                  <span>Analyzing Market...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Analyze Market</span>
                </>
              )}
            </button>
          </div>

        </div>
      </form>

      {loading && <LoadingSkeleton text={`Analyzing historical price trends for ${selectedCrop} at ${selectedLocation}...`} />}

      {/* Main Dashboard Display */}
      {!loading && analysisData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Top Analytics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem'
          }}>
            {/* Current Price */}
            <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Current Spot Price
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-heading)' }}>
                {formatCurrency(analysisData.current_price)}
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 500 }}> / Q</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {analysisData.location.split(',')[0]}
              </span>
            </div>

            {/* Percentage Change */}
            <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                {analysisData.days}-Day Net Change
              </span>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: analysisData.percentage_change > 0 ? 'var(--primary-700)' : analysisData.percentage_change < 0 ? 'var(--status-danger)' : 'var(--accent-amber)',
                fontFamily: 'var(--font-heading)'
              }}>
                {formatPercent(analysisData.percentage_change)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Trend: {analysisData.trend}
              </span>
            </div>

            {/* Recent High */}
            <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Period High
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)', fontFamily: 'var(--font-heading)' }}>
                {formatCurrency(analysisData.high_price)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Peak realization
              </span>
            </div>

            {/* Recent Low */}
            <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Period Low
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)', fontFamily: 'var(--font-heading)' }}>
                {formatCurrency(analysisData.low_price)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Lowest floor price
              </span>
            </div>

            {/* Average Price */}
            <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Average Rate
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)', fontFamily: 'var(--font-heading)' }}>
                {formatCurrency(analysisData.average_price)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Period median
              </span>
            </div>

            {/* Estimated Price Range */}
            <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', background: '#f0fdf4', border: '1px solid var(--border-green)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--primary-800)', textTransform: 'uppercase', fontWeight: 700 }}>
                Estimated Price Range
              </span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-800)', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>
                ₹{analysisData.estimated_min} – ₹{analysisData.estimated_max}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-900)' }}>
                Short-term range
              </span>
            </div>
          </div>

          {/* Decision Engine Recommendation Card */}
          <div style={{
            background: isSell ? '#fef2f2' : isWait ? '#f0fdf4' : '#fffbeb',
            border: `2px solid ${isSell ? '#dc2626' : isWait ? '#2e7d32' : '#f59e0b'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: isSell ? '#fee2e2' : isWait ? '#dcfce7' : '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isSell ? '#dc2626' : isWait ? '#2e7d32' : '#d97706',
                flexShrink: 0
              }}>
                {isSell ? <TrendingDown size={32} /> : <TrendingUp size={32} />}
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: isSell ? '#991b1b' : isWait ? '#14532d' : '#92400e' }}>
                  Selling Decision Recommendation for {analysisData.crop}:
                </div>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: isSell ? '#991b1b' : isWait ? '#15803d' : '#b45309', fontFamily: 'var(--font-heading)' }}>
                  {analysisData.recommendation}
                </h2>
                <p style={{ fontSize: '0.94rem', color: isSell ? '#7f1d1d' : isWait ? '#14532d' : '#78350f', maxWidth: '650px', lineHeight: '1.5', marginTop: '0.25rem' }}>
                  "{analysisData.explanation}"
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`badge-pill ${isSell ? 'badge-red' : isWait ? 'badge-emerald' : 'badge-amber'}`} style={{ padding: '0.5rem 1.25rem', fontSize: '0.88rem', fontWeight: 700 }}>
                {analysisData.trend} Market Signal
              </span>
            </div>
          </div>

          {/* Dynamic Price Trend Chart */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={18} style={{ color: 'var(--primary-700)' }} />
                  Historical Spot Price Curve: {analysisData.crop} ({analysisData.days} Days)
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                  Market Location: {analysisData.location} | Source: {analysisData.data_source}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[7, 15, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: selectedDays === d ? 'var(--primary-700)' : '#f3f4f6',
                      color: selectedDays === d ? '#ffffff' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)'
                    }}
                    onClick={() => {
                      setSelectedDays(d);
                      runMarketAnalysis(selectedCrop, selectedLocation, d);
                    }}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>

            {/* Render SVG Line Chart */}
            {renderChart()}
          </div>

          {/* Mandi Arbitrage Logistics & Profit Calculator */}
          <div className="glass-card" style={{ background: '#ffffff', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-700)' }}>
                <Calculator size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--text-heading)' }}>
                  Mandi Price Comparison & Logistics Net Margin
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Calculate net earnings after deducting round-trip truck transport costs to decide WHERE to sell.
                </p>
              </div>
            </div>

            {/* Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Quantity to Sell (Quintals)</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  className="form-control"
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(Number(e.target.value))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Transport Rate (₹ / km roundtrip)</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  className="form-control"
                  value={calcTransportRate}
                  onChange={(e) => setCalcTransportRate(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Arbitrage Comparison Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#f8faf7', color: 'var(--text-dim)' }}>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Mandi Destination</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Distance</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Gross Modal Rate</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Logistics Deduction</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Net Revenue</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Effective Rate</th>
                    <th style={{ padding: '0.75rem 0.75rem' }}>Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {arbitrageResults.map((res, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', background: idx % 2 === 0 ? '#ffffff' : '#fafbfa' }}>
                      <td style={{ padding: '0.75rem 0.75rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                        {res.mandi_name}
                      </td>
                      <td style={{ padding: '0.75rem 0.75rem', color: 'var(--text-muted)' }}>
                        {res.distance_km} km
                      </td>
                      <td style={{ padding: '0.75rem 0.75rem', color: 'var(--text-main)' }}>
                        {formatCurrency(res.modal_price)} / Q
                      </td>
                      <td style={{ padding: '0.75rem 0.75rem', color: 'var(--status-danger)' }}>
                        -{formatCurrency(res.estimated_transport)}
                      </td>
                      <td style={{ padding: '0.75rem 0.75rem', fontWeight: 800, color: 'var(--primary-700)', fontSize: '0.98rem' }}>
                        {formatCurrency(res.net_revenue)}
                      </td>
                      <td style={{ padding: '0.75rem 0.75rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                        {formatCurrency(res.net_effective_price)} / Q
                      </td>
                      <td style={{ padding: '0.75rem 0.75rem' }}>
                        <span className={`badge-pill ${idx === 0 ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
                          {res.recommendation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mandatory Disclaimers Box */}
          <div style={{
            background: '#f8faf7',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem 1.25rem',
            fontSize: '0.82rem',
            color: 'var(--text-dim)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <ShieldAlert size={15} style={{ color: 'var(--accent-gold)' }} />
              Mandatory Market Intelligence Disclaimers:
            </div>
            <div>• <strong>Estimated trend based on historical data — not a guaranteed future price.</strong></div>
            <div>• <strong>Prototype demonstration using sample market data.</strong> Actual mandi transaction prices vary based on crop grade, moisture percentage, and daily auction bids.</div>
          </div>

        </div>
      )}

    </div>
  );
};

export default MarketIntelligencePage;
