import React from 'react';
import { getImageUrl } from '../utils/imageUtils';

const CartImageTest = ({ main_image_id, product_name }) => {
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
  const imageUrl = getImageUrl(main_image_id);

  return (
    <div className="w-16 h-16">
      <img
        src={imageUrl}
        alt={product_name}
        className="w-full h-full object-cover rounded-lg border-2 border-blue-400"
        onError={(e) => {
          console.error('Image failed to load:', imageUrl);
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div className="w-full h-full bg-yellow-200 border-2 border-yellow-400 rounded-lg flex items-center justify-center hidden">
        <div className="text-center">
          <div className="text-2xl">⚠️</div>
          <div className="text-xs text-yellow-600">Error</div>
          <div className="text-xs text-gray-500">ID: {main_image_id}</div>
        </div>
      </div>
    </div>
  );
};

export default CartImageTest;
