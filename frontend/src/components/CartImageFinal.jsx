import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { getImageUrl } from "../utils/imageUtils";
import SimpleImage from "./SimpleImage";

const CartImageFinal = ({ product_id, product_name, main_image_id, size = "w-16 h-16" }) => {
  const [imageId, setImageId] = useState(main_image_id || null);

  // EXACT SAME LOGIC AS PRODUCTCARD
  useEffect(() => {
    if (!imageId && product_id) {
      api.get(`/products/${product_id}/images`).then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setImageId(res.data[0].image_id);
        }
      }).catch(() => {});
    }
  }, [imageId, product_id]);

  // EXACT SAME IMAGE URL GENERATION AS PRODUCTCARD
  const imageUrl = getImageUrl(imageId);

  return (
    <div className={size}>
      <SimpleImage
        src={imageUrl}
        alt={product_name}
        className="w-full h-full object-cover rounded-lg"
        fallbackIcon="📦"
      />
    </div>
  );
};

export default CartImageFinal;
