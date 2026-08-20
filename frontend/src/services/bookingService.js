import { request } from './api';

const BOOKINGS_KEY = 'agro_smart_bookings';

const INITIAL_DEMO_BOOKINGS = [
  {
    id: 'bk-init-101',
    booking_id: 'bk-init-101',
    machinery_id: 'eq-101',
    machine_name: 'Mahindra 575 DI Power Plus',
    machine_type: 'Tractor',
    farmer_id: 'usr-demo-farmer-01',
    farmer_name: 'Rameshwar Patel',
    farmer_phone: '9876543210',
    phone: '9876543210',
    service_location: 'Patna Rural, Bihar',
    booking_date: '2026-08-25',
    start_time: '08:00 AM',
    duration: 4.0,
    estimated_hours: 4.0,
    price_per_hour: 700.0,
    estimated_cost: 2800.0,
    total_estimated_cost: 2800.0,
    owner_id: 'usr-demo-owner-02',
    owner_name: 'Suresh Singh Machinery',
    owner_phone: '9876543211',
    status: 'ACCEPTED',
    created_at: '2026-08-20 14:30:00',
    updated_at: '2026-08-20 14:35:00'
  }
];

function getStoredBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_DEMO_BOOKINGS));
      return INITIAL_DEMO_BOOKINGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_DEMO_BOOKINGS;
  } catch (err) {
    console.warn('[BookingService] Error reading stored bookings:', err);
    return INITIAL_DEMO_BOOKINGS;
  }
}

function saveStoredBookings(list) {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
    // Trigger custom event so any active dashboard refreshes immediately
    window.dispatchEvent(new Event('agro_smart_bookings_updated'));
  } catch (err) {
    console.warn('[BookingService] Error saving bookings:', err);
  }
}

export const bookingService = {
  /**
   * Double-booking validation:
   * Checks if an active booking (PENDING or ACCEPTED) exists on the same machinery on the same date.
   */
  hasOverlappingBooking(machineryId, bookingDate, bookings = null) {
    const list = bookings || getStoredBookings();
    return list.some(b => {
      const isSameMachine = String(b.machinery_id) === String(machineryId);
      const isSameDate = String(b.booking_date) === String(bookingDate);
      const isActiveStatus = b.status === 'PENDING' || b.status === 'ACCEPTED';
      return isSameMachine && isSameDate && isActiveStatus;
    });
  },

  /**
   * Create a new booking.
   * Initial status is strictly PENDING.
   */
  async createBooking(bookingData) {
    const currentList = getStoredBookings();

    // 1. Client Double-Booking Check
    if (this.hasOverlappingBooking(bookingData.machinery_id, bookingData.booking_date, currentList)) {
      throw new Error('This machine is already booked for the selected date. Please choose another date or machine.');
    }

    const duration = Number(bookingData.duration || bookingData.estimated_hours || 4);
    const rate = Number(bookingData.price_per_hour || 700);
    const totalCost = Number(bookingData.total_estimated_cost || (rate * duration));
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newBooking = {
      id: `bk-${Date.now()}`,
      booking_id: `bk-${Date.now()}`,
      machinery_id: bookingData.machinery_id,
      machine_name: bookingData.machine_name || 'Farm Machinery',
      machine_type: bookingData.machine_type || 'Tractor',
      farmer_id: bookingData.farmer_id || 'usr-farmer',
      farmer_name: bookingData.farmer_name || 'Farmer',
      farmer_phone: bookingData.farmer_phone || bookingData.phone || '9876543210',
      phone: bookingData.farmer_phone || bookingData.phone || '9876543210',
      service_location: bookingData.service_location || 'Local Farm',
      booking_date: bookingData.booking_date,
      start_time: bookingData.start_time || '08:00 AM',
      duration: duration,
      estimated_hours: duration,
      price_per_hour: rate,
      estimated_cost: totalCost,
      total_estimated_cost: totalCost,
      owner_id: bookingData.owner_id || 'usr-demo-owner-02',
      owner_name: bookingData.owner_name || 'Suresh Singh Machinery',
      owner_phone: bookingData.owner_phone || '9876543211',
      status: 'PENDING',
      created_at: nowStr,
      updated_at: nowStr
    };

    // Try backend persistence
    try {
      const serverRes = await request('/machinery/bookings', {
        method: 'POST',
        body: JSON.stringify(newBooking)
      });
      if (serverRes && serverRes.id) {
        newBooking.id = serverRes.id;
      }
    } catch (err) {
      console.warn('[BookingService] Backend booking sync notice (using local storage):', err.message);
    }

    // Update local shared storage
    const updated = [newBooking, ...currentList];
    saveStoredBookings(updated);
    return newBooking;
  },

  /**
   * Get all shared bookings with optional role-based filtering.
   */
  async getBookings(filters = {}) {
    let list = getStoredBookings();

    try {
      const serverList = await request('/machinery/bookings');
      if (Array.isArray(serverList) && serverList.length > 0) {
        // Merge server and local list ensuring no duplicates
        const map = new Map();
        [...serverList, ...list].forEach(b => map.set(b.id, b));
        list = Array.from(map.values());
        saveStoredBookings(list);
      }
    } catch (err) {
      console.warn('[BookingService] Backend fetch fallback to local:', err.message);
    }

    // Role / user filtering
    if (filters.farmer_id || filters.farmer_phone) {
      list = list.filter(b => 
        (filters.farmer_id && b.farmer_id === filters.farmer_id) ||
        (filters.farmer_phone && (b.farmer_phone === filters.farmer_phone || b.phone === filters.farmer_phone))
      );
    }

    if (filters.owner_id || filters.owner_phone) {
      list = list.filter(b => 
        (filters.owner_id && b.owner_id === filters.owner_id) ||
        (filters.owner_phone && b.owner_phone === filters.owner_phone)
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      const targetStatus = filters.status.toUpperCase();
      list = list.filter(b => b.status === targetStatus);
    }

    return list;
  },

  /**
   * Update status of a booking (ACCEPT, REJECT, CANCEL, COMPLETED).
   */
  async updateBookingStatus(bookingId, rawStatus) {
    const newStatus = String(rawStatus || '').toUpperCase().trim();
    const currentList = getStoredBookings();
    const target = currentList.find(b => b.id === bookingId);
    if (!target) {
      throw new Error('Booking not found');
    }

    target.status = newStatus;
    target.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Sync to backend if available
    try {
      await request(`/machinery/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.warn('[BookingService] Backend status sync notice:', err.message);
    }

    saveStoredBookings([...currentList]);
    return target;
  },

  /**
   * Cancel booking (Farmer action).
   */
  async cancelBooking(bookingId) {
    return await this.updateBookingStatus(bookingId, 'CANCELLED');
  }
};
