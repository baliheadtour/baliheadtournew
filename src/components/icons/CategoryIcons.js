import React from "react";

export const TourIcon = ({ size = 32, className, strokeWidth = 2.25 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Map with pin and dashed route */}
    <path d="M9 25l-4 3c-1 .8-2 .3-2-.8V9c0-.6.3-1 .8-1.3L9 5l14 5 5-3.8c.6-.4 1.2 0 1.2.8v18.2c0 1.1-1 1.6-2 .8L23 30l-14-5z" />
    <path d="M9 25V5" />
    <path d="M23 30V10" />
    <circle cx="16" cy="11.5" r="3.5" />
    <path d="M16 15v3" />
    <path d="M12 21h8" strokeDasharray="2 3" />
  </svg>
);

export const SpaIcon = ({ size = 32, className, strokeWidth = 2.25 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Minimalism Tub with Towel/Bubbles matching source */}
    <path d="M4 14h24v4c0 4.4-3.6 8-8 8H12c-4.4 0-8-3.6-8-8v-4z" />
    <path d="M8 26v2" />
    <path d="M24 26v2" />
    <path d="M7 14V8c0-1.7 1.3-3 3-3h1" />
    <circle cx="18" cy="7" r="1.5" />
    <circle cx="23" cy="10" r="1" />
    <circle cx="25" cy="5" r="1.5" />
  </svg>
);

export const TransportIcon = ({ size = 32, className, strokeWidth = 2.25 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Clean Airbnb style side-view SUV/van */}
    <path d="M5 23H4a2 2 0 0 1-2-2v-9a4 4 0 0 1 4-4h13a4 4 0 0 1 3 1.5L28 16a3 3 0 0 1 1 2v3a2 2 0 0 1-2 2" />
    <circle cx="9" cy="23" r="3" />
    <circle cx="23" cy="23" r="3" />
    <path d="M13 23h6" />
    <path d="M2 15h25.5" />
    <path d="M11 8v14" />
    <path d="M19 8v14" />
  </svg>
);

export const ScooterIcon = ({ size = 32, className, strokeWidth = 2.25 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Minimalist bold step-through scooter */}
    <circle cx="8" cy="25" r="3.5" />
    <circle cx="25" cy="25" r="3.5" />
    <path d="M12.5 25h10.5" />
    {/* Back body contour */}
    <path d="M10 21.5C8 20 6 18.5 6 16c0-3 2-5 5-5h6" />
    <path d="M12 11h-3" />
    {/* Front column & fork */}
    <path d="M25 21.5L22 9" />
    <path d="M18 9h6" />
    <circle cx="25" cy="8" r="1.5" />
    {/* Step through bottom curve joining back body */}
    <path d="M10 21.5c3-1 4-4 4-4v-4" />
    <path d="M23 15L17 15" />
  </svg>
);

