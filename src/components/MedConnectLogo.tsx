import React from 'react';

interface MedConnectLogoProps {
  className?: string;
  size?: number;
}

const MedConnectLogo: React.FC<MedConnectLogoProps> = ({ 
  className = '', 
  size = 28
}) => {
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
      
      {/* Connection element (stylized pulse) */}
      <path 
        d="M7 16.5H10L11.5 14L13.5 20L15.5 11L17 16.5H21" 
        stroke="#2563EB" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MedConnectLogo; 