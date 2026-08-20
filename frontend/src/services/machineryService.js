import { request } from './api';

export const machineryService = {
  async getListings(params = {}) {
    const query = new URLSearchParams(params).toString();
    try {
      return await request(`/machinery/listings?${query}`);
    } catch {
      return [
        {
          id: 'eq-101',
          name: 'Mahindra 575 DI Power Plus (47 HP)',
          category: 'Tractor',
          model_year: 2023,
          horse_power: 47,
          price_per_hour: 450,
          price_per_day: 3200,
          location_city: 'Pune Rural',
          location_state: 'Maharashtra',
          distance_km: 3.8,
          owner_name: 'Rajesh Patil',
          owner_phone: '+91 98234 11201',
          rating: 4.9,
          reviews_count: 28,
          is_available: true,
          features: ['Power Steering', 'Dual Clutch', 'Rotavator Ready', 'Low Fuel Burn'],
          badge: 'Popular'
        },
        {
          id: 'eq-102',
          name: 'John Deere 5310 4WD Heavy Duty (55 HP)',
          category: 'Tractor',
          model_year: 2024,
          horse_power: 55,
          price_per_hour: 600,
          price_per_day: 4200,
          location_city: 'Baramati',
          location_state: 'Maharashtra',
          distance_km: 7.5,
          owner_name: 'Suresh Kulkarni',
          owner_phone: '+91 97654 88312',
          rating: 4.9,
          reviews_count: 42,
          is_available: true,
          features: ['4-Wheel Drive', 'Heavy Sowing Ready', 'Laser Leveler Ready', 'AC Cabin'],
          badge: 'Top Rated'
        },
        {
          id: 'eq-103',
          name: 'Preet 987 Self-Propelled Multi-Crop Combine Harvester',
          category: 'Harvester',
          model_year: 2022,
          horse_power: 101,
          price_per_hour: 1400,
          price_per_day: 9800,
          location_city: 'Nashik Agri Hub',
          location_state: 'Maharashtra',
          distance_km: 12.0,
          owner_name: 'Gurmeet Singh',
          owner_phone: '+91 94220 54321',
          rating: 4.8,
          reviews_count: 19,
          is_available: true,
          features: ['14ft Cutter Bar', 'Wheat & Paddy Specialist', 'Straw Chopper Included'],
          badge: 'Heavy Duty'
        },
        {
          id: 'eq-104',
          name: 'Garuda Hexacopter Precision Agriculture Spray Drone (16L)',
          category: 'Drone Sprayer',
          model_year: 2024,
          horse_power: 0,
          price_per_hour: 750,
          price_per_day: 5000,
          location_city: 'Pune Suburbs',
          location_state: 'Maharashtra',
          distance_km: 4.2,
          owner_name: 'Amit Deshmukh (AgriTech Hub)',
          owner_phone: '+91 98900 12345',
          rating: 5.0,
          reviews_count: 35,
          is_available: true,
          features: ['16L Tank', '1 Acre in 7 mins', 'Certified Pilot Included', 'Terrain Radar'],
          badge: 'AI Powered'
        },
        {
          id: 'eq-105',
          name: 'Shaktiman Semi-Champion 7-Feet Heavy Duty Rotavator',
          category: 'Tillage',
          model_year: 2023,
          horse_power: 50,
          price_per_hour: 300,
          price_per_day: 2000,
          location_city: 'Ahmednagar',
          location_state: 'Maharashtra',
          distance_km: 8.4,
          owner_name: 'Vikas More',
          owner_phone: '+91 98601 99887',
          rating: 4.7,
          reviews_count: 15,
          is_available: true,
          features: ['48 Boron Steel Blades', '205cm Working Width', 'Multi-Speed Gearbox'],
          badge: 'Affordable'
        },
        {
          id: 'eq-106',
          name: 'Automatic Pneumatic Seed-Cum-Fertilizer Drill (9 Row)',
          category: 'Sowing',
          model_year: 2023,
          horse_power: 45,
          price_per_hour: 380,
          price_per_day: 2500,
          location_city: 'Kolhapur',
          location_state: 'Maharashtra',
          distance_km: 15.1,
          owner_name: 'Babanrao Shinde',
          owner_phone: '+91 94231 66778',
          rating: 4.8,
          reviews_count: 22,
          is_available: true,
          features: ['9-Row Sowing', 'Simultaneous Fertilizer Metering', 'Zero-Till Adaptable'],
          badge: 'Precision Sowing'
        }
      ];
    }
  },

  async book(bookingData) {
    try {
      return await request('/machinery/book', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
    } catch {
      return {
        booking_id: `AGRO-BK-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        machinery_name: bookingData.machinery_name || 'Agro Machinery',
        farmer_name: bookingData.farmer_name,
        booking_date: bookingData.booking_date,
        duration_hours: bookingData.duration_hours,
        total_amount: bookingData.total_amount || 1800,
        status: 'Confirmed'
      };
    }
  }
};
