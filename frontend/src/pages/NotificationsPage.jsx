import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Tractor, 
  CloudSunRain, 
  ScanSearch, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Volume2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationService, formatRelativeTime } from '../services/notificationService';

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL', 'UNREAD', 'BOOKING', 'WEATHER', 'DISEASE', 'MARKET', 'ADMIN'
  const [browserPermStatus, setBrowserPermStatus] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadNotifications = () => {
    if (!user || !user.id) {
      setNotifications([]);
      return;
    }
    const list = notificationService.getNotifications(user.id);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => loadNotifications();
    window.addEventListener('agro_smart_notifications_updated', handleUpdate);
    return () => window.removeEventListener('agro_smart_notifications_updated', handleUpdate);
  }, [user]);

  const handleMarkAsRead = (id, e) => {
    e?.stopPropagation();
    notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    if (!user?.id) return;
    notificationService.markAllAsRead(user.id);
    showToast('All notifications marked as read.');
    loadNotifications();
  };

  const handleDelete = (id, e) => {
    e?.stopPropagation();
    notificationService.deleteNotification(id);
    loadNotifications();
  };

  const handleClearRead = () => {
    if (!user?.id) return;
    notificationService.clearReadNotifications(user.id);
    showToast('Cleared read notifications.');
    loadNotifications();
  };

  const handleEnableBrowserNotifications = async () => {
    const perm = await notificationService.requestBrowserPermission();
    setBrowserPermStatus(perm);
    if (perm === 'granted') {
      showToast('Browser notifications enabled!');
    } else if (perm === 'denied') {
      showToast('Browser notification permission was blocked in your browser settings.');
    }
  };

  const handleNotificationClick = (item) => {
    notificationService.markAsRead(item.id);
    if (item.action_url) {
      navigate(item.action_url);
    }
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'BOOKING_REQUEST':
      case 'BOOKING_ACCEPTED':
      case 'BOOKING_REJECTED':
      case 'BOOKING_CANCELLED':
      case 'BOOKING_COMPLETED':
        return <Tractor size={18} style={{ color: '#b45309' }} />;
      case 'WEATHER_ALERT':
        return <CloudSunRain size={18} style={{ color: '#0369a1' }} />;
      case 'DISEASE_ANALYSIS':
        return <ScanSearch size={18} style={{ color: '#15803d' }} />;
      case 'MARKET_ALERT':
        return <TrendingUp size={18} style={{ color: '#047857' }} />;
      case 'ADMIN_ACTIVITY':
        return <ShieldCheck size={18} style={{ color: '#991b1b' }} />;
      default:
        return <Info size={18} style={{ color: 'var(--primary-700)' }} />;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'success':
        return <span className="badge-pill badge-emerald" style={{ fontSize: '0.68rem' }}>Success</span>;
      case 'warning':
        return <span className="badge-pill badge-amber" style={{ fontSize: '0.68rem' }}>Alert</span>;
      case 'error':
        return <span className="badge-pill badge-red" style={{ fontSize: '0.68rem' }}>Urgent</span>;
      default:
        return <span className="badge-pill badge-emerald" style={{ fontSize: '0.68rem' }}>Info</span>;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Filtered list
  const filteredList = notifications.filter(item => {
    if (selectedFilter === 'UNREAD') return !item.read;
    if (selectedFilter === 'BOOKING') return item.type.startsWith('BOOKING_');
    if (selectedFilter === 'WEATHER') return item.type === 'WEATHER_ALERT';
    if (selectedFilter === 'DISEASE') return item.type === 'DISEASE_ANALYSIS';
    if (selectedFilter === 'MARKET') return item.type === 'MARKET_ALERT';
    if (selectedFilter === 'ADMIN') return item.type === 'ADMIN_ACTIVITY' || item.type === 'SYSTEM';
    return true; // 'ALL'
  });

  return (
    <div className="page-wrapper container" style={{ maxWidth: '900px' }}>
      
      {/* Toast */}
      {toastMessage && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid var(--border-green)',
          color: 'var(--primary-900)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-green)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'var(--primary-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-800)',
            border: '2px solid var(--border-green)'
          }}>
            <Bell size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.45rem', margin: 0, color: 'var(--text-heading)', fontWeight: 800 }}>
                Notifications & Activity
              </h1>
              {unreadCount > 0 && (
                <span className="badge-pill badge-red" style={{ fontSize: '0.72rem' }}>
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.15rem 0 0 0' }}>
              Real-time alerts for equipment bookings, weather hazards, disease tests, and mandi updates
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleMarkAllAsRead}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
            >
              <CheckCheck size={14} />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.some(n => n.read) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClearRead}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}
            >
              <Trash2 size={14} />
              <span>Clear Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Browser Notification Opt-in Banner */}
      {browserPermStatus !== 'granted' && browserPermStatus !== 'unsupported' && (
        <div style={{
          background: '#f8faf7',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-heading)' }}>
            <Volume2 size={16} style={{ color: 'var(--primary-700)' }} />
            <span>Enable browser push alerts for immediate booking responses and weather advisories.</span>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleEnableBrowserNotifications}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}
          >
            Enable Browser Alerts
          </button>
        </div>
      )}

      {/* Filter Category Chips */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        marginBottom: '1.25rem',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {[
          { id: 'ALL', label: `All (${notifications.length})` },
          { id: 'UNREAD', label: `Unread (${unreadCount})` },
          { id: 'BOOKING', label: 'Machinery Bookings' },
          { id: 'WEATHER', label: 'Agro Weather' },
          { id: 'DISEASE', label: 'Crop Health' },
          { id: 'MARKET', label: 'Market Prices' },
          { id: 'ADMIN', label: 'System' }
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setSelectedFilter(f.id)}
            style={{
              padding: '0.35rem 0.8rem',
              fontSize: '0.78rem',
              borderRadius: '20px',
              border: selectedFilter === f.id ? '1px solid var(--primary-700)' : '1px solid var(--border-subtle)',
              background: selectedFilter === f.id ? 'var(--primary-100)' : '#ffffff',
              color: selectedFilter === f.id ? 'var(--primary-900)' : 'var(--text-muted)',
              fontWeight: selectedFilter === f.id ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List Card */}
      <div className="glass-card" style={{ padding: '0.5rem' }}>
        {filteredList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-dim)' }}>
            <Bell size={42} style={{ color: 'var(--border-subtle)', margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              You're all caught up!
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              No notifications found in this category.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                style={{
                  background: item.read ? '#ffffff' : '#f0fdf4',
                  border: item.read ? '1px solid var(--border-subtle)' : '1px solid var(--border-green)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                  
                  {/* Type Icon */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: item.read ? '#f8faf7' : '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {getCategoryIcon(item.type)}
                  </div>

                  {/* Body Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.94rem', color: 'var(--text-heading)' }}>
                        {item.title}
                      </strong>
                      {getSeverityBadge(item.severity)}
                      {!item.read && (
                        <span style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: 'var(--primary-700)',
                          display: 'inline-block'
                        }} />
                      )}
                    </div>

                    <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: '0 0 0.45rem 0', lineHeight: 1.45 }}>
                      {item.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} />
                        {formatRelativeTime(item.created_at)}
                      </span>
                      
                      {item.action_url && (
                        <span style={{ color: 'var(--primary-800)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <span>Open details</span>
                          <ChevronRight size={12} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Individual Action Icons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={(e) => e.stopPropagation()}>
                  {!item.read && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      title="Mark as read"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        padding: '0.3rem',
                        borderRadius: '4px'
                      }}
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    title="Delete notification"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      padding: '0.3rem',
                      borderRadius: '4px'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default NotificationsPage;
