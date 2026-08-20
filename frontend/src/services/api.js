/**
 * Base API Client for AGRO-SMART
 * Centralizes all frontend network requests to Flask REST backend
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data.error?.message || data.message || `HTTP ${res.status}`;
      throw new Error(errMsg);
    }
    return data.data !== undefined ? data.data : data;
  } catch (err) {
    console.warn(`[AGRO-SMART API] Endpoint ${endpoint} warning:`, err.message);
    throw err;
  }
}

/**
 * Health check helper
 */
export async function checkBackendHealth() {
  try {
    return await request('/health');
  } catch {
    return {
      status: 'offline',
      database_configured: false,
      weather_service_configured: false,
      disease_service_configured: false
    };
  }
}
