import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';

const DetailPesanan = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      console.log('=== DEBUG DETAIL PESANAN ===');
      console.log('Fetching order detail for ID:', id);
      console.log('User object:', user);
      console.log('User ID:', user?.userId);
      
      const response = await api.get(`/transactions/${id}/details/user`);
      console.log('Order detail response:', response);
      console.log('Order detail data:', response.data);
      
      setOrder(response.data);
      console.log('✅ Order set successfully');
    } catch (error) {
      console.error('=== ERROR FETCHING ORDER DETAIL ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
    } finally {
      setLoading(false);
      console.log('=== FETCH COMPLETED ===');
    }
  }, [id, user]);

  useEffect(() => {
    if (user && id) {
      console.log('useEffect triggered - user:', user, 'id:', id);
      fetchOrderDetail();
    }
  }, [user, id, fetchOrderDetail]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'menunggu pembayaran':
        return '⏳';
      case 'success':
      case 'diproses':
        return '✅';
      case 'dikirim':
        return '🚚';
      case 'selesai':
        return '🎉';
      case 'failed':
      case 'dibatalkan':
        return '❌';
      default:
        return '📋';
    }
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
      case 'failed':
        return 'Pembayaran Gagal';
      case 'dibatalkan':
        return 'Pesanan Dibatalkan';
      default:
        return status || 'Unknown';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Pesanan tidak ditemukan</h3>
            <button
              onClick={() => navigate('/pelanggan/status-pesanan')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Kembali ke Status Pesanan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Detail Pesanan</h1>
              <p className="text-gray-600 mt-2 text-lg">Order #{order.transaction_id}</p>
            </div>
            <button
              onClick={() => navigate('/pelanggan/status-pesanan')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Kembali ke Status Pesanan
            </button>
          </div>
        </div>

        {/* Order Status Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-4xl">{getStatusIcon(order.status || order.payment_status)}</span>
                <div>
                  <h2 className="text-2xl font-bold">{getStatusText(order.status || order.payment_status)}</h2>
                  <p className="text-blue-100 text-lg">Order #{order.transaction_id}</p>
                  <p className="text-blue-200">{formatDate(order.transaction_date)}</p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-3xl font-bold">Rp{Number(order.grand_total || order.final_amount || order.total_amount || 0).toLocaleString('id-ID')}</p>
                <p className="text-blue-100 text-lg">Total Pembayaran</p>
              </div>
            </div>
          </div>
        </div>

        {/* Information Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Informasi Pelanggan</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Nama</label>
                <p className="text-gray-900 text-base">
                  {order.customer_name || 'Nama tidak tersedia'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900 text-base">
                  {order.customer_email || 'Email tidak tersedia'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Alamat Lengkap</label>
                <p className="text-gray-900 text-base">
                  {order.formatted_address || order.customer_address || 'Alamat tidak tersedia'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">No. Telepon</label>
                <p className="text-gray-900 text-base">
                  {order.customer_phone || 'Nomor telepon tidak tersedia'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Informasi Pesanan</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Transaction Code</label>
                <p className="text-gray-900 text-base">{order.transaction_code || 'TRX' + order.transaction_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Metode Pembayaran</label>
                <p className="text-gray-900 text-base capitalize">{order.payment_method}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status Pembayaran</label>
                <p className="text-gray-900 text-base">{getStatusText(order.payment_status)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tanggal Pesanan</label>
                <p className="text-gray-900 text-base">{formatDate(order.transaction_date)}</p>
              </div>
              
              {/* Shipping Information */}
              {order.courier && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Kurir</label>
                  <p className="text-gray-900 text-base capitalize">{order.courier}</p>
                </div>
              )}
              {order.waybill_number && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Nomor Resi</label>
                  <p className="text-gray-900 text-base">{order.waybill_number}</p>
                </div>
              )}
              {order.status && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Status Pesanan</label>
                  <p className="text-gray-900 text-base capitalize">{getStatusText(order.status)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Produk yang Dipesan</h3>
          {order.transaction_details && order.transaction_details.length > 0 ? (
            <div className="space-y-4">
              {order.transaction_details.map((detail, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {detail.product?.image_url ? (
                      <img
                        src={`http://localhost:5000${detail.product.image_url}?t=${Date.now()}`}
                        alt={detail.product?.product_name || 'Produk'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl" style={{display: 'none'}}>
                      📷
                    </div>
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {detail.product?.product_name || `Produk ID: ${detail.product_id}`}
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Quantity: {detail.quantity || 1}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Harga Satuan: Rp{Number(detail.unit_price || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  
                  {/* Subtotal */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">
                      Rp{Number(detail.subtotal || 0).toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-500">Subtotal</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📦</div>
              Detail produk tidak tersedia
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal Produk</span>
              <span className="text-gray-900">Rp{Number(order.total_amount || 0).toLocaleString('id-ID')}</span>
            </div>
            
            {/* Shipping Cost */}
            {order.shipping_cost && order.shipping_cost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Ongkos Kirim</span>
                <span className="text-gray-900">Rp{Number(order.shipping_cost).toLocaleString('id-ID')}</span>
              </div>
            )}
            
            {/* Admin Fee */}
            {order.fee_amount && order.fee_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Biaya Admin</span>
                <span className="text-gray-900">Rp{Number(order.fee_amount).toLocaleString('id-ID')}</span>
              </div>
            )}
            
            {/* Discount */}
            {order.discount && order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Diskon</span>
                <span className="text-gray-900">-Rp{Number(order.discount).toLocaleString('id-ID')}</span>
              </div>
            )}
            
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Total Pembayaran</span>
                <span className="text-2xl font-bold text-blue-600">
                  Rp{(() => {
                    const subtotal = Number(order.total_amount || 0);
                    const shipping = Number(order.shipping_cost || 0);
                    const fee = Number(order.fee_amount || 0);
                    const discount = Number(order.discount || 0);
                    
                    const total = subtotal + shipping + fee - discount;
                    
                    if (isNaN(total)) {
                      return '0';
                    }
                    
                    return total.toLocaleString('id-ID');
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPesanan;
