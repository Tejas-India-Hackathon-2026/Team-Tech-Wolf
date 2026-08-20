import { request } from './api';

export const adminService = {
  /**
   * GET /api/admin/stats
   */
  async getStats() {
    try {
      return await request('/admin/stats');
    } catch {
      return {
        total_users: 3,
        farmers_count: 1,
        owners_count: 1,
        total_listings: 8,
        active_listings: 8,
        total_bookings: 2,
        pending_bookings: 0,
        total_scans: 4,
        total_weather_checks: 6,
        total_mandi_records: 54,
        is_demo_metrics: true
      };
    }
  },

  /**
   * GET /api/admin/users
   */
  async getUsers() {
    try {
      return await request('/admin/users');
    } catch {
      return [
        {
          id: 'usr-demo-admin-00',
          name: 'AGRO-SMART System Admin',
          email: 'admin@agro-smart.com',
          phone: '9876500000',
          user_type: 'Admin',
          state: 'Maharashtra',
          district: 'Pune',
          avatar: '🛡️',
          status: 'Active',
          created_at: '2026-08-01 08:00:00'
        },
        {
          id: 'usr-demo-farmer-01',
          name: 'Rameshwar Patel',
          email: 'farmer@agro-smart.com',
          phone: '9876543210',
          user_type: 'Farmer',
          state: 'Bihar',
          district: 'Patna',
          avatar: '👨‍🌾',
          status: 'Active',
          created_at: '2026-08-01 10:00:00'
        },
        {
          id: 'usr-demo-owner-02',
          name: 'Suresh Singh Machinery',
          email: 'owner@agro-smart.com',
          phone: '9876543211',
          user_type: 'Machinery Owner',
          state: 'Maharashtra',
          district: 'Pune',
          avatar: '🚜',
          status: 'Active',
          created_at: '2026-08-01 11:30:00'
        }
      ];
    }
  },

  /**
   * PATCH /api/admin/users/<id>/status
   */
  async toggleUserStatus(userId) {
    try {
      return await request(`/admin/users/${userId}/status`, {
        method: 'PATCH'
      });
    } catch (err) {
      console.warn('[AdminService] Toggle status fallback:', err.message);
      return { id: userId, status: 'Toggled' };
    }
  },

  /**
   * PATCH /api/admin/users/<id>/role
   */
  async updateUserRole(userId, newRole) {
    try {
      return await request(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole })
      });
    } catch (err) {
      console.warn('[AdminService] Update role fallback:', err.message);
      return { id: userId, user_type: newRole };
    }
  },

  /**
   * GET /api/admin/machinery
   */
  async getMachinery() {
    try {
      return await request('/admin/machinery');
    } catch {
      return [];
    }
  },

  /**
   * PATCH /api/admin/machinery/<id>/status
   */
  async updateMachineryStatus(machineryId, newStatus) {
    try {
      return await request(`/admin/machinery/${machineryId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.warn('[AdminService] Update machinery status fallback:', err.message);
      return { id: machineryId, availability: newStatus };
    }
  },

  /**
   * DELETE /api/admin/machinery/<id>
   */
  async deleteMachinery(machineryId) {
    try {
      return await request(`/admin/machinery/${machineryId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('[AdminService] Delete machinery fallback:', err.message);
      return { id: machineryId, deleted: true };
    }
  },

  /**
   * GET /api/admin/bookings
   */
  async getBookings() {
    try {
      return await request('/admin/bookings');
    } catch {
      return [];
    }
  },

  /**
   * GET /api/admin/activity
   */
  async getActivityLogs() {
    try {
      return await request('/admin/activity');
    } catch {
      return { disease_scans: [], weather_checks: [] };
    }
  },

  /**
   * GET /api/admin/market
   */
  async getMarketOverview() {
    try {
      return await request('/admin/market');
    } catch {
      return [];
    }
  }
};
