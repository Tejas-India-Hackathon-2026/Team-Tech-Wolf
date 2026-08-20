import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  path, 
  badge, 
  iconBg = 'var(--primary-100)',
  iconColor = 'var(--primary-700)',
  actionText = 'Launch Service'
}) => {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
          border: '1px solid rgba(46, 125, 50, 0.15)'
        }}>
          <Icon size={26} />
        </div>
        {badge && (
          <span className="badge-pill badge-emerald">
            {badge}
          </span>
        )}
      </div>

      <h3 style={{ fontSize: '1.3rem', marginBottom: '0.65rem', color: 'var(--text-heading)' }}>
        {title}
      </h3>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: '1.6', marginBottom: '1.75rem', flex: 1 }}>
        {description}
      </p>

      <Link 
        to={path} 
        className="btn btn-secondary" 
        style={{ width: '100%', justifyContent: 'space-between' }}
      >
        <span>{actionText}</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
};

export default FeatureCard;
