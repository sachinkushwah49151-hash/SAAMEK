import React from 'react';

interface GovEmblemProps {
  className?: string;
  size?: number;
}

export const GovEmblem: React.FC<GovEmblemProps> = ({ className = "h-11 w-auto", size = 44 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Government Emblem of India"
    >
      {/* Outer subtle shield / base */}
      <circle cx="50" cy="50" r="46" stroke="#003366" strokeWidth="2" fill="#F8FAFC" />
      <circle cx="50" cy="50" r="42" stroke="#D97706" strokeWidth="1" strokeDasharray="2 2" fill="none" />
      
      {/* Ashoka Chakra / Central Motif */}
      <circle cx="50" cy="50" r="22" stroke="#003366" strokeWidth="2" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="5" fill="#003366" />
      
      {/* Spokes representation */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <line
          key={deg}
          x1="50"
          y1="50"
          x2={50 + 20 * Math.cos((deg * Math.PI) / 180)}
          y2={50 + 20 * Math.sin((deg * Math.PI) / 180)}
          stroke="#003366"
          strokeWidth="1.2"
        />
      ))}

      {/* Top Pillar Silhouette Elements */}
      <path
        d="M38 20 C38 15, 44 14, 50 14 C56 14, 62 15, 62 20 L58 28 L42 28 Z"
        fill="#003366"
      />
      {/* Left & Right Silhouette */}
      <path
        d="M26 40 C28 32, 34 30, 40 32 L39 44 L28 44 Z"
        fill="#003366"
      />
      <path
        d="M74 40 C72 32, 66 30, 60 32 L61 44 L72 44 Z"
        fill="#003366"
      />

      {/* Base Plinth & Satyameva Jayate Banner representation */}
      <rect x="25" y="74" width="50" height="7" rx="2" fill="#003366" />
      <line x1="28" y1="84" x2="72" y2="84" stroke="#D97706" strokeWidth="2" />
      <text
        x="50"
        y="79"
        textAnchor="middle"
        fontSize="5"
        fontWeight="bold"
        fill="#FFFFFF"
        letterSpacing="0.5"
      >
        सत्यमेव जयते
      </text>
    </svg>
  );
};
