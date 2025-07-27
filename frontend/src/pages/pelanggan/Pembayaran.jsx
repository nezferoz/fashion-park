import React, { useState, useEffect, useRef } from "react";
import { getCart } from "../../utils/cart";
import api from '../../utils/api';
import QRCode from 'qrcode.react';

const Pembayaran = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metode, setMetode] = useState("");
  const [status, setStatus] = useState("");
  const [qrisString, setQrisString] = useState("");
  const [orderId, setOrderId] = useState("");
  const pollingRef = useRef(null);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getCart();
        setCart(data);
      } catch {
        setError("Gagal mengambil data keranjang");
      }
      setLoading(false);
    };
    fetchCart();
  }, []);

  const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setQrisString("");
    setOrderId("");
    if (!metode) {
      setStatus('Pilih metode pembayaran terlebih dahulu');
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const newOrderId = `ORDER-${Date.now()}`;
      setOrderId(newOrderId);
      if (metode === 'qris') {
        // Langsung request ke endpoint QRIS Core API
        const res = await api.post('/payment/qris', {
          order_id: newOrderId,
          gross_amount: total
        });
        setQrisString(res.data.qr_string);
        setStatus('Silakan scan QRIS di bawah ini untuk membayar');
      } else {
        // Transfer pakai Snap
        const orderData = {
          order_id: newOrderId,
          gross_amount: total,
          customer: {
            first_name: user?.name || 'Pelanggan',
            email: user?.email || 'user@email.com',
            phone: user?.phone || '08123456789',
          },
          payment_type: 'bank_transfer',
        };
        const res = await api.post('/payment/midtrans', orderData);
        const { token } = res.data;
        if (!window.snap) {
          setStatus('Gagal memuat Snap.js');
          return;
        }
        window.snap.pay(token, {
          onSuccess: function(result){ setStatus('Pembayaran sukses!'); },
          onPending: function(result){ setStatus('Menunggu pembayaran...'); },
          onError: function(result){ setStatus('Pembayaran gagal!'); },
          onClose: function(){ setStatus('Kamu menutup popup tanpa menyelesaikan pembayaran'); }
        });
      }
    } catch (err) {
      setStatus('Gagal memproses pembayaran');
    }
  };

  // Polling status pembayaran QRIS
  useEffect(() => {
    if (orderId && qrisString) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await api.get(`/transactions/status/${orderId}`);
          if (res.data.transaction_status === 'settlement') {
            setStatus('Pembayaran QRIS berhasil!');
            clearInterval(pollingRef.current);
          } else if (res.data.transaction_status === 'expire') {
            setStatus('QRIS sudah kadaluarsa, silakan ulangi pembayaran');
            clearInterval(pollingRef.current);
          }
        } catch (err) {
          // ignore error
        }
      }, 5000);
      return () => clearInterval(pollingRef.current);
    }
  }, [orderId, qrisString]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-6">Pembayaran</h2>
        <div className="mb-6">
          <table className="w-full mb-2">
            <thead>
              <tr>
                <th className="text-left">Produk</th>
                <th>Jumlah</th>
                <th>Harga</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.product_id}>
                  <td>{item.product_name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">Rp{Number(item.price).toLocaleString()}</td>
                  <td className="text-right font-semibold">Rp{Number(item.quantity * item.price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>Rp{total.toLocaleString()}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block font-medium mb-1">Metode Pembayaran</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={metode}
              onChange={(e) => setMetode(e.target.value)}
              required
            >
              <option value="">Pilih Metode</option>
              <option value="transfer">Transfer</option>
              <option value="qris">QRIS</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Nominal</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 bg-gray-100"
              value={total}
              readOnly
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition">
            Bayar
          </button>
        </form>
        {status && (
          <div className="bg-green-100 text-green-700 p-4 rounded text-center font-semibold">
            Status Pembayaran: {status}
          </div>
        )}
        {qrisString && (
          <div className="flex flex-col items-center mt-6">
            <QRCode value={qrisString} size={256} />
            <p className="mt-2 text-gray-600">Scan QRIS di atas dengan aplikasi e-wallet Anda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pembayaran; 