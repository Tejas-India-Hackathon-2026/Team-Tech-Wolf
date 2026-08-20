const NOTIFICATIONS_STORAGE_KEY = 'agro_smart_notifications';

const INITIAL_DEMO_NOTIFICATIONS = [
  {
    id: 'notif-demo-1',
    user_id: 'usr-demo-farmer-01',
    type: 'WEATHER_ALERT',
    title: 'Weather Risk Alert: High Humidity',
    message: 'Elevated humidity in Patna region (88%) increases foliar blight risk for Tomato crops. Preventive copper spray advised.',
    severity: 'warning',
    read: false,
    related_entity_type: 'weather',
    related_entity_id: 'risk-patna-tomato',
    action_url: '/weather-intelligence',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString() // 25 mins ago
  },
  {
    id: 'notif-demo-2',
    user_id: 'usr-demo-farmer-01',
    type: 'MARKET_ALERT',
    title: 'Market Trend: Tomato Modal Prices Rising',
    message: 'Tomato wholesale arrivals at Patna Mandi indicate an upward modal price trend (+8% this week). Best selling window recommended.',
    severity: 'info',
    read: false,
    related_entity_type: 'market',
    related_entity_id: 'market-patna-tomato',
    action_url: '/market-intelligence',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 'notif-demo-3',
    user_id: 'usr-demo-owner-02',
    type: 'BOOKING_REQUEST',
    title: 'New Booking Request: Mahindra 575 DI Tractor',
    message: 'Farmer Rameshwar Patel requested your Mahindra 575 DI Tractor for 25 August (4.0 hrs, Patna Rural).',
    severity: 'info',
    read: false,
    related_entity_type: 'booking',
    related_entity_id: 'bk-init-101',
    action_url: '/owner/dashboard?tab=requests',
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-demo-4',
    user_id: 'usr-demo-admin-00',
    type: 'ADMIN_ACTIVITY',
    title: 'System Activity: New Machinery Owner Registered',
    message: 'Suresh Singh Machinery registered equipment in Pune district. Listing available for admin review.',
    severity: 'info',
    read: false,
    related_entity_type: 'user',
    related_entity_id: 'usr-demo-owner-02',
    action_url: '/admin/dashboard?tab=users',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  }
];

function getStoredNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_NOTIFICATIONS));
      return INITIAL_DEMO_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_DEMO_NOTIFICATIONS;
  } catch (err) {
    console.warn('[NotificationService] Error reading notifications:', err);
    return INITIAL_DEMO_NOTIFICATIONS;
  }
}

function saveStoredNotifications(list) {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    // Trigger real-time cross-component sync event
    window.dispatchEvent(new Event('agro_smart_notifications_updated'));
  } catch (err) {
    console.warn('[NotificationService] Error saving notifications:', err);
  }
}

export const formatRelativeTime = (isoString) => {
  if (!isoString) return 'Just now';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 45) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
};

