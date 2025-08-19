import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import { FaUser, FaClipboardList, FaHistory, FaBars, FaTimes, FaSync } from 'react-icons/fa';

const StatusPesanan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previousOrders, setPreviousOrders] = useState([]);
  // State untuk tracking
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  
  // State untuk notifikasi
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [enableSound, setEnableSound] = useState(true);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
      startPolling();
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [user]);

  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(() => {
      console.log('🔄 Auto-refreshing orders...');
      fetchOrders(true);
    }, 30000);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchOrders(false);
  };

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      
      const response = await api.get('/transactions');
      
      if (response.data && Array.isArray(response.data)) {
        if (orders.length > 0 && !silent) {
          const hasStatusChanges = detectStatusChanges(orders, response.data);
          if (hasStatusChanges) {
            setShowUpdateNotification(true);
            setTimeout(() => setShowUpdateNotification(false), 5000);
            
            if (enableSound) {
              playNotificationSound();
            }
          }
        }
        
        setPreviousOrders(orders);
        setOrders(response.data);
        setLastUpdate(new Date());
      } else {
        setOrders([]);
      }
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const detectStatusChanges = (oldOrders, newOrders) => {
    if (!oldOrders || !newOrders || oldOrders.length === 0 || newOrders.length === 0) {
      return false;
    }

    const oldStatusMap = new Map();
    oldOrders.forEach(order => {
      oldStatusMap.set(order.transaction_id || order.id, order.status || order.payment_status);
    });

    for (const newOrder of newOrders) {
      const orderId = newOrder.transaction_id || newOrder.id;
      const oldStatus = oldStatusMap.get(orderId);
      const newStatus = newOrder.status || newOrder.payment_status;
      
      if (oldStatus && oldStatus !== newStatus) {
        console.log(`🔄 Status changed for order ${orderId}: ${oldStatus} → ${newStatus}`);
        return true;
      }
    }

    return false;
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'menunggu pembayaran':
        return 'Menunggu Pembayaran';
      case 'success':
      case 'diproses':
        return 'Sedang Diproses';
      case 'dikirim':
        return 'Pesanan Dikirim';
      case 'selesai':
        return 'Pesanan Selesai';
      case 'dibatalkan':
      case 'cancel':
        return 'Pesanan Dibatalkan';
      default:
        return status || 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'menunggu pembayaran':
        return 'bg-yellow-100 text-yellow-800';
      case 'success':
      case 'diproses':
        return 'bg-blue-100 text-blue-800';
      case 'dikirim':
        return 'bg-purple-100 text-purple-800';
      case 'selesai':
        return 'bg-green-100 text-green-800';
      case 'dibatalkan':
      case 'cancel':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Sound notification not supported:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Tanggal tidak valid';
    }
  };

  const fetchTrackingData = async (order) => {
    try {
      setTrackingLoading(true);
      setCurrentOrder(order);
      
      console.log('🚚 Fetching tracking data for:', order.waybill_number, order.courier);
      
      // Tambahkan cache busting dan headers yang lebih spesifik
      const timestamp = Date.now();
      const url = `/api/binderbyte/track?waybill=${order.waybill_number}&courier=${order.courier}&_t=${timestamp}`;
      
      console.log('🚚 Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('📡 Response received:', response);
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      console.log('📡 Response headers:', response.headers);
      
      // Log semua headers untuk debugging
      for (let [key, value] of response.headers.entries()) {
        console.log(`📡 Header ${key}:`, value);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Cek content-type untuk memastikan response adalah JSON
      const contentType = response.headers.get('content-type');
      console.log('📡 Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('⚠️ Response is not JSON, content-type:', contentType);
        // Coba ambil response text untuk debugging
        const textResponse = await response.text();
        console.warn('⚠️ Response text (first 200 chars):', textResponse.substring(0, 200));
        throw new Error(`Expected JSON but got ${contentType}`);
      }
      
      const data = await response.json();
      console.log('📦 Raw response data:', data);
      console.log('📦 Data type:', typeof data);
      console.log('📦 Data keys:', Object.keys(data));
      
      if (data.success && data.data) {
        console.log('✅ Valid tracking data found, setting state');
        console.log('✅ Tracking result:', data.data);
        setTrackingData(data.data);
      } else {
        console.log('⚠️ No valid tracking data in response');
        console.log('⚠️ success exists:', !!data.success);
        console.log('⚠️ data exists:', !!(data.success && data.data));
        setTrackingData(null);
      }
      
      setShowTrackingModal(true);
    } catch (error) {
      console.error('❌ Error fetching tracking data:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        order: order
      });
      setTrackingData(null);
      setShowTrackingModal(true);
    } finally {
      setTrackingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="lg:hidden bg-blue-600 text-white p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Fashion Park</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-2"
          >
            {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
            <div className="fixed left-0 top-0 h-full w-64 bg-blue-600 text-white shadow-lg">
              <div className="flex items-center justify-between h-16 px-6 font-bold text-xl border-b border-blue-700">
                <span>Fashion Park</span>
                <button onClick={() => setSidebarOpen(false)}>
                  <FaTimes size={20} />
                </button>
              </div>
              
              <nav className="flex-1 flex flex-col gap-2 px-4 py-6">
                <button
                  onClick={() => { navigate('/pelanggan/profile'); setSidebarOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium border-l-4 text-white hover:bg-blue-700"
                >
                  <FaUser className="text-lg" />
                  <span>Akun</span>
                </button>
                <button
                  onClick={() => { navigate('/pelanggan/status-pesanan'); setSidebarOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-bold border-l-4 bg-white text-blue-600 border-blue-700"
                >
                  <FaClipboardList className="text-lg text-blue-600" />
                  <span>Pesanan</span>
                </button>
                <button
                  onClick={() => { navigate('/pelanggan/riwayat'); setSidebarOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium border-l-4 text-white hover:bg-blue-700"
                >
                  <FaHistory className="text-lg" />
                  <span>Riwayat Belanja</span>
                </button>
                
                <div className="mt-6 pt-6 border-t border-blue-700">
                  <button
                    onClick={() => { navigate('/'); setSidebarOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium border-l-4 text-white hover:bg-blue-700 w-full"
                  >
                    <span className="text-xl">←</span>
                    <span>Kembali ke Beranda</span>
                  </button>
                </div>
              </nav>
              
              <div className="px-4 py-4 border-t border-blue-700">
                <span className="block text-sm font-semibold text-white">{user?.name || 'pelanggan'} (pelanggan)</span>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-blue-600 text-white flex flex-col shadow-lg min-h-screen">
          <div className="flex items-center h-16 px-6 font-bold text-2xl border-b border-blue-700">
            <span>Fashion Park</span>
          </div>
          
          <nav className="flex-1 flex flex-col gap-2 px-4 py-6">
            <button
              onClick={() => navigate('/pelanggan/profile')}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium border-l-4 text-white hover:bg-blue-700"
            >
              <FaUser className="text-lg" />
              <span>Akun</span>
            </button>
            <button
              onClick={() => navigate('/pelanggan/status-pesanan')}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-bold border-l-4 bg-white text-blue-600 border-blue-700"
            >
              <FaClipboardList className="text-lg text-blue-600" />
              <span>Pesanan</span>
            </button>
            <button
              onClick={() => navigate('/pelanggan/riwayat')}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium border-l-4 text-white hover:bg-blue-700"
            >
              <FaHistory className="text-lg" />
              <span>Riwayat Belanja</span>
            </button>
            
            <div className="mt-6 pt-6 border-t border-blue-700">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium border-l-4 text-white hover:bg-blue-700 w-full"
              >
                <span className="text-xl">←</span>
                <span>Kembali ke Beranda</span>
              </button>
            </div>
          </nav>
          
          <div className="px-4 py-4 border-t border-blue-700">
            <span className="block text-sm font-semibold text-white">{user?.name || 'pelanggan'} (pelanggan)</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div className="max-w-6xl mx-auto">
            
            {/* Notifikasi Update Status */}
            {showUpdateNotification && (
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg shadow-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-white text-lg">🔄</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-green-800">Status Pesanan Diperbarui!</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Status pesanan Anda telah diperbarui oleh admin. Data telah diperbarui secara otomatis.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                        Real-time Update
                      </span>
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                        Auto-refresh Aktif
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUpdateNotification(false)}
                    className="text-green-400 hover:text-green-600 transition-colors p-1 rounded-full hover:bg-green-100"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>
            )}
            
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Status Pesanan</h1>
                  <p className="text-gray-600 mt-2">Lacak status pesanan Anda</p>
                  {lastUpdate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Terakhir diperbarui: {lastUpdate.toLocaleTimeString('id-ID')}
                    </p>
                  )}
                </div>
                
                {/* Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isRefreshing 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                    }`}
                  >
                    <FaSync className={`text-sm ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Memperbarui...' : 'Refresh'}</span>
                  </button>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className={`w-2 h-2 rounded-full ${pollingIntervalRef.current ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span>Auto-refresh: {pollingIntervalRef.current ? 'Aktif' : 'Nonaktif'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <button
                      onClick={() => setEnableSound(!enableSound)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        enableSound 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {enableSound ? '🔊' : '🔇'}
                    </button>
                    <span>Notif Suara</span>
                  </div>
                </div>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum ada pesanan</h3>
                <p className="text-gray-600 mb-6">Mulai berbelanja untuk melihat status pesanan di sini</p>
                <button
                  onClick={() => navigate('/katalog')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const isRecentlyUpdated = previousOrders.some(prevOrder => {
                    const prevId = prevOrder.transaction_id || prevOrder.id;
                    const currentId = order.transaction_id || order.id;
                    if (prevId === currentId) {
                      const prevStatus = prevOrder.status || prevOrder.payment_status;
                      const currentStatus = order.status || order.payment_status;
                      return prevStatus && prevStatus !== currentStatus;
                    }
                    return false;
                  });

                  return (
                    <div 
                      key={order.transaction_id || order.id} 
                      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
                        isRecentlyUpdated ? 'ring-2 ring-green-400 shadow-lg' : ''
                      }`}
                    >
                      {/* Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">📋</span>
                            <div>
                              <h3 className="font-semibold text-lg">{getStatusText(order.status || order.payment_status)}</h3>
                              <p className="text-blue-100 text-sm">{formatDate(order.transaction_date)}</p>
                              {order.updated_at && (
                                <p className="text-blue-200 text-xs mt-1">
                                  Diupdate: {formatDate(order.updated_at)}
                                </p>
                              )}
                              {isRecentlyUpdated && (
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full animate-pulse">
                                    🔄 Baru Diupdate
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-center sm:text-right">
                            <p className="text-sm text-blue-100">Order #{order.transaction_id || order.id}</p>
                            <p className="text-sm text-blue-200">
                              Total: Rp{Number(order.total_amount || order.total || 0).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-semibold">
                              Fashion Park
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900 text-lg">Official Store</span>
                              <span className="text-gray-400 text-xl">→</span>
                            </div>
                          </div>
                          <span className={`text-sm font-medium px-4 py-2 rounded-lg border ${getStatusColor(order.status || order.payment_status)}`}>
                            {getStatusText(order.status || order.payment_status)}
                          </span>
                        </div>
                      </div>

                      {/* Order Info */}
                      <div className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start space-x-4">
                            <span className="text-2xl">🚚</span>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg mb-2">
                                {formatDate(order.transaction_date)} - {getStatusText(order.status || order.payment_status)}
                              </h4>
                              <p className="text-gray-600 mb-4">
                                {order.payment_status === 'success' ? 'Pesanan telah selesai' : 
                                 order.payment_status === 'pending' ? 'Menunggu konfirmasi pembayaran' :
                                 order.payment_status === 'failed' ? 'Pembayaran gagal' :
                                 'Status pesanan diperbarui'}
                              </p>
                              
                              {/* Shipping Info */}
                              {(order.payment_method === 'DIGITAL' || order.payment_method === 'QRIS') && (
                                <>
                                  {order.waybill_number && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                                      <p className="text-sm text-green-800 font-medium">
                                        📦 Nomor Resi: {order.waybill_number}
                                      </p>
                                      {order.courier && (
                                        <p className="text-sm text-green-700 mt-1">
                                          🚚 Kurir: {order.courier.toUpperCase()}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  
                                  {!order.waybill_number && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                                      <p className="text-sm text-blue-800 font-medium">
                                        📦 Estimasi pengiriman: 2-3 hari kerja
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                              
                              {order.payment_method === 'CASH' && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                                  <p className="text-sm text-yellow-800 font-medium">
                                    💰 Pembayaran Tunai - Tidak memerlukan resi
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price Summary */}
                      <div className="p-6 bg-gray-50 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 text-lg mb-4">Rincian Harga</h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Produk:</span>
                            <span className="font-medium">
                              Rp{Number(order.total_amount || 0).toLocaleString('id-ID')}
                            </span>
                          </div>
                          
                          {order.shipping_cost > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Ongkir:</span>
                              <span className="font-medium text-green-600">
                                Rp{Number(order.shipping_cost || 0).toLocaleString('id-ID')}
                              </span>
                            </div>
                          )}
                          
                          {order.fee_amount > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Biaya Admin:</span>
                              <span className="font-medium text-orange-600">
                                Rp{Number(order.fee_amount || 0).toLocaleString('id-ID')}
                              </span>
                            </div>
                          )}
                          
                          <div className="border-t border-gray-300 pt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-lg text-gray-900">Total Pembayaran:</span>
                              <span className="font-bold text-2xl text-blue-600">
                                Rp{Number(
                                  (Number(order.total_amount || 0) + 
                                   Number(order.shipping_cost || 0) + 
                                   Number(order.fee_amount || 0))
                                ).toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => navigate(`/pelanggan/detail-pesanan/${order.transaction_id}`)}
                            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <span className="flex items-center justify-center space-x-2">
                              <span>👁️</span>
                              <span>Lihat Detail</span>
                            </span>
                          </button>
                          {order.waybill_number && order.courier && (
                            <button 
                              onClick={() => fetchTrackingData(order)}
                              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              <span className="flex items-center justify-center space-x-2">
                                <span>🚚</span>
                                <span>Lacak Pengiriman</span>
                              </span>
                            </button>
                          )}
                          {!order.waybill_number && (
                            <button className="flex-1 bg-gray-300 text-gray-500 py-3 px-6 rounded-xl font-semibold cursor-not-allowed shadow-sm">
                              <span className="flex items-center justify-center space-x-2">
                                <span>⏳</span>
                                <span>Menunggu Resi</span>
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tracking Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <span className="text-2xl">🚚</span>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Lacak Pengiriman
                    </h3>
                    
                    {trackingLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-gray-600">Mengambil data tracking...</span>
                      </div>
                    ) : trackingData ? (
                      <div className="space-y-4">
                        {/* Summary Info */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Kurir:</span>
                              <p className="text-gray-900">{trackingData.summary?.courier_name || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Status:</span>
                              <p className="text-gray-900">{trackingData.summary?.status || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Asal:</span>
                              <p className="text-gray-900">{trackingData.details?.origin || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Tujuan:</span>
                              <p className="text-gray-900">{trackingData.details?.destination || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Timeline Pengiriman</h4>
                          {trackingData.manifest && trackingData.manifest.length > 0 ? (
                            <div className="space-y-3">
                              {trackingData.manifest.map((item, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                      {item.manifest_date} {item.manifest_time}
                                    </p>
                                    <p className="text-sm text-gray-600">{item.city_name}</p>
                                    <p className="text-sm text-gray-700">{item.manifest_description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              Belum ada data tracking yang tersedia
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-600 mb-4">Gagal mengambil data tracking real-time</p>
                        {currentOrder && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                            <p><strong>Kurir:</strong> {currentOrder.courier.toUpperCase()}</p>
                            <p><strong>Resi:</strong> {currentOrder.waybill_number}</p>
                            <p className="mt-2 text-yellow-800">
                              Silakan cek manual di website kurir atau BinderByte
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowTrackingModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Tutup
                </button>
                {trackingData && (
                  <button
                    type="button"
                    onClick={() => window.open('https://binderbyte.com', '_blank')}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Buka BinderByte
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusPesanan;
