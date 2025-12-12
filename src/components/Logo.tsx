import React from 'react';
import logoSvg from '@/assets/logo.svg';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 48, showText = true }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <img 
        src={logoSvg} 
        alt="EyeQ Logo" 
        style={{ 
          width: size, 
          height: size,
          objectFit: 'contain',
        }} 
      />
      
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
