import React, { useState } from 'react';
import { getImageUrl } from '../utils/imageUtils';

const CartImageDebug = ({ main_image_id, product_name }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!main_image_id) {
    return (
      <div className="w-16 h-16 bg-red-200 border-2 border-red-400 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">❌</div>
          <div className="text-xs text-red-600">No ID</div>
        </div>
      </div>
    );
  }

  // Use the proper image utility instead of hardcoded localhost
  const url = getImageUrl(main_image_id);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  if (imageError) {
    return (
      <div className="w-16 h-16 bg-yellow-100 border-2 border-yellow-400 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">⚠️</div>
          <div className="text-xs text-yellow-700">Error</div>
          <div className="text-xs text-gray-500">ID: {main_image_id}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-16 h-16 relative">
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      <img
        src={url}
        alt={product_name || 'Product Image'}
        className={`w-full h-full object-cover rounded-lg border-2 border-blue-400 ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: imageLoading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default CartImageDebug;
