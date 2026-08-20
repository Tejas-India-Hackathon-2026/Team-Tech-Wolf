import { request } from './api';

export const machineryService = {
  /**
   * Primary machinery catalog endpoint: GET /api/machinery
   * Params: location, type, sort, max_distance, search
   */
  async getListings(params = {}) {
    const query = new URLSearchParams(params).toString();
    try {
      return await request(`/machinery?${query}`);
    } catch (err) {
      console.warn('[MachineryService] Backend /machinery fallback:', err.message);
      return getClientFallbackMachineryListings(params);
    }
  },

  /**
   * Retrieve single machinery details: GET /api/machinery/:id
   */
  async getDetails(id) {
    try {
      return await request(`/machinery/${id}`);
    } catch {
      const all = getClientFallbackMachineryListings();
      return all.find((m) => m.id === id) || all[0];
    }
  },

  /**
   * Submit booking: POST /api/machinery/bookings
   */
  async book(bookingData) {
    try {
      return await request('/machinery/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
    } catch (err) {
      console.warn('[MachineryService] Backend /machinery/bookings fallback:', err.message);
      const hours = Number(bookingData.estimated_hours || 4);
      const rate = Number(bookingData.price_per_hour || 700);
      return {
        id: `bk-${Math.random().toString(36).substring(2, 8)}`,
        machinery_id: bookingData.machinery_id,
        machine_name: bookingData.machine_name || 'Mahindra Tractor',
        machine_type: bookingData.machine_type || 'Tractor',
        farmer_name: bookingData.farmer_name,
        phone: bookingData.phone,
        service_location: bookingData.service_location,
        booking_date: bookingData.booking_date,
        start_time: bookingData.start_time || '08:00 AM',
        estimated_hours: hours,
        price_per_hour: rate,
        estimated_cost: hours * rate,
        owner_name: bookingData.owner_name || 'Rajesh Patil',
        owner_phone: bookingData.owner_phone || '+91 98234 11201',
        status: 'Accepted',
        created_at: new Date().toLocaleString()
      };
    }
  },

  /**
   * Get all bookings for "My Bookings" section: GET /api/machinery/bookings
   */
  async getBookings() {
    try {
      return await request('/machinery/bookings');
    } catch {
      return [
        {
          id: 'bk-init-101',
          machinery_id: 'eq-101',
          machine_name: 'Mahindra 575 DI Power Plus',
          machine_type: 'Tractor',
          farmer_name: 'Ramesh Deshmukh',
          phone: '+91 98765 43210',
          service_location: 'Patna Rural, Bihar',
          booking_date: '2026-08-22',
          start_time: '08:00 AM',
          estimated_hours: 4.0,
          price_per_hour: 700.00,
          estimated_cost: 2800.00,
          owner_name: 'Rajesh Patil',
          owner_phone: '+91 98234 11201',
          status: 'Accepted',
          created_at: '2026-08-20 14:30:00'
        }
      ];
    }
  },

  /**
   * Update status: PATCH /api/machinery/bookings/:id/status
   */
  async updateStatus(bookingId, newStatus) {
    try {
      return await request(`/machinery/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      return { id: bookingId, status: newStatus };
    }
  }
};

/**
 * Client-Side Fallback Machinery Dataset
 */
function getClientFallbackMachineryListings(params = {}) {
  const dataset = [
    {
      id: 'eq-101',
      machine_name: 'Mahindra 575 DI Power Plus',
      machine_type: 'Tractor',
      horse_power: 47,
      price_per_hour: 700.00,
      price_per_day: 4900.00,
      rating: 4.8,
      reviews_count: 34,
      distance_km: 2.5,
      location: 'Pune Rural, Maharashtra',
      owner_name: 'Rajesh Patil',
      owner_phone: '+91 98234 11201',
      availability: 'Available Now',
      features: ['Power Steering', 'Rotavator Ready', 'Dual Clutch', 'Low Fuel Burn'],
      badge: 'Popular'
    },
    {
      id: 'eq-102',
      machine_name: 'John Deere 5310 4WD Heavy Duty',
      machine_type: 'Tractor',
      horse_power: 55,
      price_per_hour: 850.00,
      price_per_day: 5800.00,
      rating: 4.9,
      reviews_count: 48,
      distance_km: 6.2,
      location: 'Baramati, Maharashtra',
      owner_name: 'Suresh Kulkarni',
      owner_phone: '+91 97654 88312',
      availability: 'Available Now',
      features: ['4-Wheel Drive', 'Heavy Cultivation', 'AC Cabin', 'Laser Leveler Ready'],
      badge: 'Top Rated'
    },
    {
      id: 'eq-103',
      machine_name: 'Swaraj 855 FE Heavy Duty Tractor',
      machine_type: 'Tractor',
      horse_power: 52,
      price_per_hour: 650.00,
      price_per_day: 4500.00,
      rating: 4.7,
      reviews_count: 28,
      distance_km: 3.8,
      location: 'Patna Rural, Bihar',
      owner_name: 'Manoj Kumar Singh',
      owner_phone: '+91 94310 22345',
      availability: 'Available Now',
      features: ['Multi-Speed PTO', 'High Torque', 'Plough Compatible'],
      badge: 'Best Value'
    },
    {
      id: 'eq-104',
      machine_name: 'Preet 987 Self-Propelled Multi-Crop',
      machine_type: 'Harvester',
      horse_power: 101,
      price_per_hour: 1600.00,
      price_per_day: 11000.00,
      rating: 4.9,
      reviews_count: 29,
      distance_km: 8.5,
      location: 'Karnal, Haryana',
      owner_name: 'Gurmeet Singh',
      owner_phone: '+91 94220 54321',
      availability: 'Available Now',
      features: ['14ft Cutter Bar', 'Paddy & Wheat Specialist', 'Straw Chopper Included'],
      badge: 'Heavy Duty'
    },
    {
      id: 'eq-105',
      machine_name: 'Claas Crop Tiger 30 Grain Harvester',
      machine_type: 'Harvester',
      horse_power: 75,
      price_per_hour: 1800.00,
      price_per_day: 12500.00,
      rating: 4.8,
      reviews_count: 19,
      distance_km: 12.0,
      location: 'Ludhiana, Punjab',
      owner_name: 'Harpreet Gill',
      owner_phone: '+91 98140 77654',
      availability: 'Available Now',
      features: ['Rubber Tracks for Wet Soil', 'High Grain Recovery', 'Low Grain Loss'],
      badge: 'High Efficiency'
    },
    {
      id: 'eq-106',
      machine_name: 'Shaktiman Semi-Champion 7-Feet',
      machine_type: 'Rotavator',
      horse_power: 50,
      price_per_hour: 350.00,
      price_per_day: 2400.00,
      rating: 4.8,
      reviews_count: 22,
      distance_km: 4.5,
      location: 'Ahmednagar, Maharashtra',
      owner_name: 'Vikas Shinde',
      owner_phone: '+91 98601 99887',
      availability: 'Available Now',
      features: ['48 Boron Steel Blades', '205cm Working Width', 'Multi-Speed Gearbox'],
      badge: 'Tillage Master'
    },
    {
      id: 'eq-107',
      machine_name: 'Fieldking Heavy Duty 9-Tyne Rigid',
      machine_type: 'Cultivator',
      horse_power: 45,
      price_per_hour: 300.00,
      price_per_day: 2000.00,
      rating: 4.7,
      reviews_count: 16,
      distance_km: 5.0,
      location: 'Patna, Bihar',
      owner_name: 'Rameshwar Yadav',
      owner_phone: '+91 94302 88123',
      availability: 'Available Now',
      features: ['9 Forged Tynes', 'Zero Soil Compaction', 'High Penetration'],
      badge: 'Affordable'
    },
    {
      id: 'eq-108',
      machine_name: 'National Automatic Seed-Cum-Fertilizer Drill',
      machine_type: 'Seed Drill',
      horse_power: 45,
      price_per_hour: 400.00,
      price_per_day: 2800.00,
      rating: 4.9,
      reviews_count: 25,
      distance_km: 9.2,
      location: 'Agra, Uttar Pradesh',
      owner_name: 'Babanrao Patil',
      owner_phone: '+91 94231 66778',
      availability: 'Available Now',
      features: ['9-Row Sowing', 'Simultaneous Fertilizer Metering', 'Zero-Till Adaptable'],
      badge: 'Precision Sowing'
    }
  ];

  let results = dataset;
  if (params.type && params.type !== 'All') {
    results = results.filter((m) => m.machine_type.toLowerCase() === params.type.toLowerCase());
  }
  if (params.location) {
    const loc = params.location.toLowerCase();
    const locMatches = results.filter((m) => m.location.toLowerCase().includes(loc));
    if (locMatches.length > 0) results = locMatches;
  }
  if (params.search) {
    const s = params.search.toLowerCase();
    results = results.filter((m) => m.machine_name.toLowerCase().includes(s) || m.location.toLowerCase().includes(s) || m.machine_type.toLowerCase().includes(s));
  }
  if (params.sort === 'price_asc') {
    results.sort((a, b) => a.price_per_hour - b.price_per_hour);
  } else if (params.sort === 'price_desc') {
    results.sort((a, b) => b.price_per_hour - a.price_per_hour);
  } else if (params.sort === 'rating_desc') {
    results.sort((a, b) => b.rating - a.rating);
  } else {
    results.sort((a, b) => a.distance_km - b.distance_km);
  }

  return results;
}
