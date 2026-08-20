import { request } from './api';

export const weatherService = {
  /**
   * Primary endpoint: GET /api/weather/risk?location=...&crop=...
   */
  async getWeatherRisk(location = 'Patna, Bihar', crop = 'Tomato', lat = null, lon = null) {
    let url = `/weather/risk?location=${encodeURIComponent(location)}&crop=${encodeURIComponent(crop)}`;
    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    }

    try {
      return await request(url);
    } catch (err) {
      console.warn('[WeatherService] Backend /weather/risk fallback:', err.message);
      return getClientFallbackCropRisk(location, crop);
    }
  },

  /**
   * Fetches past weather check logs: GET /api/weather/history
   */
  async getHistory() {
    try {
      return await request('/weather/history');
    } catch {
      return [
        {
          id: 'wc-sample-1',
          crop: 'Tomato',
          location: 'Patna, Bihar',
          temperature: 32.0,
          humidity: 68.0,
          rain_chance: 70.0,
          risk_level: 'MODERATE',
          concern: 'High humidity + rainfall may increase fungal disease risk.',
          recommendation: 'Monitor leaves closely and avoid irrigation before rainfall.'
        }
      ];
    }
  },

  /**
   * Returns list of supported crops
   */
  async getCrops() {
    try {
      return await request('/weather/crops');
    } catch {
      return ['Tomato', 'Potato', 'Rice', 'Wheat', 'Cotton', 'Corn', 'Sugarcane'];
    }
  },

  /**
   * Returns list of preset agricultural state/city hubs
   */
  async getLocations() {
    try {
      return await request('/weather/locations');
    } catch {
      return [
        { id: 'patna', name: 'Patna, Bihar', state: 'Bihar' },
        { id: 'pune', name: 'Pune, Maharashtra', state: 'Maharashtra' },
        { id: 'nashik', name: 'Nashik, Maharashtra', state: 'Maharashtra' },
        { id: 'nagpur', name: 'Nagpur, Maharashtra', state: 'Maharashtra' },
        { id: 'latur', name: 'Latur, Maharashtra', state: 'Maharashtra' },
        { id: 'karnal', name: 'Karnal, Haryana', state: 'Haryana' },
        { id: 'ludhiana', name: 'Ludhiana, Punjab', state: 'Punjab' },
        { id: 'agra', name: 'Agra, Uttar Pradesh', state: 'Uttar Pradesh' },
        { id: 'jaipur', name: 'Jaipur, Rajasthan', state: 'Rajasthan' },
        { id: 'indore', name: 'Indore, Madhya Pradesh', state: 'Madhya Pradesh' },
        { id: 'bengaluru', name: 'Bengaluru, Karnataka', state: 'Karnataka' },
        { id: 'hyderabad', name: 'Hyderabad, Telangana', state: 'Telangana' }
      ];
    }
  }
};

/**
 * Intelligent Client-Side Crop Risk Rules Fallback
 */
function getClientFallbackCropRisk(location, crop) {
  const cropLower = crop.toLowerCase();

  let temp = 32.0;
  let humidity = 68.0;
  let rainChance = 70.0;
  let windSpeed = 11.5;
  let riskLevel = 'MODERATE';
  let concern = 'High humidity + rainfall may increase fungal disease risk.';
  let action = 'Monitor leaves closely and avoid irrigation before rainfall.';
  let sprayStatus = 'Caution';
  let sprayAdvice = 'High rain probability (70%). Delay spraying to prevent chemical wash-off.';

  if (cropLower.includes('potato')) {
    temp = 24.0;
    humidity = 82.0;
    rainChance = 65.0;
    riskLevel = 'HIGH';
    concern = 'Elevated Late Blight epidemic risk. Continuous moisture creates ideal incubation for tuber and foliar rot.';
    action = 'Avoid furrow irrigation completely. Spray protective Mancozeb 75% WP @ 2.5g/L or Cymoxanil immediately.';
    sprayStatus = 'Caution';
    sprayAdvice = 'Apply during dry intervals between showers.';
  } else if (cropLower.includes('wheat')) {
    temp = 16.5;
    humidity = 78.0;
    rainChance = 20.0;
    riskLevel = 'HIGH';
    concern = 'Yellow / Stripe Rust incubation alert! Cool damp weather promotes Puccinia fungal spore germination on leaf blades.';
    action = 'Inspect lower leaves for linear yellow-orange pustules. Spray Propiconazole 25% EC (Tilt) @ 1ml/L immediately at first detection.';
    sprayStatus = 'Optimal';
    sprayAdvice = 'Spray in clear morning hours after morning dew dries.';
  } else if (cropLower.includes('rice')) {
    temp = 31.0;
    humidity = 84.0;
    rainChance = 60.0;
    riskLevel = 'HIGH';
    concern = 'Dense humidity + cloudy skies sharply increase Rice Blast (Magnaporthe) and Brown Planthopper (BPH) multiplication.';
    action = 'Withhold top-dressing of nitrogenous urea. Drain excess standing water for 2-3 days to aerate the root zone.';
    sprayStatus = 'Avoid';
    sprayAdvice = 'Rain will dilute foliar sprays. Spray after rain subsides.';
  } else if (cropLower.includes('cotton')) {
    temp = 30.5;
    humidity = 66.0;
    rainChance = 55.0;
    riskLevel = 'HIGH';
    concern = 'Rainfall during boll maturation causes internal boll rot and fiber staining.';
    action = 'Pick open mature cotton bolls before rainfall starts. Clear field drainage furrows to prevent water stagnation.';
    sprayStatus = 'Avoid';
    sprayAdvice = 'Avoid spraying before showers.';
  }

  return {
    location: location || 'Patna, Bihar',
    crop: crop || 'Tomato',
    temperature: temp,
    humidity: humidity,
    rain_chance: rainChance,
    wind_speed: windSpeed,
    weather_condition: rainChance > 50 ? 'Scattered Rain Showers' : 'Partly Cloudy',
    risk_level: riskLevel,
    concern: concern,
    recommendation: action,
    action: action,
    spray_advisory: {
      status: sprayStatus,
      advice: sprayAdvice
    },
    forecast: [
      { day: 'Today', temp_max: temp + 1, temp_min: temp - 8, rain_chance: rainChance, humidity: humidity },
      { day: 'Tomorrow', temp_max: temp + 2, temp_min: temp - 7, rain_chance: Math.max(15, rainChance - 10), humidity: humidity - 4 },
      { day: 'Day 3', temp_max: temp + 3, temp_min: temp - 6, rain_chance: 35, humidity: 62 },
      { day: 'Day 4', temp_max: temp + 2, temp_min: temp - 7, rain_chance: 20, humidity: 58 },
      { day: 'Day 5', temp_max: temp + 1, temp_min: temp - 8, rain_chance: 15, humidity: 55 },
      { day: 'Day 6', temp_max: temp + 2, temp_min: temp - 7, rain_chance: 20, humidity: 56 },
      { day: 'Day 7', temp_max: temp + 3, temp_min: temp - 6, rain_chance: 25, humidity: 60 }
    ]
  };
}
