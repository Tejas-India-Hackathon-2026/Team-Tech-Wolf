import React, { useState, useEffect } from 'react';
import { 
  CloudSunRain, 
  Droplets, 
  AlertTriangle, 
  Calendar, 
  Compass, 
  Search, 
  MapPin, 
  Wind, 
  Thermometer, 
  CloudRain, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Info, 
  History, 
  Clock, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { weatherService } from '../services/weatherService';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import LoadingSkeleton from '../components/LoadingSkeleton';

const PRESET_LOCATIONS = [
  { id: 'Patna, Bihar', name: 'Patna, Bihar (Gangetic Plains)' },
  { id: 'Pune, Maharashtra', name: 'Pune, Maharashtra (Western Agri Hub)' },
  { id: 'Nashik, Maharashtra', name: 'Nashik, Maharashtra (Grape & Onion Belt)' },
  { id: 'Nagpur, Maharashtra', name: 'Nagpur, Maharashtra (Citrus & Cotton)' },
  { id: 'Latur, Maharashtra', name: 'Latur, Maharashtra (Soybean & Pulses)' },
  { id: 'Karnal, Haryana', name: 'Karnal, Haryana (Wheat & Basmati Belt)' },
  { id: 'Ludhiana, Punjab', name: 'Ludhiana, Punjab (Wheat & Paddy Bowl)' },
  { id: 'Agra, Uttar Pradesh', name: 'Agra, Uttar Pradesh (Potato Belt)' },
  { id: 'Varanasi, Uttar Pradesh', name: 'Varanasi, Uttar Pradesh (Vegetable Hub)' },
  { id: 'Jaipur, Rajasthan', name: 'Jaipur, Rajasthan (Mustard & Pulses)' },
  { id: 'Indore, Madhya Pradesh', name: 'Indore, Madhya Pradesh (Soybean & Wheat)' },
  { id: 'Bengaluru, Karnataka', name: 'Bengaluru, Karnataka (Horticulture Hub)' },
  { id: 'Hyderabad, Telangana', name: 'Hyderabad, Telangana (Cotton & Chilly)' }
];

const CROPS = ['Tomato', 'Potato', 'Rice', 'Wheat', 'Cotton', 'Corn', 'Sugarcane'];

const WeatherIntelligencePage = () => {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState('Patna, Bihar');
  const [customCity, setCustomCity] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const geo = useGeolocation();

  const handleFetchRisk = async (locationOverride = null, cropOverride = null, lat = null, lon = null) => {
    const targetLoc = locationOverride || customCity.trim() || selectedLocation;
    const targetCrop = cropOverride || selectedCrop;

    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await weatherService.getWeatherRisk(targetLoc, targetCrop, lat, lon);
      setWeatherData(data);

      // Notify logged in user if risk is high/critical (with automatic deduplication)
      if (user && user.id && (data?.risk_level === 'HIGH' || data?.risk_level === 'CRITICAL')) {
        try {
          notificationService.notifyWeatherRisk(
            user.id,
            targetCrop,
            targetLoc,
            data.risk_level,
            data.recommendation || `High humidity and rainfall may increase fungal disease risk for ${targetCrop}.`
          );
        } catch (notifErr) {
          console.warn('[WeatherIntelligence] Notification notice:', notifErr);
        }
      }

      // Refresh history list
      weatherService.getHistory().then((hist) => {
        if (Array.isArray(hist)) setHistoryList(hist);
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch weather risk evaluation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchRisk('Patna, Bihar', 'Tomato');
    weatherService.getHistory().then((hist) => {
      if (Array.isArray(hist)) setHistoryList(hist);
    });
  }, []);

  const handleUseGPS = () => {
    if (geo.latitude && geo.longitude) {
      handleFetchRisk(`GPS Farm (${geo.latitude.toFixed(2)}, ${geo.longitude.toFixed(2)})`, selectedCrop, geo.latitude, geo.longitude);
    } else {
      geo.refresh();
      if (geo.latitude && geo.longitude) {
        handleFetchRisk(`GPS Farm (${geo.latitude.toFixed(2)}, ${geo.longitude.toFixed(2)})`, selectedCrop, geo.latitude, geo.longitude);
      }
    }
  };

  // Determine Risk Badge Classes & Palette
  const riskLevel = weatherData?.risk_level?.toUpperCase() || 'LOW';
  const isHighRisk = riskLevel === 'HIGH';
  const isModRisk = riskLevel === 'MODERATE';

  return (
    <div className="page-wrapper container">
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge-pill badge-emerald">
              <CloudSunRain size={14} /> Service 2 of 4
            </span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Crop-Specific Meteorological Rules Engine</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
            onClick={() => setShowHistory(!showHistory)}
          >
            <History size={14} style={{ color: 'var(--primary-700)' }} />
            <span>{showHistory ? 'Hide Assessment Log' : `Weather Checks Log (${historyList.length})`}</span>
          </button>
        </div>

        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>
          Crop-Specific Weather Risk Alerts
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '720px' }}>
          Weather data tells the farmer what is happening; AGRO-SMART tells the farmer what it means for the crop. Get customized disease hazard predictions, spray windows, and immediate agronomic recommendations.
        </p>
      </div>

      {/* Workflow Process Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.75rem',
        marginBottom: '2rem',
        background: '#ffffff',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-700)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)' }}>Select Location</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-700)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)' }}>Fetch Live Weather</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-700)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)' }}>Apply Crop Rules</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-700)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)' }}>Generate Alert & Action</span>
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

      {/* History Log Drawer */}
      {showHistory && (
        <div className="glass-card" style={{ marginBottom: '2rem', background: '#f8faf7', border: '1px solid var(--border-green)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} style={{ color: 'var(--primary-700)' }} />
              Recent Weather Risk Checks (Supabase Log)
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Showing last {historyList.length} assessments</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
            {historyList.map((item, idx) => (
              <div 
                key={item.id || idx}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                  <span className="badge-pill badge-emerald" style={{ fontSize: '0.7rem' }}>{item.crop || item.crop_name}</span>
                  <span className={`badge-pill ${item.risk_level === 'HIGH' ? 'badge-red' : item.risk_level === 'MODERATE' ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.7rem' }}>
                    {item.risk_level} RISK
                  </span>
                </div>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-heading)', display: 'block', marginBottom: '0.2rem' }}>
                  {item.location}
                </strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  {item.temperature}°C • {item.humidity}% RH • {item.rain_chance}% Rain
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Input Card */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
          
          {/* 1. Location Selector */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">1. Select State & City Hub</label>
            <select 
              className="form-control" 
              value={selectedLocation} 
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setCustomCity('');
              }}
            >
              {PRESET_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          {/* 2. Custom City Search */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Or Type Custom City / District</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="e.g. Muzaffarpur, Gaya, Kolhapur..."
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
              />
            </div>
          </div>

          {/* 3. Crop Selector */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">2. Select Target Crop</label>
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

          {/* 4. Action Buttons */}
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ flex: 1, padding: '0.8rem 1rem' }}
              onClick={() => handleFetchRisk()}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-pulse" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Check Crop Risk</span>
                </>
              )}
            </button>

            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleUseGPS}
              title="Use GPS Coordinates"
              style={{ padding: '0.8rem' }}
            >
              <Compass size={18} style={{ color: 'var(--primary-700)' }} />
            </button>
          </div>

        </div>
      </div>

      {loading && <LoadingSkeleton text={`Applying crop rules for ${selectedCrop} at ${customCity || selectedLocation}...`} />}

      {/* Main Results Display */}
      {!loading && weatherData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Top Weather Summary Cards */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} style={{ color: 'var(--primary-700)' }} />
                Real-Time Weather: {weatherData.location}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Target Crop: <strong style={{ color: 'var(--text-heading)' }}>{weatherData.crop}</strong> • Condition: <strong style={{ color: 'var(--primary-700)' }}>{weatherData.weather_condition}</strong>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem'
            }}>
              {/* Temperature Card */}
              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Thermometer size={14} style={{ color: 'var(--accent-amber)' }} /> Temperature
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)', fontFamily: 'var(--font-heading)' }}>
                  {weatherData.temperature}°C
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Ambient field reading
                </span>
              </div>

              {/* Humidity Card */}
              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Droplets size={14} style={{ color: '#0284c7' }} /> Humidity
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)', fontFamily: 'var(--font-heading)' }}>
                  {weatherData.humidity}%
                </div>
                <span style={{ fontSize: '0.78rem', color: weatherData.humidity > 75 ? '#b45309' : 'var(--text-dim)' }}>
                  {weatherData.humidity > 75 ? '⚠️ Fungal incubation zone' : 'Normal range'}
                </span>
              </div>

              {/* Rain Chance Card */}
              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CloudRain size={14} style={{ color: '#0284c7' }} /> Rain Probability
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)', fontFamily: 'var(--font-heading)' }}>
                  {weatherData.rain_chance}%
                </div>
                <span style={{ fontSize: '0.78rem', color: weatherData.rain_chance > 50 ? '#b45309' : 'var(--text-dim)' }}>
                  {weatherData.rain_chance > 50 ? 'Precipitation expected' : 'Low rain chance'}
                </span>
              </div>

              {/* Wind Speed Card */}
              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Wind size={14} style={{ color: 'var(--primary-700)' }} /> Wind Speed
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)', fontFamily: 'var(--font-heading)' }}>
                  {weatherData.wind_speed} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>km/h</span>
                </div>
                <span style={{ fontSize: '0.78rem', color: weatherData.wind_speed > 16 ? '#dc2626' : 'var(--text-dim)' }}>
                  {weatherData.wind_speed > 16 ? 'High spray drift' : 'Calm drift window'}
                </span>
              </div>
            </div>
          </div>

          {/* Prominent Risk Level Alert Banner */}
          <div style={{
            background: isHighRisk ? '#fef2f2' : isModRisk ? '#fffbeb' : '#f0fdf4',
            border: `2px solid ${isHighRisk ? '#dc2626' : isModRisk ? '#f59e0b' : '#16a34a'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            boxShadow: isHighRisk ? '0 4px 18px rgba(220, 38, 38, 0.15)' : 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: isHighRisk ? '#fee2e2' : isModRisk ? '#fef3c7' : '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isHighRisk ? '#dc2626' : isModRisk ? '#d97706' : '#16a34a',
                flexShrink: 0
              }}>
                <AlertTriangle size={32} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: isHighRisk ? '#991b1b' : isModRisk ? '#92400e' : '#14532d' }}>
                  Crop Risk Evaluation for {weatherData.crop}:
                </div>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: isHighRisk ? '#991b1b' : isModRisk ? '#b45309' : '#15803d', fontFamily: 'var(--font-heading)' }}>
                  {riskLevel} RISK
                </h2>
                <div style={{ fontSize: '0.88rem', color: isHighRisk ? '#7f1d1d' : isModRisk ? '#78350f' : '#166534' }}>
                  Location: <strong>{weatherData.location}</strong> | Temp: <strong>{weatherData.temperature}°C</strong> | Humidity: <strong>{weatherData.humidity}%</strong> | Rain: <strong>{weatherData.rain_chance}%</strong>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`badge-pill ${isHighRisk ? 'badge-red' : isModRisk ? 'badge-amber' : 'badge-emerald'}`} style={{ padding: '0.5rem 1.25rem', fontSize: '0.88rem', fontWeight: 700 }}>
                {riskLevel} RISK LEVEL
              </span>
            </div>
          </div>

          {/* Concern Card vs Recommended Action Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            
            {/* 1. Concern Card */}
            <div className="glass-card" style={{
              background: '#ffffff',
              border: `1px solid ${isHighRisk ? '#fecaca' : isModRisk ? '#fde68a' : 'var(--border-subtle)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: isHighRisk ? '#fee2e2' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isHighRisk ? '#dc2626' : '#d97706' }}>
                  <ShieldAlert size={20} />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)' }}>
                  Agronomic Concern
                </h3>
              </div>

              <div style={{ background: '#f8faf7', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.96rem', color: 'var(--text-heading)', lineHeight: '1.6', fontWeight: 500 }}>
                  "{weatherData.concern}"
                </p>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Info size={14} /> Rule applied: Evaluated {weatherData.crop} biological vulnerability against {weatherData.temperature}°C & {weatherData.humidity}% humidity.
              </div>
            </div>

            {/* 2. Action Card */}
            <div className="glass-card" style={{
              background: '#ffffff',
              border: '1px solid var(--border-green)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-700)' }}>
                  <CheckCircle2 size={20} />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)' }}>
                  Recommended Action
                </h3>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid var(--border-green)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.96rem', color: 'var(--primary-900)', lineHeight: '1.6', fontWeight: 600 }}>
                  {weatherData.action || weatherData.recommendation}
                </p>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} style={{ color: 'var(--primary-700)' }} /> Action prioritized to safeguard crop yield and prevent chemical spray wastage.
              </div>
            </div>

          </div>

          {/* Foliar Spray Window Advisory */}
          {weatherData.spray_advisory && (
            <div className="glass-card" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Droplets size={20} style={{ color: '#0284c7' }} />
                  <h4 style={{ fontSize: '1.15rem', color: '#0369a1' }}>
                    Foliar Spray Suitability Window
                  </h4>
                </div>
                <span className={`badge-pill ${
                  weatherData.spray_advisory.status === 'Optimal' 
                    ? 'badge-emerald' 
                    : weatherData.spray_advisory.status === 'Caution' 
                    ? 'badge-amber' 
                    : 'badge-red'
                }`} style={{ fontWeight: 700 }}>
                  {weatherData.spray_advisory.status} Window
                </span>
              </div>
              <p style={{ color: '#0c4a6e', fontSize: '0.92rem', lineHeight: '1.5' }}>
                {weatherData.spray_advisory.advice}
              </p>
            </div>
          )}

          {/* 7-Day Micro-Agro Forecast Table */}
          {weatherData.forecast && weatherData.forecast.length > 0 && (
            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-heading)' }}>
                <Calendar size={18} style={{ color: 'var(--primary-700)' }} />
                7-Day Agro Forecast ({weatherData.crop} at {weatherData.location})
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#f8faf7', color: 'var(--text-dim)' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Day</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Temp (Max / Min)</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Humidity</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Rain Chance</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Spray Window</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Projected Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weatherData.forecast.map((day, idx) => {
                      const dayRain = day.rain_chance || 20;
                      const daySpray = dayRain > 50 ? 'Avoid' : dayRain > 35 ? 'Caution' : 'Optimal';
                      const dayRisk = (day.humidity > 75 && dayRain > 40) ? 'HIGH' : (day.humidity > 65 || dayRain > 30) ? 'MODERATE' : 'LOW';

                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', background: idx % 2 === 0 ? '#ffffff' : '#fafbfa' }}>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                            {day.day}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-main)' }}>
                            {day.temp_max}°C / {day.temp_min}°C
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-main)' }}>
                            {day.humidity}%
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-main)' }}>
                            {dayRain}%
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span className={`badge-pill ${
                              daySpray === 'Optimal' ? 'badge-emerald' : daySpray === 'Caution' ? 'badge-amber' : 'badge-red'
                            }`}>
                              {daySpray}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span className={`badge-pill ${
                              dayRisk === 'HIGH' ? 'badge-red' : dayRisk === 'MODERATE' ? 'badge-amber' : 'badge-emerald'
                            }`}>
                              {dayRisk} Risk
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default WeatherIntelligencePage;
