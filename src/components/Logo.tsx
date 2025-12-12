import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 48, showText = true }) => {
  const scale = size / 48;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(8, 145, 178, 0.3))' }}
      >
        {/* Outer tech ring with circuit pattern */}
        <circle cx="24" cy="24" r="22" stroke="url(#techGradient)" strokeWidth="1.5" fill="none" />
        
        {/* Circuit nodes around the eye - representing systemic connections */}
        <circle cx="24" cy="3" r="2" fill="#0891b2" />
        <circle cx="45" cy="24" r="2" fill="#06b6d4" />
        <circle cx="24" cy="45" r="2" fill="#0891b2" />
        <circle cx="3" cy="24" r="2" fill="#06b6d4" />
        
        {/* Diagonal circuit nodes - systemic disease connections */}
        <circle cx="39" cy="9" r="1.5" fill="#f59e0b" />
        <circle cx="39" cy="39" r="1.5" fill="#ef4444" />
        <circle cx="9" cy="39" r="1.5" fill="#8b5cf6" />
        <circle cx="9" cy="9" r="1.5" fill="#10b981" />
        
        {/* Connection lines from eye to systemic nodes */}
        <line x1="24" y1="24" x2="39" y2="9" stroke="#f59e0b" strokeWidth="0.5" opacity="0.4" strokeDasharray="2 2" />
        <line x1="24" y1="24" x2="39" y2="39" stroke="#ef4444" strokeWidth="0.5" opacity="0.4" strokeDasharray="2 2" />
        <line x1="24" y1="24" x2="9" y2="39" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.4" strokeDasharray="2 2" />
        <line x1="24" y1="24" x2="9" y2="9" stroke="#10b981" strokeWidth="0.5" opacity="0.4" strokeDasharray="2 2" />
        
        {/* Outer eye shape - sclera */}
        <ellipse 
          cx="24" 
          cy="24" 
          rx="16" 
          ry="10" 
          fill="url(#scleraGradient)" 
          stroke="#0891b2" 
          strokeWidth="1"
        />
        
        {/* Iris outer ring with tech pattern */}
        <circle cx="24" cy="24" r="8" fill="url(#irisOuterGradient)" />
        
        {/* Iris detail rings */}
        <circle cx="24" cy="24" r="7" stroke="url(#irisPatternGradient)" strokeWidth="0.5" fill="none" />
        <circle cx="24" cy="24" r="6" stroke="#0e7490" strokeWidth="0.3" fill="none" opacity="0.6" />
        
        {/* Iris inner with detailed pattern */}
        <circle cx="24" cy="24" r="5.5" fill="url(#irisInnerGradient)" />
        
        {/* Iris texture lines */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
          <line
            key={angle}
            x1={24 + Math.cos(angle * Math.PI / 180) * 3.5}
            y1={24 + Math.sin(angle * Math.PI / 180) * 3.5}
            x2={24 + Math.cos(angle * Math.PI / 180) * 5.2}
            y2={24 + Math.sin(angle * Math.PI / 180) * 5.2}
            stroke="#0e7490"
            strokeWidth="0.4"
            opacity="0.5"
          />
        ))}
        
        {/* Pupil */}
        <circle cx="24" cy="24" r="3" fill="url(#pupilGradient)" />
        
        {/* Tech scan line overlay */}
        <ellipse 
          cx="24" 
          cy="24" 
          rx="16" 
          ry="10" 
          fill="none"
          stroke="url(#scanLineGradient)"
          strokeWidth="0.5"
          strokeDasharray="4 2"
          opacity="0.6"
        />
        
        {/* Light reflection on eye */}
        <ellipse cx="22" cy="22" rx="1.5" ry="1" fill="white" opacity="0.8" />
        <circle cx="26" cy="26" r="0.5" fill="white" opacity="0.5" />
        
        {/* AI/Tech corner accent - top right */}
        <path d="M38 8 L42 8 L42 12" stroke="#0891b2" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M6 40 L10 40 L10 36" stroke="#0891b2" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
        {/* Binary/data dots representing AI analysis */}
        <circle cx="40" cy="14" r="0.8" fill="#0891b2" opacity="0.7" />
        <circle cx="40" cy="17" r="0.8" fill="#06b6d4" opacity="0.5" />
        <circle cx="8" cy="31" r="0.8" fill="#0891b2" opacity="0.7" />
        <circle cx="8" cy="34" r="0.8" fill="#06b6d4" opacity="0.5" />
        
        {/* Gradients definitions */}
        <defs>
          <linearGradient id="techGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.8" />
          </linearGradient>
          
          <radialGradient id="scleraGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </radialGradient>
          
          <radialGradient id="irisOuterGradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#0e7490" />
          </radialGradient>
          
          <linearGradient id="irisPatternGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0e7490" />
          </linearGradient>
          
          <radialGradient id="irisInnerGradient" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#164e63" />
          </radialGradient>
          
          <radialGradient id="pupilGradient" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
          
          <linearGradient id="scanLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <div>
          <h1 style={{ 
            fontSize: `${Math.max(16, size * 0.42)}px`, 
            fontWeight: 700, 
            color: '#111',
            letterSpacing: '-0.5px',
            lineHeight: 1.1,
            margin: 0
          }}>
            Eye<span style={{ color: '#0891b2' }}>Q</span>
          </h1>
          <p style={{ 
            fontSize: `${Math.max(10, size * 0.25)}px`, 
            color: '#6b7280',
            margin: 0,
            letterSpacing: '0.5px'
          }}>
            by LucidEye
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
