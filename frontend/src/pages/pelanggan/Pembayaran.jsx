import React, { useState, useEffect, useRef } from "react";
import { getCart } from "../../utils/cart";
import api from '../../utils/api';
import { getImageUrl } from '../../utils/imageUtils';
import BackButton from "../../components/BackButton";
import { StatusNotification } from "../../components";
import useNotification from "../../hooks/useNotification";

const Pembayaran = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metode, setMetode] = useState("");
  const [status, setStatus] = useState("");
  const [orderId, setOrderId] = useState("");
  // Tambahkan state untuk kurir dan ongkir
  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingEta, setShippingEta] = useState('');
  const pollingRef = useRef(null);
  
  // Hook untuk notifikasi
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError("");
      try {
        // Cek apakah ada item yang dipilih dari keranjang
        const selectedCartItems = localStorage.getItem("selectedCartItems");
        
        if (selectedCartItems) {
          // Gunakan item yang dipilih dari keranjang
          const parsedItems = JSON.parse(selectedCartItems);
          setCart(parsedItems);
        } else {
          // Jika tidak ada item yang dipilih, redirect ke keranjang
          window.location.href = '/keranjang';
          return;
        }
        
        // Load shipping cost from localStorage if available
        const savedShippingCost = localStorage.getItem("shippingCost");
        if (savedShippingCost) {
          setShippingCost(Number(savedShippingCost));
        }
      } catch {
        setError("Gagal mengambil data keranjang");
      }
      setLoading(false);
    };
    fetchCart();
  }, []);

  useEffect(() => {
    // Ambil daftar kurir dari backend
    api.get('/rajaongkir/couriers').then(res => setCouriers(res.data)).catch(() => setCouriers([]));
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const shippingCostValue = typeof shippingCost === 'number' ? shippingCost : 
                           shippingCost && typeof shippingCost === 'object' ? shippingCost.value || 0 : 0;
  const total = subtotal + shippingCostValue;
  const totalWeight = cart.reduce((sum, item) => sum + (item.quantity * (item.weight || 0)), 0);
  const [user, setUser] = useState(null);
  const [senderAddress, setSenderAddress] = useState(null);

  // Ambil data user dari server untuk memastikan data terbaru
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/users/profile');
        setUser(response.data);
        console.log('User data from server:', response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback ke localStorage
        const localUser = JSON.parse(localStorage.getItem('user'));
        setUser(localUser);
      }
    };
    
    fetchUserData();
  }, []);

  // Ambil alamat pengirim dari sistem
  useEffect(() => {
    api.get('/rajaongkir/sender-address')
      .then(res => setSenderAddress(res.data))
      .catch(() => {
        // Fallback ke Sintang jika gagal
        setSenderAddress({
          sender_city_id: '255',
          sender_city_name: 'Kabupaten Sintang'
        });
      });
  }, []);

  useEffect(() => {
    // Hitung ongkir otomatis jika kurir dipilih dan alamat user sudah lengkap
    if (selectedCourier && user && user.address && user.city_id && user.province_id && senderAddress) {
      console.log('Calculating shipping cost with:', {
        origin_city_id: senderAddress.sender_city_id,
        destination_city_id: user.city_id,
        origin_city_name: senderAddress.sender_city_name,
        destination_city_name: user.city_name,
        weight: totalWeight,
        courier: selectedCourier
      });
      
      api.post('/rajaongkir/cost', {
        origin_city_id: senderAddress.sender_city_id, // ID kota asal dari sistem
        destination_city_id: user.city_id,
        origin_city_name: senderAddress.sender_city_name, // nama kota asal dari sistem
        destination_city_name: user.city_name, // nama kota tujuan user
        weight: totalWeight, // berat total keranjang
        courier: selectedCourier
      }).then(res => {
        console.log('Shipping response:', res.data);
        // Backend mengirimkan array dengan object yang memiliki cost array
        const shippingOption = res.data[0];
                 if (shippingOption && shippingOption.cost && shippingOption.cost[0]) {
           const costValue = shippingOption.cost[0].value;
           const etaValue = shippingOption.cost[0].etd;
           console.log('Shipping cost value:', costValue);
           console.log('Shipping ETA:', etaValue);
           setShippingCost(costValue);
           // Bersihkan etaValue dari kata "day" dan "hari" jika ada
           const cleanEta = etaValue ? etaValue.replace(/\s*(day|hari)\s*/gi, '').trim() : '';
           setShippingEta(cleanEta || '');
         } else {
           console.log('No shipping cost found, setting to 0');
           setShippingCost(0);
           setShippingEta('');
         }
      }).catch((error) => {
        console.error('Shipping cost error:', error);
        setShippingCost(0);
        setShippingEta('');
      });
    }
  }, [selectedCourier, user, totalWeight, senderAddress]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setOrderId("");
    if (!metode) {
      showWarning('Pilih metode pembayaran terlebih dahulu');
      return;
    }
    if (!selectedCourier) {
      showWarning('Pilih kurir terlebih dahulu agar ongkir dihitung.');
      return;
    }
    
    // Cek data pengiriman dari user yang sudah tersimpan
    if (!user || !user.address || !user.city_id || !user.province_id) {
      showError('Data pengiriman tidak lengkap. Silakan lengkapi profil Anda terlebih dahulu.');
      return;
    }
    
    try {
      const newOrderId = `ORDER-${Date.now()}`;
      setOrderId(newOrderId);
      
             if (metode === 'qris') {
         // QRIS - hanya QRIS yang muncul
         const orderData = {
           order_id: newOrderId,
           gross_amount: total,
           customer: {
             first_name: user?.name || 'Pelanggan',
             email: user?.email || 'user@email.com',
             phone: user?.phone || '08123456789',
            },
            payment_type: 'qris', // Hanya QRIS yang diaktifkan
           items: cart.map(it => ({
             product_id: it.product_id,
             variant_id: it.variant_id || null,
             quantity: it.quantity || 1,
             unit_price: it.price || 0
           })),
            courier: selectedCourier,
            shipping_cost: shippingCost
         };
         
         console.log('=== QRIS ORDER DATA DEBUG ===', {
           orderData,
           shippingCost,
           selectedCourier,
           total
         });
                   const res = await api.post('/payment/midtrans', orderData);
          const { token } = res.data;
          console.log('QRIS payment response:', res.data);
          
          if (!window.snap) {
           showError('Gagal memuat Snap.js');
           return;
         }
         
         // Gunakan Snap untuk QRIS - hanya QRIS yang muncul
         window.snap.pay(token, {
           onSuccess: function(result){ 
             showSuccess('Pembayaran QRIS sukses!'); 
             // Bersihkan localStorage setelah pembayaran sukses
             localStorage.removeItem("selectedCartItems");
             localStorage.removeItem("selectedCartTotal");
             localStorage.removeItem("selectedCartWeight");
             localStorage.removeItem("shippingCost");
             
             // Redirect ke halaman status pembayaran setelah 2 detik
             setTimeout(() => {
               window.location.href = '/pelanggan/status-pembayaran';
             }, 2000);
           },
           onPending: function(result){ 
             showInfo('Menunggu pembayaran QRIS...'); 
           },
           onError: function(result){ 
             showError('Pembayaran QRIS gagal!'); 
           },
           onClose: function(result){ 
             showWarning('Kamu menutup popup QRIS tanpa menyelesaikan pembayaran'); 
           }
         });
         
       } else {
         // Transfer Bank - hanya Virtual Account yang muncul
         const orderData = {
           order_id: newOrderId,
           gross_amount: total,
           customer: {
             first_name: user?.name || 'Pelanggan',
             email: user?.email || 'user@email.com',
             phone: user?.phone || '08123456789',
            },
            payment_type: 'bank_transfer', // Hanya Virtual Account yang diaktifkan
           items: cart.map(it => ({
             product_id: it.product_id,
             variant_id: it.variant_id || null,
             quantity: it.quantity || 1,
             unit_price: it.price || 0
           })),
            courier: selectedCourier,
            shipping_cost: shippingCost
         };
         
         console.log('=== BANK TRANSFER ORDER DATA DEBUG ===', {
           orderData,
           shippingCost,
           selectedCourier,
           total
         });
                   const res = await api.post('/payment/midtrans', orderData);
          const { token } = res.data;
          console.log('Bank transfer payment response:', res.data);
          if (!window.snap) {
           showError('Gagal memuat Snap.js');
           return;
         }
         window.snap.pay(token, {
           onSuccess: function(result){ 
             showSuccess('Pembayaran sukses!'); 
             // Bersihkan localStorage setelah pembayaran sukses
             localStorage.removeItem("selectedCartItems");
             localStorage.removeItem("selectedCartTotal");
             localStorage.removeItem("selectedCartWeight");
             localStorage.removeItem("shippingCost");
             
             // Redirect ke halaman status pembayaran setelah 2 detik
             setTimeout(() => {
               window.location.href = '/pelanggan/status-pembayaran';
             }, 2000);
           },
           onPending: function(result){ showInfo('Menunggu pembayaran...'); },
           onError: function(result){ showError('Pembayaran gagal!'); },
           onClose: function(result){ showWarning('Kamu menutup popup tanpa menyelesaikan pembayaran'); }
         });
       }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMsg = 'Gagal memproses pembayaran: ' + (err.response?.data?.message || err.message);
      setStatus(errorMsg);
      showError(errorMsg);
    }
  };



  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;
  if (!user) return <div className="text-center py-12">Loading user data...</div>;

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 flex-1">
      <div className="max-w-4xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Pembayaran</h2>
            <BackButton to="/cart" text="Kembali ke Keranjang" />
          </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Ringkasan Pesanan</h3>
            
            {/* Cart Items */}
            <div className="mb-8">
              <h4 className="font-semibold text-gray-700 mb-4">Produk</h4>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.cart_id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {item.image_id ? (
                        <img src={getImageUrl(item.image_id)} alt={item.product_name} className="w-16 h-16 object-cover rounded-lg" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-2xl">📦</div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{item.product_name}</div>
                        {item.size && <div className="text-sm text-gray-600">Ukuran: {item.size}</div>}
                        <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-blue-600">Rp{(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            {user && user.address ? (
              <div className="mb-8">
                <h4 className="font-semibold text-gray-700 mb-4">Data Pengiriman</h4>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong className="text-blue-800">Nama:</strong> <span className="text-gray-700">{user.name}</span></div>
                    <div><strong className="text-blue-800">Telepon:</strong> <span className="text-gray-700">{user.phone}</span></div>
                    <div className="md:col-span-2"><strong className="text-blue-800">Alamat:</strong> <span className="text-gray-700">{user.address}</span></div>
                    <div><strong className="text-blue-800">Kota:</strong> <span className="text-gray-700">{user.city_name || user.city_id}</span></div>
                    {user.postal_code && <div><strong className="text-blue-800">Kode Pos:</strong> <span className="text-gray-700">{user.postal_code}</span></div>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <h4 className="font-semibold text-gray-700 mb-4">Data Pengiriman</h4>
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <div className="text-yellow-800 text-sm">
                    <strong>⚠️ Perhatian:</strong> Data pengiriman tidak lengkap. 
                    Silakan lengkapi profil Anda terlebih dahulu.
                  </div>
                </div>
              </div>
            )}

            {/* Price Summary */}
            <div className="border-t pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg text-gray-700">Subtotal ({cart.length} item)</span>
                  <span className="text-xl font-semibold text-gray-900">Rp{subtotal.toLocaleString()}</span>
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Pilih Kurir</label>
                  <select 
                    value={selectedCourier} 
                    onChange={e => setSelectedCourier(e.target.value)} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih Kurir</option>
                    {couriers.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Ongkir</label>
                  <input 
                    type="text" 
                    value={
                      shippingCost && typeof shippingCost === 'number' 
                        ? `Rp${shippingCost.toLocaleString('id-ID')}` 
                        : shippingCost && typeof shippingCost === 'object'
                        ? `Rp${shippingCost.value?.toLocaleString('id-ID') || '0'}`
                        : '-'
                    } 
                    readOnly 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700" 
                  />
                </div>
                
                {shippingEta && (
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">Estimasi Waktu Pengiriman</label>
                    <input 
                      type="text" 
                      value={shippingEta} 
                      readOnly 
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700" 
                    />
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold text-gray-800">Total Pembayaran</span>
                    <span className="text-2xl font-bold text-blue-600">Rp{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Metode Pembayaran</h3>
            
            <div className="space-y-6">
              {/* Bank Transfer Option */}
              <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <input
                  type="radio"
                  id="bank-transfer"
                  name="payment-method"
                  value="bank-transfer"
                  checked={metode === "bank-transfer"}
                  onChange={(e) => setMetode(e.target.value)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="bank-transfer" className="flex items-center space-x-3 cursor-pointer">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-lg">🏦</span>
                    </div>
                    <span className="font-semibold text-gray-900">Transfer Bank / E-Wallet</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-2 ml-11">
                    Pilih Transfer Bank dari popup Midtrans untuk Virtual Account
                  </p>
                </div>
              </div>

              {/* QRIS Option */}
              <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <input
                  type="radio"
                  id="qris"
                  name="payment-method"
                  value="qris"
                  checked={metode === "qris"}
                  onChange={(e) => setMetode(e.target.value)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="qris" className="flex items-center space-x-3 cursor-pointer">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-lg">📱</span>
                    </div>
                    <span className="font-semibold text-gray-900">QRIS</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-2 ml-11">
                    Pilih QRIS atau GoPay dari popup Midtrans (sesuai panduan Midtrans)
                  </p>
                </div>
              </div>
            </div>

            {/* Pay Now Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={!metode}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Bayar Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pembayaran; 