import React from 'react';

interface AspLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const AspLogo: React.FC<AspLogoProps> = ({ size = 'md', showTagline = true }) => {
  return (
    <div className="flex items-center space-x-2 select-none">
      {/* 3 Geometric Triangles from ASP Ai branding */}
      <svg
        className={size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top Triangle: Orange / Amber */}
        <polygon points="20,4 28,18 12,18" fill="#F97316" />
        {/* Bottom Left Triangle: Cyan / Blue */}
        <polygon points="12,18 20,32 4,32" fill="#0EA5E9" />
        {/* Bottom Right Triangle: Emerald / Green */}
        <polygon points="28,18 36,32 20,32" fill="#10B981" />
      </svg>

      <div>
        <div className="flex items-center space-x-1 font-bold text-slate-800 tracking-tight leading-none text-base sm:text-lg">
          <span>ASP</span>
          <span className="text-emerald-600">Ai</span>
        </div>
        {showTagline && (
          <span className="text-[9px] text-slate-400 font-medium tracking-tight block -mt-0.5">
            Connecting efficiencies
          </span>
        )}
      </div>
    </div>
  );
};
