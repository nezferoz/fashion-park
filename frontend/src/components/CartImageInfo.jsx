import React from 'react';
import { getImageUrl } from '../utils/imageUtils';

const CartImageInfo = ({ 
  imageId, 
  mainImageId, 
  productName,
  cartId 
}) => {
  const finalId = imageId || mainImageId;
  
  return (
    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
      <h4 className="font-semibold text-gray-800 mb-2">🔍 Image Debug Info</h4>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-medium text-gray-700">Product:</div>
          <div className="text-gray-600">{productName}</div>
        </div>
        
        <div>
          <div className="font-medium text-gray-700">Cart ID:</div>
          <div className="text-gray-600">{cartId}</div>
        </div>
        
        <div>
          <div className="font-medium text-gray-700">Image ID:</div>
          <div className="text-gray-600">{imageId || 'NULL'}</div>
        </div>
        
        <div>
          <div className="font-medium text-gray-700">Main Image ID:</div>
          <div className="text-gray-600">{mainImageId || 'NULL'}</div>
        </div>
        
        <div>
          <div className="font-medium text-gray-700">Final ID Used:</div>
          <div className="text-gray-600">{finalId || 'NULL'}</div>
        </div>
        
        <div>
          <div className="font-medium text-gray-700">Image URL:</div>
          <div className="text-gray-600 break-all">
            {finalId ? getImageUrl(finalId) : 'N/A'}
          </div>
        </div>
      </div>
      
      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
        <div className="text-yellow-800 text-sm">
          <strong>Status:</strong> {finalId ? 'Image ID available but endpoint returns "Gambar tidak ditemukan"' : 'No image ID available'}
        </div>
        <div className="text-yellow-700 text-xs mt-1">
          This indicates the database has no image data for these IDs
        </div>
      </div>
      
      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
        <div className="text-blue-800 text-sm">
          <strong>Solution:</strong> 
        </div>
        <div className="text-blue-700 text-xs mt-1">
          1. Check if product_images table has data<br/>
          2. Verify image IDs in cart table<br/>
          3. Upload images for products<br/>
          4. Update cart with correct image IDs
        </div>
      </div>
    </div>
  );
};

export default CartImageInfo;
