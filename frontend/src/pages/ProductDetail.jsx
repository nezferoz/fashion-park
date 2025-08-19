import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import ImageWithFallback from "../components/ImageWithFallback";
import Navbar from "../components/Navbar";
import { useLoading } from "../context/LoadingContext";
import api from "../utils/api";
import { addToCart } from "../utils/cart";
import { getImageUrl, testImageUrl } from "../utils/imageUtils";

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
  const [user, setUser] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

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
        
        // Test image URL generation
        console.log('Testing image URL generation...');
        testImageUrl();
        
      } catch (err) {
        console.error('Error fetching product:', err);
        setError("Produk tidak ditemukan");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, setIsLoading]);

  // Fetch user profile to compute shipping estimate based on saved address
  // Hanya fetch jika user sudah login
  useEffect(() => {
    const loadUser = async () => {
      if (!isLoggedIn()) return;
      
      setIsLoadingUser(true);
      try {
        const res = await api.get('/users/profile');
        setUser(res.data);
      } catch (err) {
        console.log('User not logged in or profile fetch failed:', err);
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  // Compute shipping estimate when user and product loaded
  useEffect(() => {
    const computeShipping = async () => {
      if (!user || !product || !isLoggedIn()) return;
      if (!user.city_id) return;
      try {
        const weight = Number(product.weight) && Number(product.weight) > 0 ? Number(product.weight) : 1000;
        const res = await api.post('/shipping/cost', {
          destination_city_id: user.city_id,
          destination_district_id: user.district_id || null,
          destination_postal_code: user.postal_code || null,
          weight
        });
        setShippingInfo(res.data?.data || null);
      } catch (err) {
        console.log('Shipping estimate failed:', err);
        setShippingInfo(null);
      }
    };
    computeShipping();
  }, [user, product]);

  useEffect(() => {
    if (!id) return;
    const fetchImages = async () => {
      try {
        const res = await api.get(`/products/${id}/images`);
        console.log('ProductDetail - Images fetched:', res.data);
        console.log('ProductDetail - Images count:', res.data.length);
        if (res.data.length > 0) {
          console.log('ProductDetail - First image:', res.data[0]);
          console.log('ProductDetail - Image URL will be:', getImageUrl(res.data[0].image_id));
        }
        setImages(res.data);
      } catch (error) {
        console.error('ProductDetail - Error fetching images:', error);
        // Set empty array jika gagal fetch images, jangan set error
        setImages([]);
      }
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

  // Rating dihapus sesuai permintaan

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col">
        {/* Info banner untuk user yang belum login */}
        {!isLoggedIn() && (
          <div className="bg-blue-50 border-b border-blue-200 py-3">
            <div className="container mx-auto px-4 text-center">
              <p className="text-blue-700 text-sm">
                💡 <strong>Belum login?</strong> Anda masih bisa melihat detail produk. 
                <button 
                  onClick={() => navigate('/login', { state: { from: location } })}
                  className="ml-2 text-blue-600 underline hover:text-blue-800"
                >
                  Login sekarang
                </button> 
                untuk menambahkan ke keranjang dan melakukan pembelian.
              </p>
            </div>
          </div>
        )}
        


        <div className="flex flex-col md:flex-row md:items-start gap-12 container mx-auto px-4 py-8">
          {/* Product Images */}
          <div className="md:w-1/2 flex flex-col items-center">
            <div className="w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] md:w-[350px] md:h-[350px] bg-white rounded-xl shadow flex items-center justify-center mb-4 border-2 border-blue-200 overflow-hidden">
              {images.length > 0 ? (
                <ImageWithFallback
                  src={getImageUrl(images[selectedImageIdx]?.image_id)}
                  alt={product.product_name}
                  className="object-contain w-full h-full rounded-xl"
                  fallbackIcon="📷"
                  fallbackText="Gambar tidak tersedia"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📷</div>
                    <div className="text-sm">Gambar tidak tersedia</div>
                  </div>
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 0 && (
              <div className="flex gap-2 mt-2">
                {images.map((img, idx) => (
                  <div key={img.image_id} className="w-16 h-16 rounded border-2 overflow-hidden">
                    <ImageWithFallback
                      src={getImageUrl(img.image_id)}
                      alt={`${product.product_name} - thumbnail ${idx + 1}`}
                      className={`w-full h-full object-cover cursor-pointer ${selectedImageIdx === idx ? "border-blue-400" : "border-blue-100"} bg-white`}
                      onClick={() => setSelectedImageIdx(idx)}
                      fallbackIcon="🖼️"
                      fallbackText=""
                      showFallback={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Product Details */}
          <div className="md:w-1/2 flex flex-col justify-start">
            <h1 className="text-3xl font-bold mb-2 text-black">{product.product_name}</h1>
            {/* Badge sederhana */}
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">ORIGINAL</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-4">Rp{Number(product.price).toLocaleString()}</div>
            {/* Estimasi ongkir berdasarkan alamat pelanggan */}
            {shippingInfo && isLoggedIn() && (
              <div className="mb-2 text-gray-700 font-semibold">
                Ongkir: <span className="font-normal">Rp{Number(shippingInfo.cost).toLocaleString()} (estimasi {shippingInfo.estimated_days} hari)</span>
              </div>
            )}
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
            
            {/* Action buttons */}
            <div className="flex gap-4 mt-6">
              <button
                className="flex-1 bg-blue-400 text-white px-6 py-4 rounded font-bold text-lg hover:bg-blue-500 transition"
                onClick={() => handleAction('cart')}
                disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
              >
                {isLoggedIn() ? 'Masukkan Keranjang' : 'Login untuk Keranjang'}
              </button>
              <button
                className="flex-1 bg-black text-white px-6 py-4 rounded font-bold text-lg hover:bg-gray-900 transition"
                onClick={() => handleAction('buy')}
                disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
              >
                {isLoggedIn() ? 'Beli Sekarang' : 'Login untuk Beli'}
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