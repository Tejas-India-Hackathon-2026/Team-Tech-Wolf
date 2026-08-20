/**
 * Base API Client for AGRO-SMART
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
      throw new Error(data.message || `HTTP ${res.status}`);
    }
    return data.data !== undefined ? data.data : data;
  } catch (err) {
    console.warn(`[AGRO-SMART API] Endpoint ${endpoint} failed, utilizing resilient client fallback:`, err.message);
    throw err;
  }
}
