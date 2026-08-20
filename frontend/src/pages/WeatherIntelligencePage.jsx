import React, { useState, useEffect } from 'react';
import { 
  CloudSunRain, 
  Droplets, 
  AlertTriangle, 
  Calendar, 
  Compass, 
  Info,
  ShieldAlert
} from 'lucide-react';
import { weatherService } from '../services/weatherService';
import { useGeolocation } from '../hooks/useGeolocation';
import StatBadge from '../components/StatBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';

const CROP_LIST = ['Tomato', 'Wheat', 'Rice (Paddy)', 'Potato', 'Cotton'];
const HUBS = [
  { id: 'Pune', name: 'Pune (Maharashtra Agri Hub)' },
  { id: 'Nashik', name: 'Nashik (Grape & Onion Belt)' },
  { id: 'Nagpur', name: 'Nagpur (Citrus & Cotton Belt)' },
  { id: 'Latur', name: 'Latur (Soybean & Pulses)' },
  { id: 'Karnal', name: 'Karnal (Wheat & Basmati Hub)' },
  { id: 'Agra', name: 'Agra (Potato Belt)' }
];

const WeatherIntelligencePage = () => {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedHub, setSelectedHub] = useState('Pune');
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const geo = useGeolocation();

  const fetchWeather = async (city, crop, lat = null, lon = null) => {
    setLoading(true);
    try {
      const data = await weatherService.getWeatherRisk(city, crop, lat, lon);
      setWeatherData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedHub, selectedCrop);
  }, [selectedHub, selectedCrop]);

  const handleUseGPS = () => {
    if (geo.latitude && geo.longitude) {
      fetchWeather('My GPS Farm', selectedCrop, geo.latitude, geo.longitude);
    } else {
      geo.refresh();
      if (geo.latitude && geo.longitude) {
        fetchWeather('My GPS Farm', selectedCrop, geo.latitude, geo.longitude);
      }
    }
  };

  return (
    <div className="page-wrapper container">
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span className="badge-pill badge-emerald">
            <CloudSunRain size={14} /> Service 2 of 4
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Agro-Meteorological Risk Analysis</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>Crop-Specific Weather Risk Alerts</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '680px' }}>
          Hyperlocal weather data mapped against crop-specific physiological thresholds. Receive foliar spray suitability advice, fungal disease outbreak predictions, and frost/heat warning alerts.
        </p>
      </div>

      {/* Control Filters Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Agricultural Region / Hub</label>
            <select 
              className="form-control" 
              value={selectedHub} 
              onChange={(e) => setSelectedHub(e.target.value)}
            >
              {HUBS.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Target Crop</label>
            <select 
              className="form-control" 
              value={selectedCrop} 
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              {CROP_LIST.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              onClick={handleUseGPS}
            >
              <Compass size={16} style={{ color: 'var(--primary-700)' }} />
              <span>Use Current GPS Location</span>
            </button>
          </div>
        </div>
      </div>

      {loading && <LoadingSkeleton text="Evaluating agro-meteorological vulnerability index..." />}

      {!loading && weatherData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Top Metric Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem'
          }}>
            <StatBadge 
              label="Ambient Temperature" 
              value={`${weatherData.current_weather.temperature}°C`} 
              unit={`Opt: ${weatherData.agro_risk.optimal_temp_range}`}
              trend="Current Condition"
            />
            <StatBadge 
              label="Relative Humidity" 
              value={`${weatherData.current_weather.humidity}%`} 
              unit={`Opt: ${weatherData.agro_risk.optimal_humidity_range}`}
              trend="Fungal Index"
              status={weatherData.current_weather.humidity > 75 ? 'warning' : 'default'}
            />
            <StatBadge 
              label="Wind Speed (Spray Drift)" 
              value={`${weatherData.current_weather.wind_speed}`} 
              unit="km/h"
              trend={weatherData.current_weather.wind_speed > 15 ? 'High Drift Risk' : 'Calm / Safe'}
              status={weatherData.current_weather.wind_speed > 15 ? 'warning' : 'default'}
            />
            <StatBadge 
              label="Crop Vulnerability Index" 
              value={`${weatherData.agro_risk.risk_score}/100`} 
              unit={weatherData.agro_risk.overall_level}
              trend={`${weatherData.crop} Health`}
              status={weatherData.agro_risk.overall_level === 'High' ? 'danger' : 'default'}
            />
          </div>

          {/* Spray Window Advisory & Active Alerts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            
            {/* Spray Window Banner */}
            <div className="glass-card" style={{ border: '1px solid #bae6fd', background: '#f0f9ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Droplets size={18} style={{ color: '#0284c7' }} />
                  Foliar Spray & Fertilizer Suitability
                </h3>
                <span className={`badge-pill ${
                  weatherData.agro_risk.spray_advisory.status === 'Optimal' 
                    ? 'badge-emerald' 
                    : weatherData.agro_risk.spray_advisory.status === 'Caution' 
                    ? 'badge-amber' 
                    : 'badge-red'
                }`}>
                  {weatherData.agro_risk.spray_advisory.status} Window
                </span>
              </div>
              <p style={{ color: '#0c4a6e', fontSize: '0.92rem', lineHeight: '1.6' }}>
                {weatherData.agro_risk.spray_advisory.advice}
              </p>
            </div>

            {/* Active Alerts */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <AlertTriangle size={18} style={{ color: 'var(--accent-gold)' }} />
                Crop Physiological Warnings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {weatherData.agro_risk.active_alerts.map((al, idx) => (
                  <div key={idx} style={{
                    background: al.severity === 'High' ? '#fef2f2' : al.severity === 'Moderate' ? '#fffbeb' : '#f0fdf4',
                    border: `1px solid ${al.severity === 'High' ? '#fecaca' : al.severity === 'Moderate' ? '#fde68a' : '#bbf7d0'}`,
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <strong style={{ color: al.severity === 'High' ? '#991b1b' : al.severity === 'Moderate' ? '#92400e' : '#166534', fontSize: '0.88rem' }}>{al.type}</strong>
                      <span className={`badge-pill ${al.severity === 'High' ? 'badge-red' : al.severity === 'Moderate' ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.7rem' }}>
                        {al.severity} Severity
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{al.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7-Day Spray Window Forecast Table */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-heading)' }}>
              <Calendar size={18} style={{ color: 'var(--primary-700)' }} />
              7-Day Micro-Agro Forecast & Spray Windows ({weatherData.crop} at {weatherData.location})
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#f8faf7', color: 'var(--text-dim)' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Day</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Temp (Max / Min)</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Humidity</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Wind Speed</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Spray Window</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Crop Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {weatherData.forecast.map((day, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', background: idx % 2 === 0 ? '#ffffff' : '#fafbfa' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                        {day.day}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-main)' }}>
                        {day.temp_max.toFixed(1)}°C / {day.temp_min.toFixed(1)}°C
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-main)' }}>
                        {day.humidity}%
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-main)' }}>
                        {day.wind} km/h
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className={`badge-pill ${
                          day.spray_window === 'Optimal' 
                            ? 'badge-emerald' 
                            : day.spray_window === 'Caution' 
                            ? 'badge-amber' 
                            : 'badge-red'
                        }`}>
                          {day.spray_window}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className={`badge-pill ${
                          day.risk === 'High' 
                            ? 'badge-red' 
                            : day.risk === 'Moderate' 
                            ? 'badge-amber' 
                            : 'badge-emerald'
                        }`}>
                          {day.risk} Risk
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default WeatherIntelligencePage;
