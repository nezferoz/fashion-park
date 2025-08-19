import React, { useState } from 'react';
import { getImageUrl, getFallbackIcon } from '../utils/imageUtils';

const ProductImageSimple = ({ 
  imageId, 
  productName, 
  categoryName,
  className = "w-16 h-16 object-cover rounded", 
  fallbackIcon,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  // Tentukan fallback icon yang sesuai
  const getAppropriateFallbackIcon = () => {
    if (fallbackIcon) return fallbackIcon;
    if (categoryName) return getFallbackIcon(categoryName);
    return '📦';
  };

  // Jika tidak ada imageId atau terjadi error, tampilkan fallback
  if (!imageId || hasError) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center text-gray-400 text-lg`}>
        {getAppropriateFallbackIcon()}
      </div>
    );
  }

  return (
    <img
      src={getImageUrl(imageId)}
      alt={productName || 'Product Image'}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default ProductImageSimple;
