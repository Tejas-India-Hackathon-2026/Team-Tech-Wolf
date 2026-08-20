import { request } from './api';

export const marketService = {
  /**
   * Primary endpoint for comprehensive market trend and decision analysis:
   * GET /api/market/analysis?crop=...&location=...&days=...
   */
  async getAnalysis(crop = 'Tomato', location = 'Patna Mandi, Bihar', days = 30) {
    try {
      return await request(`/market/analysis?crop=${encodeURIComponent(crop)}&location=${encodeURIComponent(location)}&days=${days}`);
    } catch (err) {
      console.warn('[MarketService] Backend /market/analysis fallback:', err.message);
      return getClientFallbackMarketAnalysis(crop, location, days);
    }
  },

  /**
   * Compare prices across mandis: GET /api/market/prices
   */
  async getPrices(params = {}) {
    const query = new URLSearchParams(params).toString();
    try {
      return await request(`/market/prices?${query}`);
    } catch {
      return [
        {
          id: 'mkt-patna',
          commodity: params.crop || 'Tomato',
          mandi_name: 'Patna Mandi',
          location: 'Patna, Bihar',
          state: 'Bihar',
          modal_price: 2200,
          percentage_change: 7.84,
          trend: 'Rising',
          recommendation: 'MONITOR / WAIT',
          high_price: 2240,
          low_price: 2020,
          estimated_range: '₹2,300 – ₹2,500'
        },
        {
          id: 'mkt-pune',
          commodity: params.crop || 'Tomato',
          mandi_name: 'Pune Mandi (Gultekdi)',
          location: 'Pune, Maharashtra',
          state: 'Maharashtra',
          modal_price: 2150,
          percentage_change: -5.70,
          trend: 'Falling',
          recommendation: 'SELL',
          high_price: 2350,
          low_price: 2100,
          estimated_range: '₹1,950 – ₹2,100'
        },
        {
          id: 'mkt-nashik',
          commodity: params.crop || 'Tomato',
          mandi_name: 'Nashik APMC',
          location: 'Nashik, Maharashtra',
          state: 'Maharashtra',
          modal_price: 2240,
          percentage_change: 3.20,
          trend: 'Rising',
          recommendation: 'MONITOR / WAIT',
          high_price: 2280,
          low_price: 2150,
          estimated_range: '₹2,300 – ₹2,450'
        }
      ];
    }
  },

  /**
   * Calculate logistics arbitrage: GET /api/market/arbitrage
   */
  async getArbitrage(commodity = 'Wheat', quantity = 50, transportRate = 15) {
    try {
      return await request(`/market/arbitrage?commodity=${encodeURIComponent(commodity)}&quantity_quintals=${quantity}&transport_cost_per_km=${transportRate}`);
    } catch {
      return [
        {
          mandi_name: 'Patna Mandi',
          location: 'Patna, Bihar',
          modal_price: 2640,
          distance_km: 12,
          gross_revenue: 2640 * quantity,
          estimated_transport: 12 * transportRate * 2,
          net_revenue: (2640 * quantity) - (12 * transportRate * 2),
          net_effective_price: 2632.8,
          recommendation: 'Highest Net Profit (Recommended)'
        },
        {
          mandi_name: 'Pune Mandi (Gultekdi)',
          location: 'Pune, Maharashtra',
          modal_price: 2720,
          distance_km: 45,
          gross_revenue: 2720 * quantity,
          estimated_transport: 45 * transportRate * 2,
          net_revenue: (2720 * quantity) - (45 * transportRate * 2),
          net_effective_price: 2693.0,
          recommendation: 'Alternative'
        }
      ];
    }
  },

  /**
   * List supported crops: GET /api/market/crops
   */
  async getCrops() {
    try {
      return await request('/market/crops');
    } catch {
      return ['Tomato', 'Potato', 'Onion', 'Wheat', 'Rice', 'Maize'];
    }
  },

  /**
   * List supported locations: GET /api/market/locations
   */
  async getLocations() {
    try {
      return await request('/market/locations');
    } catch {
      return [
        { id: 'patna', name: 'Patna Mandi', location: 'Patna, Bihar', state: 'Bihar' },
        { id: 'pune', name: 'Pune Mandi (Gultekdi)', location: 'Pune, Maharashtra', state: 'Maharashtra' },
        { id: 'nashik', name: 'Nashik APMC', location: 'Nashik, Maharashtra', state: 'Maharashtra' },
        { id: 'lasalgaon', name: 'Lasalgaon Mandi', location: 'Nashik, Maharashtra', state: 'Maharashtra' },
        { id: 'karnal', name: 'Karnal APMC', location: 'Karnal, Haryana', state: 'Haryana' },
        { id: 'agra', name: 'Agra APMC', location: 'Agra, Uttar Pradesh', state: 'Uttar Pradesh' },
        { id: 'latur', name: 'Latur APMC', location: 'Latur, Maharashtra', state: 'Maharashtra' }
      ];
    }
  }
};

