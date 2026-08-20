import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSkeleton = ({ text = 'Loading AGRO-SMART intelligence...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3.5rem 1rem',
      gap: '1rem',
      color: 'var(--text-muted)'
    }}>
      <Loader2 size={36} className="animate-pulse" style={{ color: 'var(--primary-700)' }} />
      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-heading)' }}>{text}</span>
    </div>
  );
};

export default LoadingSkeleton;
