import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Search, 
  Calculator
} from 'lucide-react';
import { marketService } from '../services/marketService';
import { formatCurrency, formatPercent } from '../utils/formatters';
import StatBadge from '../components/StatBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';

const COMMODITIES = ['All', 'Wheat', 'Soybean', 'Tomato', 'Onion', 'Cotton', 'Rice (Paddy)', 'Potato'];

const MarketIntelligencePage = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommodity, setSelectedCommodity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected commodity for trend graph
  const [activeItem, setActiveItem] = useState(null);

  // Arbitrage Calculator State
  const [calcCommodity, setCalcCommodity] = useState('Wheat');
  const [quantityQuintals, setQuantityQuintals] = useState(50);
  const [transportRatePerKm, setTransportRatePerKm] = useState(15);
  const [arbitrageResults, setArbitrageResults] = useState([]);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCommodity !== 'All') params.commodity = selectedCommodity;
      if (searchQuery) params.search = searchQuery;

      const data = await marketService.getPrices(params);
      setPrices(data);
      if (data.length > 0 && !activeItem) {
        setActiveItem(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArbitrage = async () => {
    try {
      const data = await marketService.getArbitrage(calcCommodity, quantityQuintals, transportRatePerKm);
      setArbitrageResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedCommodity, searchQuery]);

  useEffect(() => {
    fetchArbitrage();
  }, [calcCommodity, quantityQuintals, transportRatePerKm]);

  return (
    <div className="page-wrapper container">
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span className="badge-pill badge-emerald">
            <TrendingUp size={14} /> Service 4 of 4
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>APMC Mandi Intelligence & Arbitrage</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>Market Intelligence & Price Forecasts</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '680px' }}>
          Historical APMC mandi price trends, 7-day predictive forecasts, and logistics arbitrage calculators to help farmers determine the best date and market to sell their harvest.
        </p>
      </div>

      {/* Ticker Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <StatBadge 
          label="Top Gainer (Onion)" 
          value="+6.3%" 
          unit="Lasalgaon" 
          trend="Strong Demand"
          status="warning"
        />
        <StatBadge 
          label="Wheat Benchmark" 
          value="₹2,720" 
          unit="₹/Quintal" 
          trend="Bullish (+1.5%)"
          status="default"
        />
        <StatBadge 
          label="Tomato Spot" 
          value="₹2,150" 
          unit="₹/Quintal" 
          trend="Surplus Inflow (-5.7%)"
          status="danger"
        />
        <StatBadge 
          label="Active APMC Feeds" 
          value="8 Mandis" 
          unit="Real-time" 
          trend="Verified Sync"
          status="info"
        />
      </div>

      {/* Main Grid: Interactive Table & 7-Day Trend Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem', alignItems: 'start' }}>
        
        {/* Left: Mandi Price Table */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)' }}>Mandi Commodity Spot Prices</h3>
            
            {/* Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select
                className="form-control"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'auto' }}
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
              >
                {COMMODITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton text="Fetching APMC live prices..." />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#f8faf7', color: 'var(--text-dim)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Commodity</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Mandi</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Modal Price</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Trend</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((item) => (
                    <tr 
                      key={item.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-subtle)',
                        background: activeItem?.id === item.id ? '#f0fdf4' : 'transparent',
                        cursor: 'pointer'
                      }}
                      onClick={() => setActiveItem(item)}
                    >
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                        <div>{item.commodity}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{item.variety}</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>
                        {item.mandi_name.split(' ')[0]}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                        {formatCurrency(item.modal_price)}
                        <div style={{ fontSize: '0.75rem', color: item.price_change_pct >= 0 ? 'var(--primary-700)' : 'var(--status-danger)' }}>
                          {formatPercent(item.price_change_pct)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className={`badge-pill ${item.price_trend === 'Bullish' ? 'badge-emerald' : item.price_trend === 'Bearish' ? 'badge-red' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
                          {item.price_trend === 'Bullish' ? '▲' : item.price_trend === 'Bearish' ? '▼' : '●'} {item.price_trend}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => setActiveItem(item)}
                        >
                          View Trend
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Selected Commodity 7-Day Trend Chart & Forecast */}
        {activeItem && (
          <div className="glass-card" style={{ border: '1px solid var(--primary-200)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge-pill badge-emerald" style={{ marginBottom: '0.35rem' }}>
                  {activeItem.commodity} — {activeItem.variety}
                </span>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-heading)' }}>
                  {activeItem.mandi_name}
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                  {activeItem.district}, {activeItem.state}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-heading)' }}>
                  {formatCurrency(activeItem.modal_price)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Current Modal Rate</div>
              </div>
            </div>

            {/* Custom SVG Price Trend Line Chart */}
            <div style={{ background: '#f8faf7', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                <span>7-Day APMC Spot Price Curve</span>
                <span style={{ color: 'var(--primary-700)', fontWeight: 600 }}>Forecast Next Week: {formatCurrency(activeItem.forecast_next_week)}/Q</span>
              </div>

              {/* Render Trend Graphic */}
              <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '0.75rem', padding: '10px 0' }}>
                {activeItem.history_7d?.map((price, idx) => {
                  const minP = Math.min(...activeItem.history_7d);
                  const maxP = Math.max(...activeItem.history_7d, activeItem.forecast_next_week);
                  const range = maxP - minP || 100;
                  const heightPercent = Math.max(25, Math.min(95, ((price - minP) / range) * 70 + 25));

                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>₹{price}</span>
                      <div style={{
                        width: '100%',
                        height: `${heightPercent}%`,
                        background: idx === 6 ? 'linear-gradient(180deg, #f59e0b, #d97706)' : 'linear-gradient(180deg, var(--primary-500), var(--primary-700))',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease'
                      }} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>D{idx + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Market Advisory */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Market Demand Sentiment:</span>
                <strong style={{ color: 'var(--text-heading)' }}>{activeItem.demand_index}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Predicted Trend Signal:</span>
                <span className={`badge-pill ${activeItem.price_trend === 'Bullish' ? 'badge-emerald' : activeItem.price_trend === 'Bearish' ? 'badge-red' : 'badge-amber'}`}>
                  {activeItem.price_trend} Forecast
                </span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Mandi Arbitrage & Net Profit Margin Calculator */}
      <div className="glass-card" style={{ background: '#ffffff', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-700)' }}>
            <Calculator size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--text-heading)' }}>Mandi Arbitrage & Net Margin Calculator</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Calculate net profit after deducting round-trip truck logistics to find the most profitable market.
            </p>
          </div>
        </div>

        {/* Calculator Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Commodity</label>
            <select
              className="form-control"
              value={calcCommodity}
              onChange={(e) => setCalcCommodity(e.target.value)}
            >
              {['Wheat', 'Soybean', 'Tomato', 'Onion', 'Cotton', 'Rice (Paddy)', 'Potato'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Quantity (Quintals)</label>
            <input
              type="number"
              min="1"
              max="1000"
              className="form-control"
              value={quantityQuintals}
              onChange={(e) => setQuantityQuintals(Number(e.target.value))}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Transport Rate (₹ / km)</label>
            <input
              type="number"
              min="5"
              max="50"
              className="form-control"
              value={transportRatePerKm}
              onChange={(e) => setTransportRatePerKm(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Arbitrage Results Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#f8faf7', color: 'var(--text-dim)' }}>
                <th style={{ padding: '0.75rem 0.75rem' }}>Mandi Destination</th>
                <th style={{ padding: '0.75rem 0.75rem' }}>Distance</th>
                <th style={{ padding: '0.75rem 0.75rem' }}>Gross Mandi Rate</th>
                <th style={{ padding: '0.75rem 0.75rem' }}>Logistics Cost</th>
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

    </div>
  );
};

export default MarketIntelligencePage;
