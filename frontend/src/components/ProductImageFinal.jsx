import React, { useState, useEffect } from 'react';
import { getImageUrl, getFallbackIcon } from '../utils/imageUtils';

const ProductImageFinal = ({ 
  imageId, 
  productName, 
  categoryName,
  className = "w-16 h-16 object-cover rounded", 
  fallbackIcon,
  showLoading = true,
  ...props 
}) => {
  const [imageState, setImageState] = useState('initial');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  const getAppropriateFallbackIcon = () => {
    if (fallbackIcon) return fallbackIcon;
    if (categoryName) return getFallbackIcon(categoryName);
    return '📦';
  };

  const handleImageLoad = () => {
    setImageState('loaded');
  };

  const handleImageError = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setImageState('retrying');
      // Retry dengan delay dan cache busting
      setTimeout(() => {
        setImageState('loading');
      }, 500);
    } else {
      setImageState('error');
    }
  };

  useEffect(() => {
    if (imageId) {
      setImageState('loading');
      setRetryCount(0);
    } else {
      setImageState('error');
    }
  }, [imageId]);

  // Jika tidak ada imageId atau terjadi error setelah retry
  if (!imageId || imageState === 'error') {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center text-gray-400 text-lg`}>
        {getAppropriateFallbackIcon()}
      </div>
    );
  }

  // Loading state
  if (showLoading && (imageState === 'loading' || imageState === 'retrying')) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="text-gray-400 text-xs">
          {imageState === 'retrying' ? `Retry ${retryCount}...` : '...'}
        </div>
      </div>
    );
  }

  // Tampilkan gambar dengan retry mechanism
  const imageUrl = getImageUrl(imageId);
  const finalUrl = retryCount > 0 ? `${imageUrl}?retry=${retryCount}&t=${Date.now()}` : imageUrl;

  return (
    <img
      src={finalUrl}
      alt={productName || 'Product Image'}
      className={className}
      onLoad={handleImageLoad}
      onError={handleImageError}
      {...props}
    />
  );
};

export default ProductImageFinal;