export const notificationService = {
  /**
   * Returns all notifications for a specific user, sorted newest first.
   */
  getNotifications(userId) {
    if (!userId) return [];
    const all = getStoredNotifications();
    return all
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  /**
   * Returns unread count for a specific user.
   */
  getUnreadCount(userId) {
    if (!userId) return 0;
    const all = getStoredNotifications();
    return all.filter(n => n.user_id === userId && !n.read).length;
  },

  /**
   * Create a new notification.
   */
  createNotification({
    user_id,
    type = 'SYSTEM',
    title,
    message,
    severity = 'info',
    related_entity_type = 'system',
    related_entity_id = null,
    action_url = '/dashboard'
  }) {
    if (!user_id || !title) return null;

    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      user_id,
      type,
      title,
      message: message || '',
      severity: severity || 'info',
      read: false,
      related_entity_type,
      related_entity_id,
      action_url,
      created_at: new Date().toISOString()
    };

    const current = getStoredNotifications();
    const updated = [newNotif, ...current];
    saveStoredNotifications(updated);

    // Optional Native Browser Notification Trigger
    this._triggerBrowserNotification(title, message);

    return newNotif;
  },

  /**
   * Mark a single notification as read.
   */
  markAsRead(notificationId) {
    if (!notificationId) return;
    const current = getStoredNotifications();
    const updated = current.map(n => n.id === notificationId ? { ...n, read: true } : n);
    saveStoredNotifications(updated);
  },

  /**
   * Mark all notifications as read for a user.
   */
  markAllAsRead(userId) {
    if (!userId) return;
    const current = getStoredNotifications();
    const updated = current.map(n => n.user_id === userId ? { ...n, read: true } : n);
    saveStoredNotifications(updated);
  },

  /**
   * Delete a single notification.
   */
  deleteNotification(notificationId) {
    if (!notificationId) return;
    const current = getStoredNotifications();
    const updated = current.filter(n => n.id !== notificationId);
    saveStoredNotifications(updated);
  },

  /**
   * Clear all read notifications for a user.
   */
  clearReadNotifications(userId) {
    if (!userId) return;
    const current = getStoredNotifications();
    const updated = current.filter(n => !(n.user_id === userId && n.read));
    saveStoredNotifications(updated);
  },

  // -------------------------------------------------------------
  // HELPER DOMAIN EVENT NOTIFIERS
  // -------------------------------------------------------------

  /**
   * Notify Machinery Owner when a Farmer books machinery.
   */
  notifyBookingRequest(booking, ownerId) {
    const targetOwnerId = ownerId || booking.owner_id || 'usr-demo-owner-02';
    return this.createNotification({
      user_id: targetOwnerId,
      type: 'BOOKING_REQUEST',
      title: `New Booking Request: ${booking.machine_name}`,
      message: `${booking.farmer_name} has requested to rent ${booking.machine_name} on ${booking.booking_date} (${booking.duration || booking.estimated_hours} hrs, ₹${booking.total_estimated_cost || booking.estimated_cost}).`,
      severity: 'info',
      related_entity_type: 'booking',
      related_entity_id: booking.id,
      action_url: '/owner/dashboard?tab=requests'
    });
  },

  /**
   * Notify Farmer when Machinery Owner accepts their booking.
   */
  notifyBookingAccepted(booking, farmerId) {
    const targetFarmerId = farmerId || booking.farmer_id || 'usr-demo-farmer-01';
    return this.createNotification({
      user_id: targetFarmerId,
      type: 'BOOKING_ACCEPTED',
      title: `Booking Accepted: ${booking.machine_name}`,
      message: `Your booking for ${booking.machine_name} on ${booking.booking_date} has been accepted by ${booking.owner_name}.`,
      severity: 'success',
      related_entity_type: 'booking',
      related_entity_id: booking.id,
      action_url: '/dashboard'
    });
  },

  /**
   * Notify Farmer when Machinery Owner rejects their booking.
   */
  notifyBookingRejected(booking, farmerId) {
    const targetFarmerId = farmerId || booking.farmer_id || 'usr-demo-farmer-01';
    return this.createNotification({
      user_id: targetFarmerId,
      type: 'BOOKING_REJECTED',
      title: `Booking Request Rejected: ${booking.machine_name}`,
      message: `Your booking request for ${booking.machine_name} on ${booking.booking_date} was rejected by the owner. Please browse alternative equipment.`,
      severity: 'error',
      related_entity_type: 'booking',
      related_entity_id: booking.id,
      action_url: '/dashboard'
    });
  },

  /**
   * Notify Machinery Owner when Farmer cancels an active booking.
   */
  notifyBookingCancelled(booking, ownerId) {
    const targetOwnerId = ownerId || booking.owner_id || 'usr-demo-owner-02';
    return this.createNotification({
      user_id: targetOwnerId,
      type: 'BOOKING_CANCELLED',
      title: `Booking Cancelled: ${booking.machine_name}`,
      message: `Farmer ${booking.farmer_name} has cancelled the booking for ${booking.machine_name} on ${booking.booking_date}. Equipment is marked available.`,
      severity: 'warning',
      related_entity_type: 'booking',
      related_entity_id: booking.id,
      action_url: '/owner/dashboard?tab=history'
    });
  },

  /**
   * Notify Farmer when Owner marks service as completed.
   */
  notifyBookingCompleted(booking, farmerId) {
    const targetFarmerId = farmerId || booking.farmer_id || 'usr-demo-farmer-01';
    return this.createNotification({
      user_id: targetFarmerId,
      type: 'BOOKING_COMPLETED',
      title: `Service Completed: ${booking.machine_name}`,
      message: `Your machinery rental for ${booking.machine_name} has been marked as completed by the owner.`,
      severity: 'success',
      related_entity_type: 'booking',
      related_entity_id: booking.id,
      action_url: '/dashboard'
    });
  },

  /**
   * Notify Farmer of High / Critical Weather Risk (with deduplication).
   */
  notifyWeatherRisk(userId, crop, location, riskLevel, hazardDetails) {
    if (!userId || !crop) return null;
    const targetRisk = (riskLevel || '').toUpperCase();
    if (targetRisk !== 'HIGH' && targetRisk !== 'CRITICAL') return null;

    // Deduplication check: check if notification for this crop & location was created in past 3 hours
    const existing = this.getNotifications(userId);
    const threeHoursAgo = Date.now() - (3 * 60 * 60 * 1000);
    const isDuplicate = existing.some(n => 
      n.type === 'WEATHER_ALERT' && 
      n.related_entity_id === `weather-${crop}-${location}` &&
      new Date(n.created_at).getTime() > threeHoursAgo
    );

    if (isDuplicate) return null;

    return this.createNotification({
      user_id: userId,
      type: 'WEATHER_ALERT',
      title: `Agro Weather Alert: ${targetRisk} Risk for ${crop}`,
      message: `${hazardDetails || `High risk weather conditions detected for ${crop} in ${location}`}. Review spraying and harvesting advisories.`,
      severity: 'warning',
      related_entity_type: 'weather',
      related_entity_id: `weather-${crop}-${location}`,
      action_url: '/weather-intelligence'
    });
  },

  /**
   * Notify Farmer when Crop Disease Analysis completes.
   */
  notifyDiseaseResult(userId, crop, disease, severity) {
    if (!userId) return null;
    return this.createNotification({
      user_id: userId,
      type: 'DISEASE_ANALYSIS',
      title: `Crop Diagnostic Ready: ${crop}`,
      message: `Leaf analysis identified: ${disease} (${severity} severity). View agronomic management recommendations.`,
      severity: severity === 'High' || severity === 'Severe' ? 'warning' : 'info',
      related_entity_type: 'disease',
      related_entity_id: `disease-${Date.now()}`,
      action_url: '/disease-detection'
    });
  },

  /**
   * Notify Farmer of Meaningful Market Trend.
   */
  notifyMarketChange(userId, crop, mandi, changeDesc) {
    if (!userId || !crop) return null;
    return this.createNotification({
      user_id: userId,
      type: 'MARKET_ALERT',
      title: `Market Intelligence: ${crop} in ${mandi || 'Regional Mandi'}`,
      message: changeDesc || `Price trend update for ${crop}. Inspect modal rate fluctuations and selling recommendation window.`,
      severity: 'info',
      related_entity_type: 'market',
      related_entity_id: `market-${crop}-${mandi}`,
      action_url: '/market-intelligence'
    });
  },

  /**
   * Notify Admin of Important System Activity.
   */
  notifyAdminActivity(title, message, relatedEntityId = null) {
    return this.createNotification({
      user_id: 'usr-demo-admin-00',
      type: 'ADMIN_ACTIVITY',
      title: title || 'Admin System Alert',
      message: message || 'System activity requires administrator attention.',
      severity: 'info',
      related_entity_type: 'system',
      related_entity_id: relatedEntityId,
      action_url: '/admin/dashboard'
    });
  },

  /**
   * Request native browser notification permission upon user click.
   */
  async requestBrowserPermission() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  },

  _triggerBrowserNotification(title, message) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`AGRO-SMART: ${title}`, {
          body: message,
          icon: '/favicon.ico'
        });
      }
    } catch {
      // Browser notification failed or unsupported; in-app notification remains functional
    }
  }
};
