import React from 'react';

interface MedConnectLogoProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'simple';
}

const MedConnectLogo: React.FC<MedConnectLogoProps> = ({ 
  className = '', 
  size = 28,
  variant = 'default'
}) => {
  if (variant === 'simple') {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 28 28" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="MedConnect Logo"
      >
        {/* Main circle */}
        <circle cx="14" cy="14" r="13" fill="#EBF4FF" stroke="#3B82F6" strokeWidth="2" />
        
        {/* Medical cross */}
        <rect x="12" y="7" width="4" height="14" rx="1" fill="#2563EB" />
        <rect x="7" y="12" width="14" height="4" rx="1" fill="#2563EB" />
      </svg>
    );
  }
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 28 28" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="MedConnect Logo"
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EBF5FF" />
          <stop offset="100%" stopColor="#DBEAFE" />
        </linearGradient>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.5" floodColor="#3B82F6" floodOpacity="0.3" />
        </filter>
      </defs>
      
      {/* Main circle with gradient and subtle shadow */}
      <circle 
        cx="14" 
        cy="14" 
        r="13" 
        fill="url(#circleGradient)" 
        stroke="url(#blueGradient)" 
        strokeWidth="2" 
        filter="url(#dropShadow)"
      />
      
      {/* Medical cross with rounded corners and gradient */}
      <rect x="12" y="7" width="4" height="14" rx="2" fill="url(#blueGradient)" />
      <rect x="7" y="12" width="14" height="4" rx="2" fill="url(#blueGradient)" />
      
      {/* Connection element (stylized pulse) with animated feel */}
      <path 
        d="M7 16.5H10L11.5 14L13.5 20L15.5 11L17 16.5H21" 
        stroke="url(#blueGradient)" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#dropShadow)"
      />
    </svg>
  );
};

export default MedConnectLogo; 