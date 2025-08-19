import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ImageDebugTest from "../components/ImageDebugTest";
import api from "../utils/api";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  console.log('🛒 Cart component rendered at:', new Date().toISOString());

  useEffect(() => {
    console.log('🛒 Cart useEffect triggered');
    
    const token = localStorage.getItem("token");
    console.log('🛒 Token found:', !!token);
    
    if (!token) {
      console.log('❌ No token found, redirecting to login');
      navigate("/login");
      return;
    }
    
    console.log('🛒 Fetching cart data...');
    
    api.get("/cart")
      .then(res => {
        console.log('🛒 Cart API response received');
        console.log('🛒 Cart data received:', res.data);
        console.log('🛒 Cart data length:', res.data.length);
        
        if (res.data && res.data.length > 0) {
          console.log('🛒 First cart item:', res.data[0]);
          console.log('🛒 First item image ID:', res.data[0].main_image_id);
        }
        
        setCart(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error fetching cart:', err);
        console.error('❌ Error response:', err.response?.data);
        console.error('❌ Error status:', err.response?.status);
        setError("Gagal memuat keranjang");
        setLoading(false);
      });
  }, [navigate]);

  console.log('🛒 Current cart state:', cart);
  console.log('🛒 Loading state:', loading);
  console.log('🛒 Error state:', error);

  if (loading) {
    console.log('🛒 Rendering loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat keranjang...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('🛒 Rendering error state:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    console.log('🛒 Rendering empty cart state');
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Keranjang Belanja</h1>
            <p className="text-gray-600 mb-8">Keranjang belanja Anda kosong</p>
            <button
              onClick={() => navigate("/katalog")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Mulai Belanja
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  console.log('🛒 Rendering cart with items:', cart.length);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Keranjang Belanja</h1>
        
        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">🔍 Debug Info</h3>
          <p className="text-yellow-700 text-sm">
            Using ImageDebugTest component to troubleshoot image loading. Check console for detailed logs.
          </p>
          <p className="text-yellow-700 text-sm mt-2">
            Cart items: {cart.length} | First item image ID: {cart[0]?.main_image_id || 'NULL'}
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
          <h2 className="text-xl font-semibold mb-6">Item Keranjang</h2>
          
          <div className="space-y-4">
            {cart.map((item, index) => {
              console.log(`🛒 Rendering cart item ${index}:`, {
                cart_id: item.cart_id,
                product_name: item.product_name,
                main_image_id: item.main_image_id,
                image_id: item.image_id
              });
              
              return (
                <div key={item.cart_id} className="border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                  {/* Gambar Produk - Using Debug Component */}
                  <div className="w-16 h-16 bg-white rounded-lg border-2 border-blue-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <ImageDebugTest
                      imageId={item.main_image_id}
                      productName={item.product_name}
                    />
                  </div>
                  
                  {/* Informasi Produk */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-black">{item.product_name}</h3>
                    {item.size && <p className="text-sm text-gray-600">Ukuran: {item.size}</p>}
                    <p className="text-sm text-gray-600">Berat: {item.weight}g</p>
                    
                    {/* Debug info */}
                    <div className="text-xs text-gray-500 mt-2">
                      <strong>Debug:</strong> main_image_id={item.main_image_id}, image_id={item.image_id}
                    </div>
                  </div>
                  
                  {/* Quantity and Price */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition">-</button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition">+</button>
                    </div>
                    <p className="text-sm text-gray-500">Stok: {item.stock_quantity}</p>
                                    <p className="font-semibold text-blue-600">Rp{Number(item.price).toLocaleString('id-ID')}</p>
                <p className="text-lg font-bold">Total: Rp{Number(item.price * item.quantity).toLocaleString('id-ID')}</p>
                  </div>
                  
                  {/* Action */}
                  <button className="text-red-600 hover:text-red-800 transition px-4 py-2 border border-red-600 rounded hover:bg-red-50">
                    Hapus
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* Cart Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600">
                Total: <span className="font-semibold text-blue-600">Rp{Number(cart.reduce((total, item) => total + (item.price * item.quantity), 0)).toLocaleString('id-ID')}</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">{cart.length} item di keranjang</p>
            </div>
            
            <div className="flex gap-4 mt-4 justify-center">
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition">
                Kosongkan Keranjang
              </button>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                Pilih Item untuk Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;