/**
 * Base API Client for AGRO-SMART
 * Centralizes all frontend network requests to Flask REST backend with safe response handling
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

    const text = await res.text();
    let data = {};
    if (text && text.trim().length > 0) {
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.warn(`[AGRO-SMART API] Non-JSON response for ${endpoint}:`, text.slice(0, 100));
        data = { message: text };
      }
    }

    if (!res.ok) {
      const errMsg = data.error?.message || data.message || `Unable to retrieve live data (HTTP ${res.status}). Please try again.`;
      throw new Error(errMsg);
    }
    return data.data !== undefined ? data.data : data;
  } catch (err) {
    console.warn(`[AGRO-SMART API] Endpoint ${endpoint} warning:`, err.message);
    if (err.message && (err.message.includes('Unexpected end of JSON input') || err.message.includes('Failed to execute \'json\' on \'Response\''))) {
      throw new Error('Unable to retrieve live weather. Please try again.');
    }
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
