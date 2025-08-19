import React, { useState } from 'react';
import { getImageUrl, getFallbackIcon } from '../utils/imageUtils';

const ProductImageWithLoading = ({ 
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

  // Loading state
  if (imageState === 'loading') {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="text-gray-400 text-xs">...</div>
      </div>
    );
  }

  // Error state
  if (imageState === 'error') {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center text-gray-400 text-lg`}>
        {getAppropriateFallbackIcon()}
      </div>
    );
  }

  // Success state - tampilkan gambar
  return (
    <img
      src={getImageUrl(imageId)}
      alt={productName || 'Product Image'}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

export default ProductImageWithLoading;
