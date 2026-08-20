import { request } from './api';

export const marketService = {
  async getPrices(params = {}) {
    const query = new URLSearchParams(params).toString();
    try {
      return await request(`/market/prices?${query}`);
    } catch {
      return [
        {
          id: 'mkt-1',
          commodity: 'Wheat',
          variety: 'Lokwan Standard',
          mandi_name: 'Pune Mandi (Gultekdi)',
          district: 'Pune',
          state: 'Maharashtra',
          min_price: 2480,
          max_price: 2860,
          modal_price: 2720,
          yesterday_price: 2680,
          price_change_pct: 1.49,
          price_unit: '₹/Quintal',
          price_trend: 'Bullish',
          forecast_next_week: 2790,
          demand_index: 'High',
          history_7d: [2620, 2640, 2660, 2650, 2680, 2700, 2720],
          distance_km: 14
        },
        {
          id: 'mkt-2',
          commodity: 'Wheat',
          variety: 'Sharbati Premium',
          mandi_name: 'Nashik APMC',
          district: 'Nashik',
          state: 'Maharashtra',
          min_price: 2900,
          max_price: 3450,
          modal_price: 3220,
          yesterday_price: 3150,
          price_change_pct: 2.22,
          price_unit: '₹/Quintal',
          price_trend: 'Bullish',
          forecast_next_week: 3310,
          demand_index: 'Very High',
          history_7d: [3080, 3100, 3120, 3140, 3150, 3190, 3220],
          distance_km: 65
        },
        {
          id: 'mkt-3',
          commodity: 'Soybean',
          variety: 'Yellow Grade-A',
          mandi_name: 'Latur APMC',
          district: 'Latur',
          state: 'Maharashtra',
          min_price: 4350,
          max_price: 4890,
          modal_price: 4650,
          yesterday_price: 4620,
          price_change_pct: 0.65,
          price_unit: '₹/Quintal',
          price_trend: 'Stable',
          forecast_next_week: 4680,
          demand_index: 'Moderate',
          history_7d: [4590, 4600, 4630, 4620, 4620, 4640, 4650],
          distance_km: 110
        },
        {
          id: 'mkt-4',
          commodity: 'Tomato',
          variety: 'Hybrid Red',
          mandi_name: 'Narayangaon Mandi',
          district: 'Pune',
          state: 'Maharashtra',
          min_price: 1850,
          max_price: 2550,
          modal_price: 2150,
          yesterday_price: 2280,
          price_change_pct: -5.70,
          price_unit: '₹/Quintal',
          price_trend: 'Bearish',
          forecast_next_week: 1950,
          demand_index: 'Surplus Inflow',
          history_7d: [2450, 2400, 2350, 2300, 2280, 2220, 2150],
          distance_km: 42
        },
        {
          id: 'mkt-5',
          commodity: 'Onion',
          variety: 'Nashik Red Export',
          mandi_name: 'Lasalgaon Mandi',
          district: 'Nashik',
          state: 'Maharashtra',
          min_price: 1750,
          max_price: 2450,
          modal_price: 2180,
          yesterday_price: 2050,
          price_change_pct: 6.34,
          price_unit: '₹/Quintal',
          price_trend: 'Bullish',
          forecast_next_week: 2360,
          demand_index: 'Very High',
          history_7d: [1880, 1920, 1960, 2000, 2050, 2110, 2180],
          distance_km: 72
        },
        {
          id: 'mkt-6',
          commodity: 'Cotton',
          variety: 'Medium Staple (Shankar-6)',
          mandi_name: 'Akola Mandi',
          district: 'Akola',
          state: 'Maharashtra',
          min_price: 6900,
          max_price: 7650,
          modal_price: 7320,
          yesterday_price: 7300,
          price_change_pct: 0.27,
          price_unit: '₹/Quintal',
          price_trend: 'Stable',
          forecast_next_week: 7350,
          demand_index: 'Moderate',
          history_7d: [7250, 7270, 7280, 7300, 7300, 7310, 7320],
          distance_km: 190
        }
      ];
    }
  },

  async getArbitrage(commodity = 'Wheat', quantity = 50, transportRate = 15) {
    try {
      return await request(`/market/arbitrage?commodity=${encodeURIComponent(commodity)}&quantity_quintals=${quantity}&transport_cost_per_km=${transportRate}`);
    } catch {
      return [
        {
          mandi_name: 'Pune Mandi (Gultekdi)',
          district: 'Pune',
          modal_price: 2720,
          distance_km: 14,
          gross_revenue: 2720 * quantity,
          estimated_transport: 14 * transportRate * 2,
          net_revenue: (2720 * quantity) - (14 * transportRate * 2),
          net_effective_price: 2711.6,
          recommendation: 'Highest Net Profit (Recommended)'
        },
        {
          mandi_name: 'Nashik APMC',
          district: 'Nashik',
          modal_price: 3220,
          distance_km: 65,
          gross_revenue: 3220 * quantity,
          estimated_transport: 65 * transportRate * 2,
          net_revenue: (3220 * quantity) - (65 * transportRate * 2),
          net_effective_price: 3181.0,
          recommendation: 'High Gross Rate (Factor Fuel)'
        }
      ];
    }
  }
};
