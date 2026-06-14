import React from 'react';

export function AppLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <text 
        x="50" y="50" 
        fontFamily="'Pacifico', cursive" 
        fontSize="64" 
        fill="currentColor" 
        textAnchor="middle" 
        dominantBaseline="central"
      >
        850
      </text>
    </svg>
  );
}
