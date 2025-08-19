import React, { useState } from 'react';

const SimpleImage = ({ src, alt, className = "", fallbackIcon = "📷", ...props }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleError = (e) => {
    console.error('Image failed to load:', src, e);
    setIsLoading(false);
    setImageError(true);
  };

  if (imageError) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center text-gray-400 text-2xl`}>
        {fallbackIcon}
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
          <div className="text-gray-400">...</div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </>
  );
};

export default SimpleImage;
