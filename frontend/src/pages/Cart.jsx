import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    api.get("/cart")
      .then(res => {
        setCart(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError("Gagal memuat keranjang");
        setLoading(false);
      });
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat keranjang...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex-1">
        <h2 className="text-2xl font-bold mb-8">Keranjang Belanja</h2>
        {cart.length === 0 ? (
          <div className="text-center text-gray-500">Keranjang kosong</div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Produk</th>
                  <th className="py-2">Harga</th>
                  <th className="py-2">Jumlah</th>
                  <th className="py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.cart_id} className="border-b border-blue-100 last:border-0 bg-white hover:bg-blue-50 transition">
                    <td className="py-2 flex items-center gap-3">
                      {item.image_id ? (
                        <img src={`http://localhost:5000/api/products/images/${item.image_id}`} alt={item.product_name} className="w-12 h-12 object-cover rounded border-2 border-blue-200 bg-white" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">-</div>
                      )}
                      <span className="font-semibold text-black">{item.product_name}</span>
                    </td>
                    <td className="py-2">Rp{item.price.toLocaleString()}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2 font-semibold">Rp{(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right mt-6">
              <span className="font-bold text-lg">Total: Rp{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}</span>
            </div>
            <div className="text-right mt-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition">Checkout</button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart; 