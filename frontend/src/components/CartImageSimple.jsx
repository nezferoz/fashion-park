import React from 'react';
import { getImageUrl } from '../utils/imageUtils';
import SimpleImage from './SimpleImage';

const CartImageSimple = ({ 
  imageId, 
  mainImageId, 
  productName,
  size = "w-16 h-16"
}) => {
  // Use whichever ID is available, same logic as ProductCard
  const finalImageId = imageId || mainImageId;
  
  // Generate image URL using same function as Katalog
  const imageUrl = getImageUrl(finalImageId);

  return (
    <div className={size}>
      <SimpleImage
        src={imageUrl}
        alt={productName}
        className="w-full h-full object-cover rounded-lg"
        fallbackIcon="📦"
      />
    </div>
  );
};

export default CartImageSimple;
