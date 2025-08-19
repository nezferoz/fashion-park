import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { getImageUrl } from "../utils/imageUtils";
import SimpleImage from "./SimpleImage";

function formatRupiah(num) {
  if (num === undefined || num === null) return '';
  if (!num || num === 0) return 'Rp 0';
  return 'Rp ' + Number(num).toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

const ProductCard = ({ product_id, product_name, price, main_image_id, total_stock }) => {
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

  const handleBuyNow = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    // Siapkan item tunggal untuk pembayaran langsung
    const item = {
      product_id,
      product_name,
      quantity: 1,
      price: Number(price) || 0,
      image_id: main_image_id || null,
      weight: 0,
    };
    localStorage.setItem('selectedCartItems', JSON.stringify([item]));
    localStorage.removeItem('shippingCost');
    navigate('/pelanggan/pembayaran');
  };

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col">
      <SimpleImage
        src={imageUrl}
        alt={product_name}
        className="h-40 sm:h-44 md:h-48 w-full object-cover"
      />
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-1">{product_name}</h3>
          <p className="text-blue-600 font-bold text-lg sm:text-xl mb-1 sm:mb-2">{formatRupiah(price)}</p>
          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">Stok: {total_stock ?? 0}</p>
        </div>
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold text-sm sm:text-base mt-auto"
          onClick={handleBuyNow}
        >
          Beli
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 