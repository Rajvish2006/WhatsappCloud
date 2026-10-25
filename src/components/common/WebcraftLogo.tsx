import React, { useState } from 'react';

interface WebcraftLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  variant?: 'full' | 'icon' | 'badge';
}

export const WebcraftLogo: React.FC<WebcraftLogoProps> = ({ 
  size = 'md', 
  showTagline = true,
  className = '',
  variant = 'full'
}) => {
  const [imageError, setImageError] = useState(false);

  // Logo asset paths
  const logoPng = '/assets/aistudio/Webcraft_Solution_Ribbon_Logo_577a10a3.png';
  const logoJpg = '/assets/aistudio/Webcraft_Solution_Ribbon_Logo_e5bf5b47.jpg';

  const sizeClasses = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16'
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        {!imageError ? (
          <img 
            src={logoPng} 
            onError={(e) => {
              // Fallback to jpg
              const target = e.currentTarget;
              if (target.src.endsWith('.png')) {
                target.src = logoJpg;
              } else {
                setImageError(true);
              }
            }}
            alt="Webcraft Solution" 
            className={`${sizeClasses[size]} w-auto object-contain drop-shadow-xs`}
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            W
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {!imageError ? (
        <img 
          src={logoPng} 
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src.endsWith('.png')) {
              target.src = logoJpg;
            } else {
              setImageError(true);
            }
          }}
          alt="Webcraft Solution Logo" 
          className={`${sizeClasses[size]} w-auto object-contain rounded-sm`}
        />
      ) : (
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
            W
          </div>
          <div className="text-left">
            <div className={`flex items-center space-x-1.5 font-bold text-slate-900 tracking-tight leading-none ${textSizes[size]}`}>
              <span>Webcraft</span>
              <span className="text-blue-600">Solution</span>
            </div>
            {showTagline && (
              <span className="text-[10px] text-slate-500 font-medium tracking-tight block mt-0.5">
                WhatsApp Cloud API Platform
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
