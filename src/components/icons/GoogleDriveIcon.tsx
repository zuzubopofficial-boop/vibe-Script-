import React from 'react';

export const GoogleDriveIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => {
  return (
    <svg viewBox="0 0 87.3 78" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.6 66.85L10.45 73.5C11.25 74.9 12.35 76 13.65 76.8L29.95 48.6H6.6C6.6 50.1 7 51.6 7.8 52.9L6.6 66.85Z"
        fill="#0066DA"
      />
      <path
        d="M43.65 25L29.85 1.1C28.55 1.9 27.45 3 26.65 4.4L.75 50.4C-.05 51.7-.45 53.2-.45 54.7H27.35L43.65 25Z"
        fill="#00AC47"
      />
      <path
        d="M73.55 76.8C74.85 76 75.95 74.9 76.75 73.5L86.75 56.2C87.55 54.9 87.95 53.4 87.95 51.9H60.15L73.55 76.8Z"
        fill="#EA4335"
      />
      <path
        d="M43.65 25L57.45 1.1C56.15.3 54.75 0 53.25 0H34.05C32.55 0 31.15.4 29.85 1.1L43.65 25Z"
        fill="#00832D"
      />
      <path
        d="M59.8 51.9L43.65 25H16.2L32.5 51.9H59.8Z"
        fill="#2684FC"
      />
      <path
        d="M73.55 76.8L57.25 48.6H29.95L46.25 76.8H73.55Z"
        fill="#FFBA00"
      />
    </svg>
  );
};
