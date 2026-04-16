import React from 'react';

/**
 * ==========================================
 * LOADER COMPONENT - Loading Spinner
 * ==========================================
 * Reusable animated loading indicator with optional text
 * 
 * Props:
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - text: Optional loading text to display
 * - fullScreen: boolean - if true, takes full viewport height
 */

const Loader = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
  // Size configurations
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50'
    : 'flex flex-col items-center justify-center';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div
          className={`
            ${sizeClasses[size]}
            border-gray-200
            border-t-blue-500
            rounded-full
            animate-spin
            shadow-lg
          `}
          role="status"
          aria-label="Loading"
        />

        {/* Loading text */}
        {text && (
          <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loader;

