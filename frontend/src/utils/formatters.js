/**
 * Formatting helpers for currency, percentages, distances, and date strings.
 */

export const formatCurrency = (val) => {
  if (val === undefined || val === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

export const formatPercent = (val) => {
  if (val === undefined || val === null) return '0%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(1)}%`;
};

export const formatDistance = (km) => {
  if (km === undefined || km === null) return '0 km';
  return `${Number(km).toFixed(1)} km away`;
};
