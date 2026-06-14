import React from 'react';

export function AppLogo({ className = "w-12 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 50" className={className} xmlns="http://www.w3.org/2000/svg">
      <text 
        x="60" y="24" 
        fontFamily="'Pacifico', cursive" 
        fontSize="44" 
        fill="currentColor" 
        textAnchor="middle" 
        dominantBaseline="central"
      >
        Ogden
      </text>
    </svg>
  );
}