/**
 * Structured Client-Side Fallback Generator
 */
function getClientFallbackMarketAnalysis(crop, location, days = 30) {
  const cropLower = (crop || 'Tomato').toLowerCase();
  const numDays = Number(days) || 30;

  let currentPrice = 2200;
  let pctChange = 7.84;
  let trend = 'Rising';
  let rec = 'MONITOR / WAIT';
  let explanation = 'Prices have risen 8% over the past 30 days due to steady retail demand. Consider monitoring closely or waiting to capture potential peak realization before dispatching full crop volume.';
  let estMin = 2300;
  let estMax = 2500;

  if (cropLower.includes('potato')) {
    currentPrice = 1420;
    pctChange = 1.43;
    trend = 'Stable';
    rec = 'MONITOR';
    explanation = 'Market is relatively stable with balanced cold-storage releases and steady consumption. Monitor daily arrivals.';
    estMin = 1380;
    estMax = 1460;
  } else if (cropLower.includes('onion')) {
    currentPrice = 2180;
    pctChange = 11.22;
    trend = 'Rising';
    rec = 'MONITOR / WAIT';
    explanation = 'Strong upward price pressure observed in major export and consumption clusters. Prices may test higher resistance levels.';
    estMin = 2250;
    estMax = 2450;
  } else if (cropLower.includes('maize')) {
    currentPrice = 2150;
    pctChange = -4.44;
    trend = 'Falling';
    rec = 'SELL';
    explanation = 'Prices appear to be declining over recent sessions due to peak seasonal harvest arrivals. Selling available stock promptly is recommended.';
    estMin = 1950;
    estMax = 2100;
  }

  // Generate date series
  const series = [];
  const today = new Date();
  const startPrice = currentPrice / (1 + (pctChange / 100));

  for (let i = 0; i < numDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (numDays - 1 - i));
    const prog = i / Math.max(1, numDays - 1);
    const p = i === numDays - 1 ? currentPrice : Math.round(startPrice + (currentPrice - startPrice) * prog + Math.sin(i * 0.8) * 20);

    series.push({
      date: d.toISOString().split('T')[0],
      formatted_date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      price: p
    });
  }

  const pList = series.map((s) => s.price);

  return {
    crop: crop || 'Tomato',
    location: location || 'Patna Mandi, Bihar',
    days: numDays,
    current_price: currentPrice,
    historical_prices: series,
    percentage_change: pctChange,
    average_price: Math.round(pList.reduce((a, b) => a + b, 0) / pList.length),
    high_price: Math.max(...pList),
    low_price: Math.min(...pList),
    estimated_min: estMin,
    estimated_max: estMax,
    trend: trend,
    recommendation: rec,
    explanation: explanation,
    data_source: 'Demo Market Data (Agri-Market Prototype Feed)',
    timestamp: new Date().toLocaleString()
  };
}
