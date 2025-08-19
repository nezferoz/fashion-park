import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearCart, getCart, removeFromCart, updateCartQty } from "../../utils/cart";
import ProductImage from "../../components/ProductImage";
import BackButton from "../../components/BackButton";
import { InlineNotification } from "../../components";
import useNotification from "../../hooks/useNotification";

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

const KeranjangBelanja = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State untuk seleksi produk
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Hook untuk notifikasi
  const { showSuccess, showError, showWarning } = useNotification();

  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      const errorMsg = "Gagal mengambil keranjang";
      setError(errorMsg);
      showError(errorMsg);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn()) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, []);

  // Update selectAll berdasarkan item yang dipilih
  useEffect(() => {
    if (cart.length > 0) {
      const allItems = cart.map(item => `${item.product_id}-${item.variant_id}`);
      const allSelected = allItems.every(item => selectedItems.includes(item));
      setSelectAll(allSelected);
    }
  }, [selectedItems, cart]);

  const handleQtyChange = async (product_id, variant_id, currentQty, delta, maxQty) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (newQty > maxQty) {
      const errorMsg = "Jumlah melebihi stok tersedia!";
      setError(errorMsg);
      showWarning(errorMsg);
      return;
    }
    try {
      await updateCartQty(product_id, variant_id, newQty);
      fetchCart();
      showSuccess("Jumlah produk berhasil diupdate");
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Gagal update jumlah";
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const handleRemove = async (product_id, variant_id) => {
    try {
      await removeFromCart(product_id, variant_id);
      fetchCart();
      showSuccess("Produk berhasil dihapus dari keranjang");
    } catch {
      const errorMsg = "Gagal hapus item";
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      fetchCart();
      showSuccess("Keranjang berhasil dikosongkan");
    } catch {
      const errorMsg = "Gagal kosongkan keranjang";
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  // Fungsi untuk mengelola seleksi produk
  const handleItemSelect = (productId, variantId) => {
    const itemKey = `${productId}-${variantId}`;
    setSelectedItems(prev => {
      if (prev.includes(itemKey)) {
        return prev.filter(item => item !== itemKey);
      } else {
        return [...prev, itemKey];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      const allItems = cart.map(item => `${item.product_id}-${item.variant_id}`);
      setSelectedItems(allItems);
    }
    setSelectAll(!selectAll);
  };

  // Hitung total dari item yang dipilih
  const selectedTotal = cart.reduce((sum, item) => {
    const itemKey = `${item.product_id}-${item.variant_id}`;
    if (selectedItems.includes(itemKey)) {
      return sum + (item.quantity * item.price);
    }
    return sum;
  }, 0);

  // Hitung berat dari item yang dipilih
  const selectedWeight = cart.reduce((sum, item) => {
    const itemKey = `${item.product_id}-${item.variant_id}`;
    if (selectedItems.includes(itemKey)) {
      return sum + (item.quantity * (item.weight || 0));
    }
    return sum;
  }, 0);

  // Item yang dipilih untuk checkout
  const selectedCartItems = cart.filter(item => {
    const itemKey = `${item.product_id}-${item.variant_id}`;
    return selectedItems.includes(itemKey);
  });

  // Fungsi untuk checkout
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      setError("Pilih minimal satu produk untuk checkout");
      return;
    }
    
    // Simpan item yang dipilih ke localStorage
    localStorage.setItem('selectedCartItems', JSON.stringify(selectedCartItems));
    localStorage.setItem('selectedCartTotal', selectedTotal.toString());
    localStorage.setItem('selectedCartWeight', selectedWeight.toString());
    
    // Navigasi ke halaman pembayaran
    navigate("/pelanggan/pembayaran");
  };

  if (!isLoggedIn()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Keranjang Belanja</h2>
          <p className="text-gray-600 mb-4">Silakan login terlebih dahulu untuk melihat keranjang belanja Anda.</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Keranjang belanja Anda kosong.</p>
            <div className="flex gap-4 justify-center">
              <BackButton to="/katalog" text="Mulai Belanja" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Keranjang Belanja</h1>
          <BackButton to="/katalog" text="Kembali ke Katalog" />
        </div>
        
        {error && (
          <InlineNotification
            type="error"
            message={error}
            onClose={() => setError("")}
          />
        )}

        {/* Cart Items Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Pilih Semua</span>
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Produk</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-gray-700">Jumlah</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-700">Harga</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-700">Total</th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cart.map((item) => {
                  const itemKey = `${item.product_id}-${item.variant_id}`;
                  const isSelected = selectedItems.includes(itemKey);
                  
                  return (
                    <tr key={itemKey} className={`${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleItemSelect(item.product_id, item.variant_id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-4">
                          <ProductImage
                            imageId={item.main_image_id}
                            productName={item.product_name}
                            categoryName={item.category_name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{item.product_name}</h3>
                            {item.size && <p className="text-sm text-gray-600">Ukuran: {item.size}</p>}
                            <p className="text-sm text-gray-600">Berat: {item.weight}g</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => handleQtyChange(item.product_id, item.variant_id, item.quantity, -1, item.stock_quantity)}
                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <span className="text-gray-600 font-bold">-</span>
                          </button>
                          <span className="w-12 text-center font-semibold text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => handleQtyChange(item.product_id, item.variant_id, item.quantity, 1, item.stock_quantity)}
                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            disabled={item.quantity >= item.stock_quantity}
                          >
                            <span className="text-gray-600 font-bold">+</span>
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Stok: {item.stock_quantity}</p>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <p className="font-medium text-gray-900">Rp{Number(item.price).toLocaleString('id-ID')}</p>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <p className="text-lg font-bold text-blue-600">Rp{Number(item.price * item.quantity).toLocaleString('id-ID')}</p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => handleRemove(item.product_id, item.variant_id)} 
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Items Summary */}
        {selectedItems.length > 0 && (
          <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Ringkasan Item yang Dipilih</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-blue-700">Jumlah Item</p>
                <p className="text-2xl font-bold text-blue-900">{selectedCartItems.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-700">Total Berat</p>
                <p className="text-2xl font-bold text-blue-900">{selectedWeight}g</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-700">Total Harga</p>
                <p className="text-2xl font-bold text-blue-900">Rp{Number(selectedTotal).toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cart Summary and Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="text-center lg:text-left">
              <p className="text-lg text-gray-600">
                Total: <span className="text-3xl font-bold text-blue-600">Rp{Number(selectedItems.length > 0 ? selectedTotal : total).toLocaleString('id-ID')}</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {selectedItems.length > 0 ? `${selectedItems.length} item dipilih` : `${cart.length} item di keranjang`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                onClick={handleClear}
              >
                Kosongkan Keranjang
              </button>
              <button
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
              >
                {selectedItems.length > 0 ? `Checkout (${selectedItems.length} item)` : 'Pilih Item untuk Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeranjangBelanja; 