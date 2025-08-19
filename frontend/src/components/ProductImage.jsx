import React, { useState } from 'react';
import { getFallbackIcon, getImageUrl } from '../utils/imageUtils';

const ProductImage = ({ 
  imageId, 
  productName, 
  categoryName,
  className = "w-16 h-16 object-cover rounded", 
  fallbackIcon,
  ...props 
}) => {
  const [imageState, setImageState] = useState('loading'); // loading, loaded, error

  const handleLoad = () => {
    setImageState('loaded');
  };

  const handleError = () => {
    setImageState('error');
  };

  const getAppropriateFallbackIcon = () => {
    if (fallbackIcon) return fallbackIcon;
    if (categoryName) return getFallbackIcon(categoryName);
    return '📦';
  };

  // Jika tidak ada imageId, langsung tampilkan fallback
  if (!imageId) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center text-gray-400 text-lg`}>
        {getAppropriateFallbackIcon()}
      </div>
    );
  }

  // Generate image URL
  const imageUrl = getImageUrl(imageId);

  // Always render the img tag, but show loading overlay while loading
  return (
    <div className={`${className} relative`}>
      {/* Loading overlay */}
      {imageState === 'loading' && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <div className="text-gray-400 text-xs">...</div>
        </div>
      )}
      
      {/* Error overlay */}
      {imageState === 'error' && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
          <div className="text-gray-400 text-lg">{getAppropriateFallbackIcon()}</div>
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={imageUrl}
        alt={productName || 'Product Image'}
        className={`w-full h-full object-cover rounded ${imageState === 'loading' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
};

export default ProductImage;
