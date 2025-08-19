import React, { useState, useEffect, useCallback } from 'react';
import { getImageUrl, getFallbackIcon } from '../utils/imageUtils';

const ProductImageRobust = ({ 
  imageId, 
  productName, 
  categoryName,
  className = "w-16 h-16 object-cover rounded", 
  fallbackIcon,
  maxRetries = 2,
  retryDelay = 1000,
  ...props 
}) => {
  const [imageState, setImageState] = useState('loading'); // loading, success, error
  const [retryCount, setRetryCount] = useState(0);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  const getAppropriateFallbackIcon = useCallback(() => {
    if (fallbackIcon) return fallbackIcon;
    if (categoryName) return getFallbackIcon(categoryName);
    return '📦';
  }, [fallbackIcon, categoryName]);

  const handleImageLoad = useCallback(() => {
    setImageState('success');
  }, []);

  const handleImageError = useCallback(() => {
    console.error('Product image failed to load:', imageId, currentImageUrl);
    
    if (retryCount < maxRetries) {
      // Retry dengan delay
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setImageState('loading');
        // Generate new URL untuk bypass cache
        const newUrl = getImageUrl(imageId) + `?retry=${retryCount + 1}&t=${Date.now()}`;
        setCurrentImageUrl(newUrl);
      }, retryDelay);
    } else {
      setImageState('error');
    }
  }, [imageId, currentImageUrl, retryCount, maxRetries, retryDelay]);

  useEffect(() => {
    if (imageId) {
      setImageState('loading');
      setRetryCount(0);
      setCurrentImageUrl(getImageUrl(imageId));
    } else {
      setImageState('error');
      setCurrentImageUrl(null);
    }
  }, [imageId]);

  // Loading state
  if (imageState === 'loading') {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="text-gray-400 text-xs">
          {retryCount > 0 ? `Retry ${retryCount}...` : '...'}
        </div>
      </div>
    );
  }

  // Error state atau tidak ada imageId
  if (imageState === 'error' || !imageId) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center text-gray-400 text-lg`}>
        {getAppropriateFallbackIcon()}
      </div>
    );
  }

  // Success state - tampilkan gambar
  return (
    <img
      src={currentImageUrl}
      alt={productName || 'Product Image'}
      className={className}
      onLoad={handleImageLoad}
      onError={handleImageError}
      {...props}
    />
  );
};

export default ProductImageRobust;
