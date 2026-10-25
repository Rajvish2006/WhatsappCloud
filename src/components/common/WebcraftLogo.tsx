import React from 'react';

interface WebcraftLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const WebcraftLogo: React.FC<WebcraftLogoProps> = ({ size = 'md', showTagline = true }) => {
  return (
    <div className="flex items-center space-x-2 select-none">
      <svg
        className={size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="40" height="40" rx="10" fill="#2563EB" />
        <path d="M12 14L18 26L22 18L26 26L32 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="text-left">
        <div className="flex items-center space-x-1 font-bold text-slate-800 tracking-tight leading-none text-base sm:text-lg">
          <span>Webcraft</span>
          <span className="text-blue-600">Solution</span>
        </div>
        {showTagline && (
          <span className="text-[9px] text-slate-400 font-medium tracking-tight block -mt-0.5">
            Cloud & WhatsApp Solutions
          </span>
        )}
      </div>
    </div>
  );
};