export const SideCarIcon = ({ size = 24, className, strokeWidth = 1.25 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H7c-1.1 0-2 .9-2 2v1H3c-.6 0-1 .4-1 1v3c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
    <path d="M14 10v4" />
  </svg>
);

export const SpaBuildingIcon = ({ size = 24, className, strokeWidth = 1.25 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
    <path d="M4 21h16" />
    <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
    <path d="M8 7h.01" />
    <path d="M12 7h.01" />
    <path d="M16 7h.01" />
    <path d="M8 11h.01" />
    <path d="M12 11h.01" />
    <path d="M16 11h.01" />
    <path d="M8 15h.01" />
    <path d="M16 15h.01" />
  </svg>
);

export const ThinSparklesIcon = ({ size = 24, className, strokeWidth = 1.5 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a4.433 4.433 0 0 1 0-8.586L8.5 2.313A2 2 0 0 0 9.937.875l1.582-6.135a4.433 4.433 0 0 1 8.586 0L21.687.875a2 2 0 0 0 1.437 1.438l6.135 1.582a4.433 4.433 0 0 1 0 8.586l-6.135 1.582a2 2 0 0 0-1.437 1.438l-1.582 6.135a4.433 4.433 0 0 1-8.586 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
);

export const TowelsIcon = ({ size = 24, className, strokeWidth = 1.25 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 14a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2z" />
    <path d="M6 10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2" />
    <path d="M6 10V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
  </svg>
);

export const LotusIcon = ({ size = 24, className, strokeWidth = 1.25 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 21s-6-5-6-10.5A5.5 5.5 0 0 1 11.5 5 5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 .5 0A5.5 5.5 0 0 1 18 10.5c0 5.5-6 10.5-6 10.5z" />
    <path d="M12 21s-10-8-10-13a3.5 3.5 0 0 1 7 0" />
    <path d="M12 21s10-8 10-13a3.5 3.5 0 0 0-7 0" />
  </svg>
);

// --- CREATTIE STYLED ICONS ---
export const CreattieTourIcon = ({ size = 28, className, strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="16" cy="8" r="4" fill="var(--color-accent)" />
    <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 3v15" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 6v15" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CreattieSpaIcon = ({ size = 28, className, strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 3C12 3 15 5 15 8C15 11 12 12 12 12C12 12 9 11 9 8C9 5 12 3 12 3Z" fill="var(--color-accent)" />
    <path d="M12 21c-5-2-8-6-8-10 0-4 3-6 3-6s2.5 3.5 5 6c2.5-2.5 5-6 5-6s3 2 3 6c0 4-3 8-8 10z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21v-9" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CreattieScooterIcon = ({ size = 28, className, strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="18" cy="17" r="3" fill="var(--color-accent)" />
    <circle cx="6" cy="17" r="3" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="18" cy="17" r="3" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 17h6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 14L15 6h-3" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 14c0-3 2-4 5-4h4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CreattieTransportIcon = ({ size = 28, className, strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M7 11h9V8H9L7 11z" fill="var(--color-accent)" />
    <path d="M3 16h18v-3c0-1.5-1-2-2-2h-3l-2.5-4H8.5L6 11H4c-1 0-1 1-1 2v3z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="16" r="2.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="17" cy="16" r="2.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CreattieEsimIcon = ({ size = 28, className, strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="15" cy="10" r="1.5" fill="var(--color-accent)" />
    <circle cx="9" cy="14" r="1.5" fill="var(--color-accent)" />
    <circle cx="15" cy="14" r="1.5" fill="var(--color-accent)" />
    <path d="M18 20H6a2 2 0 01-2-2V6a2 2 0 012-2h8l4 4v10a2 2 0 01-2 2z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 10h1" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 14h1" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// --- AIRBNB STYLED ICONS ---
export const AirbnbTourIcon = ({ size = 28, className, strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="9" cy="8" r="2" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 11l-2 3h4l-2-3z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 8l-2 3h4l-2-3z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 14v4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 20h14" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 20l4.5-9 4.5 9" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.5 11l3 8" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AirbnbSpaIcon = ({ size = 28, className, strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M16 18h4v-3h-4v3z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 15v-1c0-.5.5-1 1-1h2c.5 0 1 .5 1 1v1" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="18" cy="11" r="1.5" stroke="currentColor" strokeWidth={strokeWidth}/>
    <path d="M18 12.5V13" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.5 16.5h1" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 18h11v-3H4v3z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 18v2M15 18v2M16 18v2M20 18v2" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 15v-1a2 2 0 00-2-2H5a1 1 0 00-1 1v2" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 13.5v-1a1 1 0 011-1h1" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AirbnbScooterIcon = ({ size = 28, className, strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="7" cy="18" r="3" stroke="currentColor" strokeWidth={strokeWidth} fill="none"/>
    <circle cx="7" cy="18" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
    <circle cx="17" cy="18" r="3" stroke="currentColor" strokeWidth={strokeWidth} fill="none"/>
    <circle cx="17" cy="18" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
    <path d="M10 18h4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 15c0-4 3-5 5-5h3l2.5-4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 10c0-1.5-1-1.5-1-1.5h-4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 8h2.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 15l-1.5 3" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="19.5" cy="8" r="1" stroke="currentColor" strokeWidth={strokeWidth}/>
  </svg>
);

export const AirbnbTransportIcon = ({ size = 28, className, strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 21c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 18c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 15v-6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 9c2-2 4 0 4 0s-1 3-4 0z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 9c-2-2-4 0-4 0s1 3 4 0z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 9c0-3-2-4-2-4s2 1 2 4z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 9c0-3 2-4 2-4s-2 1-2 4z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 15h10v-4c0-1-1-2-2-2H7L5 12v3z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="15" r="1.5" stroke="currentColor" strokeWidth={strokeWidth}/>
    <circle cx="13" cy="15" r="1.5" stroke="currentColor" strokeWidth={strokeWidth}/>
    <path d="M8 9h3v3H8V9z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AirbnbEsimIcon = ({ size = 28, className, strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="8" y="7" width="8" height="12" rx="2" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 10h2" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="1" fill="none"/>
    <path d="M18 10a4 4 0 010 6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 7a8 8 0 010 12" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 10a4 4 0 000 6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 7a8 8 0 000 12" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2v2" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 3l-1-1M14 3l1-1" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
