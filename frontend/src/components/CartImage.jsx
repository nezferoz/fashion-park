import React, { useState, useEffect } from 'react';
import { getImageUrl, getPlaceholderImage } from '../utils/imageUtils';

const CartImage = ({ 
  imageId, 
  mainImageId, 
  productName, 
  className = "", 
  size = "w-16 h-16",
  showDebug = false 
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});

  // Determine which image ID to use
  const finalImageId = imageId || mainImageId;
  
  useEffect(() => {
    if (!finalImageId) {
      setImageError(true);
      setIsLoading(false);
      setDebugInfo({
        error: 'No image ID provided',
        imageId,
        mainImageId,
        timestamp: new Date().toISOString()
      });
      return;
    }

    const imageUrl = getImageUrl(finalImageId);
    setImageSrc(imageUrl);
    setDebugInfo({
      imageId: finalImageId,
      imageUrl,
      timestamp: new Date().toISOString()
    });

    // Test if image is accessible
    const testImage = new Image();
    testImage.onload = () => {
      setIsLoading(false);
      setImageError(false);
      setDebugInfo(prev => ({ ...prev, status: 'loaded', size: 'accessible' }));
    };
    
    testImage.onerror = () => {
      setIsLoading(false);
      setImageError(true);
      setDebugInfo(prev => ({ ...prev, status: 'error', size: 'failed' }));
    };

    testImage.src = imageUrl;
  }, [finalImageId, imageId, mainImageId]);

  // Get appropriate fallback icon
  const fallbackIcon = getPlaceholderImage(productName);

  if (isLoading) {
    return (
      <div className={`${size} ${className} bg-gray-200 animate-pulse rounded-lg flex items-center justify-center`}>
        <div className="text-gray-400 text-sm">...</div>
      </div>
    );
  }

  if (imageError || !imageSrc) {
    return (
      <div className={`${size} ${className} bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-500`}>
        <div className="text-center">
          <div className="text-2xl">{fallbackIcon}</div>
          {showDebug && (
            <div className="text-xs text-red-500 mt-1">
              ID: {finalImageId || 'NULL'}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${size} ${className} relative`}>
      <img
        src={imageSrc}
        alt={productName}
        className="w-full h-full object-cover rounded-lg border border-gray-200"
        onError={() => {
          setImageError(true);
          setDebugInfo(prev => ({ ...prev, status: 'img_error', size: 'failed' }));
        }}
      />
      
      {/* Debug overlay */}
      {showDebug && (
        <div className="absolute top-0 left-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-tl-lg">
          <div>ID: {finalImageId}</div>
          <div>Status: {debugInfo.status || 'unknown'}</div>
        </div>
      )}
    </div>
  );
};

export default CartImage;
