import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, updateCartQty, removeFromCart, clearCart } from "../../utils/cart";

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

const KeranjangBelanja = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      setError("Gagal mengambil keranjang");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn()) fetchCart();
    else setLoading(false);
  }, []);

  const handleQtyChange = async (product_id, variant_id, currentQty, delta, maxQty) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (newQty > maxQty) {
      setError("Jumlah melebihi stok tersedia!");
      return;
    }
    try {
      await updateCartQty(product_id, variant_id, newQty);
      fetchCart();
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal update jumlah");
    }
  };

  const handleRemove = async (product_id, variant_id) => {
    try {
      await removeFromCart(product_id, variant_id);
      fetchCart();
    } catch {
      setError("Gagal hapus item");
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      fetchCart();
    } catch {
      setError("Gagal kosongkan keranjang");
    }
  };

  const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8 border border-blue-100">
        <h2 className="text-2xl font-bold mb-6">Keranjang Belanja</h2>
        {cart.length === 0 ? (
          <div className="text-center text-gray-500">Keranjang kosong</div>
        ) : (
          <>
            <table className="w-full mb-6">
              <thead>
                <tr>
                  <th className="text-left">Produk</th>
                  <th>Gambar</th>
                  <th>Jumlah</th>
                  <th>Harga</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.product_id + '-' + item.variant_id} className="border-b border-blue-100 last:border-0 bg-white hover:bg-blue-50 transition">
                    <td>{item.product_name} <span className="text-xs text-gray-500">({item.size})</span></td>
                    <td className="text-center">
                      {item.image_id ? (
                        <img src={`http://localhost:5000/api/products/images/${item.image_id}`} alt={item.product_name} className="h-12 w-12 object-cover rounded border-2 border-blue-200 bg-white" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleQtyChange(item.product_id, item.variant_id, item.quantity, -1, item.stock_quantity)}
                          className="px-2 py-1 bg-gray-200 rounded"
                          disabled={item.quantity <= 1}
                        >-</button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => handleQtyChange(item.product_id, item.variant_id, item.quantity, 1, item.stock_quantity)}
                          className="px-2 py-1 bg-gray-200 rounded"
                          disabled={item.quantity >= item.stock_quantity}
                        >+</button>
                      </div>
                      <div className="text-xs text-gray-500">Stok: {item.stock_quantity}</div>
                    </td>
                    <td className="text-right">Rp{Number(item.price).toLocaleString()}</td>
                    <td className="text-right font-semibold">Rp{Number(item.quantity * item.price).toLocaleString()}</td>
                    <td className="text-center">
                      <button onClick={() => handleRemove(item.product_id, item.variant_id)} className="text-red-500 hover:underline">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">Total:</span>
              <span className="font-bold text-lg">Rp{total.toLocaleString()}</span>
            </div>
            <div className="flex gap-4">
              <button
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded font-semibold hover:bg-gray-300 transition"
                onClick={handleClear}
              >
                Kosongkan Keranjang
              </button>
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition"
                onClick={() => navigate("/pelanggan/pembayaran")}
              >
                Lanjut ke Pembayaran
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KeranjangBelanja; 