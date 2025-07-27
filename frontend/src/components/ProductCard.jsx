import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function formatRupiah(num) {
  if (num === undefined || num === null) return '';
  return 'Rp' + Number(num).toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

const ProductCard = ({ product_id, product_name, price, main_image_id, total_stock }) => {
  const navigate = useNavigate();
  const imageUrl = main_image_id ? `http://localhost:5000/api/products/images/${main_image_id}` : "/no-image.png";

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col">
      <img
        src={imageUrl}
        alt={product_name}
        className="h-48 w-full object-cover"
        onError={e => { e.target.onerror = null; e.target.src = "/no-image.png"; }}
      />
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{product_name}</h3>
          <p className="text-blue-600 font-bold text-xl mb-2">{formatRupiah(price)}</p>
          <p className="text-gray-600 text-sm mb-4">Stok: {total_stock ?? 0}</p>
        </div>
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold mt-auto"
          onClick={() => navigate(`/produk/${product_id}`)}
        >
          Beli
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 