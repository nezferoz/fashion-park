import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { addToCart } from "../utils/cart";
import api from "../utils/api";
import { useLoading } from "../context/LoadingContext";

const isLoggedIn = () => !!localStorage.getItem('token');

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { setIsLoading } = useLoading();
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = product && product.variants ? product.variants.find(v => String(v.variant_id) === selectedVariantId) : undefined;

  // Filter varian agar hanya satu per ukuran (ambil stok terbanyak jika duplikat)
  const uniqueVariants = product && product.variants ? Object.values(product.variants.reduce((acc, v) => {
    const key = v.size.trim().toLowerCase();
    if (!acc[key] || v.stock_quantity > acc[key].stock_quantity) {
      acc[key] = v;
    }
    return acc;
  }, {})) : [];

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        if (res.data.variants && res.data.variants.length > 0) {
          setSelectedVariantId(String(res.data.variants[0].variant_id));
        }
      } catch {
        setError("Produk tidak ditemukan");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, setIsLoading]);

  useEffect(() => {
    if (!id) return;
    const fetchImages = async () => {
      try {
        const res = await api.get(`/products/${id}/images`);
        setImages(res.data);
      } catch {}
    };
    fetchImages();
  }, [id]);

  useEffect(() => {
    if (selectedVariant) {
      setQuantity(1);
    }
  }, [selectedVariantId]);

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!product) return null;

  const handleAction = (action) => {
    if (!isLoggedIn()) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (action === 'buy') {
      handleBuy();
    } else {
      handleAddToCart();
    }
  };

  const handleAddToCart = async () => {
    setError("");
    setMessage("");
    if (!selectedVariantId) {
      setError("Pilih ukuran terlebih dahulu!");
      return;
    }
    if (!selectedVariant || quantity < 1 || quantity > selectedVariant.stock_quantity) {
      setError("Jumlah tidak valid atau stok tidak cukup!");
      return;
    }
    try {
      await addToCart(product.product_id, selectedVariantId, quantity);
      setMessage(`Produk ${product.product_name} (${selectedVariant?.size}) ditambahkan ke keranjang!`);
    } catch (err) {
      setError("Gagal menambahkan ke keranjang.");
    }
  };

  const handleBuy = async () => {
    setError("");
    setMessage("");
    if (!selectedVariantId) {
      setError("Pilih ukuran terlebih dahulu!");
      return;
    }
    if (!selectedVariant || quantity < 1 || quantity > selectedVariant.stock_quantity) {
      setError("Jumlah tidak valid atau stok tidak cukup!");
      return;
    }
    try {
      await addToCart(product.product_id, selectedVariantId, quantity);
      navigate("/cart");
    } catch (err) {
      setError("Gagal memproses pembelian.");
    }
  };

  // Dummy rating & review
  const rating = 4.8;
  const reviewCount = 713;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row md:items-start gap-12 container mx-auto px-4 py-12">
          {/* Product Images */}
          <div className="md:w-1/2 flex flex-col items-center">
            <div className="w-[350px] h-[350px] bg-white rounded-xl shadow flex items-center justify-center mb-4 border-2 border-blue-200">
              {images.length > 0 ? (
                <img
                  src={`http://localhost:5000/api/products/images/${images[selectedImageIdx]?.image_id}`}
                  alt={product.product_name}
                  className="object-contain w-full h-full rounded-xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2 mt-2">
              {images.map((img, idx) => (
                <img
                  key={img.image_id}
                  src={`http://localhost:5000/api/products/images/${img.image_id}`}
                  alt={product.product_name}
                  className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${selectedImageIdx === idx ? "border-blue-400" : "border-blue-100"} bg-white`}
                  onClick={() => setSelectedImageIdx(idx)}
                />
              ))}
            </div>
          </div>
          {/* Product Details */}
          <div className="md:w-1/2 flex flex-col justify-start">
            <h1 className="text-3xl font-bold mb-2 text-black">{product.product_name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">ORIGINAL</span>
              <span className="text-blue-400 font-bold flex items-center">
                {rating} <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5 inline"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>
              </span>
              <span className="text-gray-600 text-sm">{reviewCount} Penilaian</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-4">Rp{Number(product.price).toLocaleString()}</div>
            <div className="mb-2 text-gray-700 font-semibold">Ongkir: <span className="font-normal">Rp10.000 - Rp20.000 (estimasi)</span></div>
            <div className="mb-4 text-gray-700">{product.description}</div>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-semibold text-black">Stok:</span> <span className="text-black">{selectedVariant ? selectedVariant.stock_quantity : '-'}</span>
            </div>
            {/* Size Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <div className="font-semibold mb-2 text-black">SIZE</div>
                <div className="flex gap-2 flex-wrap">
                  {uniqueVariants.map(variant => (
                    <button
                      key={variant.variant_id}
                      className={`px-4 py-2 rounded border font-semibold transition ${selectedVariantId === String(variant.variant_id) ? "bg-blue-400 text-white border-blue-400" : "bg-white text-black border-blue-100 hover:bg-blue-50"}`}
                      onClick={() => setSelectedVariantId(String(variant.variant_id))}
                    >
                      {variant.size} (stok: {variant.stock_quantity})
                    </button>
                  ))}
                </div>
                {/* Input jumlah */}
                {selectedVariant && (
                  <div className="mt-4 flex items-center gap-2">
                    <label className="font-semibold text-black">Jumlah:</label>
                    <input
                      type="number"
                      min={1}
                      max={selectedVariant.stock_quantity}
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, Math.min(selectedVariant.stock_quantity, Number(e.target.value))))}
                      className="border rounded px-2 py-1 w-20"
                      disabled={selectedVariant.stock_quantity === 0}
                    />
                    <span className="text-gray-500 text-sm">/ stok: {selectedVariant.stock_quantity}</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-4 mt-6">
              <button
                className="flex-1 bg-blue-400 text-white px-6 py-4 rounded font-bold text-lg hover:bg-blue-500 transition"
                onClick={() => handleAction('cart')}
                disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
              >
                Masukkan Keranjang
              </button>
              <button
                className="flex-1 bg-black text-white px-6 py-4 rounded font-bold text-lg hover:bg-gray-900 transition"
                onClick={() => handleAction('buy')}
                disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
              >
                Beli Sekarang
              </button>
            </div>
            {message && <div className="mt-4 text-green-600 font-semibold">{message}</div>}
            {error && <div className="mt-4 text-red-600 font-semibold">{error}</div>}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail; 