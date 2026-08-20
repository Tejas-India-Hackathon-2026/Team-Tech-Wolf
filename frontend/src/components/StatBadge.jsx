import React from 'react';

const StatBadge = ({ label, value, unit, trend, status = 'default' }) => {
  let badgeClass = 'badge-emerald';
  if (status === 'warning' || trend === 'caution') badgeClass = 'badge-amber';
  if (status === 'danger' || trend === 'down') badgeClass = 'badge-red';
  if (status === 'info') badgeClass = 'badge-blue';

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '1.15rem 1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.3rem',
      boxShadow: 'var(--shadow-card)'
    }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-heading)' }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{unit}</span>}
      </div>
      {trend && (
        <span className={`badge-pill ${badgeClass}`} style={{ alignSelf: 'flex-start', marginTop: '0.25rem', fontSize: '0.72rem' }}>
          {trend}
        </span>
      )}
    </div>
  );
};

export default StatBadge;
