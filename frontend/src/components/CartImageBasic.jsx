import React, { useState } from 'react';
import { getImageUrl } from '../utils/imageUtils';

const CartImageBasic = ({ main_image_id, product_name }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Debug logging
  console.log('🖼️ CartImageBasic Debug:', {
    main_image_id,
    product_name,
    timestamp: new Date().toISOString()
  });

  if (!main_image_id) {
    console.log('❌ No main_image_id provided');
    return (
      <div className="w-16 h-16 bg-gray-200 border-2 border-gray-300 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">📦</div>
          <div className="text-xs text-gray-600">No Image</div>
        </div>
      </div>
    );
  }

  // Use the proper image utility instead of hardcoded localhost
  const imageUrl = getImageUrl(main_image_id);
  
  console.log('🔗 Generated image URL:', imageUrl);

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', imageUrl);
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    console.error('❌ Image failed to load:', imageUrl, 'for product:', product_name);
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
        <div className="absolute inset-0 bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      <img
        src={imageUrl}
        alt={product_name || 'Product Image'}
        className={`w-full h-full object-cover rounded-lg border-2 border-blue-400 ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: imageLoading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default CartImageBasic;
