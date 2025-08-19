import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { getImageUrl } from "../utils/imageUtils";
import SimpleImage from "./SimpleImage";

// COPY-PASTE EXACTLY FROM PRODUCTCARD.JSX
const CartImageCopy = ({ product_id, product_name, price, main_image_id, total_stock }) => {
  const navigate = useNavigate();
  const [imageId, setImageId] = useState(main_image_id || null);

  useEffect(() => {
    if (!imageId && product_id) {
      api.get(`/products/${product_id}/images`).then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setImageId(res.data[0].image_id);
        }
      }).catch(() => {});
    }
  }, [imageId, product_id]);

  const imageUrl = getImageUrl(imageId);

  return (
    <div className="w-16 h-16">
      <SimpleImage
        src={imageUrl}
        alt={product_name}
        className="h-full w-full object-cover rounded-lg"
        fallbackIcon="📦"
      />
    </div>
  );
};

export default CartImageCopy;
