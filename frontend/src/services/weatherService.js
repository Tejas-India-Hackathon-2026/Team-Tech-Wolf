import { request } from './api';

export const weatherService = {
  /**
   * Primary endpoint: GET /api/weather/risk?location=...&crop=...
   * Fetches real-time weather from Flask backend (powered by Open-Meteo).
   */
  async getWeatherRisk(location = 'Patna, Bihar', crop = 'Tomato', lat = null, lon = null) {
    let url = `/weather/risk?location=${encodeURIComponent(location)}&crop=${encodeURIComponent(crop)}`;
    if (lat !== null && lon !== null) {
      url += `&lat=${lat}&lon=${lon}`;
    }

    const res = await request(url);
    return res;
  },

  /**
   * Autocomplete location search: GET /api/weather/locations?q=...
   */
  async searchLocations(query) {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await request(`/weather/locations?q=${encodeURIComponent(query.trim())}`);
      return Array.isArray(res) ? res : (res?.data || []);
    } catch (err) {
      console.warn('[WeatherService] Autocomplete search error:', err);
      return [];
    }
  },

  /**
   * Fetches past weather check logs: GET /api/weather/history
   */
  async getHistory() {
    try {
      const res = await request('/weather/history');
      return Array.isArray(res) ? res : (res?.data || []);
    } catch {
      return [];
    }
  },

  /**
   * Returns list of supported crops
   */
  async getCrops() {
    try {
      const res = await request('/weather/crops');
      return Array.isArray(res) ? res : (res?.data || []);
    } catch {
      return [
        'Tomato', 'Potato', 'Rice', 'Wheat', 'Corn', 
        'Onion', 'Chilli', 'Brinjal', 'Cotton', 'Sugarcane'
      ];
    }
  },

  /**
   * Returns list of preset agricultural location hubs
   */
  async getLocations() {
    try {
      const res = await request('/weather/locations');
      return Array.isArray(res) ? res : (res?.data || []);
    } catch {
      return [];
    }
  }
};
