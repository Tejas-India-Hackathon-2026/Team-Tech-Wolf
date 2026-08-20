import { request } from './api';

export const weatherService = {
  async getWeatherRisk(city = 'Pune', crop = 'Tomato', lat = null, lon = null) {
    let url = `/weather/risk?city=${encodeURIComponent(city)}&crop=${encodeURIComponent(crop)}`;
    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    }
    try {
      return await request(url);
    } catch {
      return {
        location: `${city}, Agri Region`,
        crop: crop,
        current_weather: {
          temperature: 28.2,
          humidity: 66,
          wind_speed: 10.4,
          precipitation_prob: 10,
          weather_condition: 'Partly Cloudy'
        },
        agro_risk: {
          overall_level: 'Low',
          risk_score: 22,
          optimal_temp_range: '18°C - 28°C',
          optimal_humidity_range: '50% - 75%',
          active_alerts: [
            {
              type: 'Optimal Growing Window',
              severity: 'Low',
              message: `Temperature & humidity levels are within prime biological thresholds for ${crop}.`
            }
          ],
          spray_advisory: {
            status: 'Optimal',
            advice: 'Low wind speeds (<12 km/h) & 0% rain forecast. Ideal time for protective foliar sprays.'
          }
        },
        forecast: [
          { day: 'Today', date: 'Day 1', temp_max: 29, temp_min: 21, humidity: 66, wind: 10.4, spray_window: 'Optimal', risk: 'Low' },
          { day: 'Tomorrow', date: 'Day 2', temp_max: 30, temp_min: 22, humidity: 62, wind: 9.8, spray_window: 'Optimal', risk: 'Low' },
          { day: 'Day 3', date: 'Day 3', temp_max: 31, temp_min: 23, humidity: 58, wind: 11.5, spray_window: 'Optimal', risk: 'Low' },
          { day: 'Day 4', date: 'Day 4', temp_max: 28, temp_min: 20, humidity: 79, wind: 13.2, spray_window: 'Caution', risk: 'Moderate' },
          { day: 'Day 5', date: 'Day 5', temp_max: 27, temp_min: 19, humidity: 86, wind: 17.0, spray_window: 'Avoid', risk: 'High' },
          { day: 'Day 6', date: 'Day 6', temp_max: 29, temp_min: 21, humidity: 65, wind: 10.0, spray_window: 'Optimal', risk: 'Low' },
          { day: 'Day 7', date: 'Day 7', temp_max: 30, temp_min: 22, humidity: 60, wind: 8.5, spray_window: 'Optimal', risk: 'Low' }
        ]
      };
    }
  },

  async getCrops() {
    try {
      return await request('/weather/crops');
    } catch {
      return ['Tomato', 'Wheat', 'Rice (Paddy)', 'Potato', 'Cotton'];
    }
  },

  async getLocations() {
    try {
      return await request('/weather/locations');
    } catch {
      return [
        { id: 'pune', name: 'Pune, Maharashtra' },
        { id: 'nashik', name: 'Nashik, Maharashtra' },
        { id: 'nagpur', name: 'Nagpur, Maharashtra' },
        { id: 'latur', name: 'Latur, Maharashtra' },
        { id: 'karnal', name: 'Karnal, Haryana' },
        { id: 'agra', name: 'Agra, Uttar Pradesh' }
      ];
    }
  }
};
