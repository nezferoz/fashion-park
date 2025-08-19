import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ShippingEstimate = ({ destination, weight, onShippingSelect }) => {
  const [shippingOptions, setShippingOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);

  useEffect(() => {
    fetchCustomerAddress();
  }, []);

  useEffect(() => {
    if (destination && weight) {
      calculateShipping();
    }
  }, [destination, weight]);

  const fetchCustomerAddress = async () => {
    try {
      setAddressLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      const response = await axios.get(`http://localhost:5000/api/users/${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.address && response.data.province_id && response.data.city_id) {
        setCustomerAddress(response.data);
      }
    } catch (error) {
      console.error('Gagal mengambil alamat pelanggan:', error);
    } finally {
      setAddressLoading(false);
    }
  };

  const calculateShipping = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Use customer's city as destination if not provided
      const targetDestination = destination || (customerAddress ? customerAddress.city_id : null);
      
      if (!targetDestination) {
        setError('Alamat tujuan tidak ditemukan. Silakan update profil terlebih dahulu.');
        setLoading(false);
        return;
      }
      
      const response = await axios.post('http://localhost:5000/api/rajaongkir/cost-with-validation', {
        destination: targetDestination,
        weight: weight,
        courier: 'jne',
        customer_id: user?.userId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        const allOptions = response.data.results.flatMap(courier => 
          courier.costs.map(cost => ({
            ...cost,
            courierName: courier.name,
            courierCode: courier.code
          }))
        );
        setShippingOptions(allOptions);
        
        // Auto-select the cheapest option
        if (allOptions.length > 0) {
          const cheapest = allOptions.reduce((min, option) => 
            option.cost[0].value < min.cost[0].value ? option : min
          );
          setSelectedShipping(cheapest);
          onShippingSelect && onShippingSelect(cheapest);
        }
      } else {
        setError("Tidak ada layanan pengiriman yang tersedia");
      }
    } catch (error) {
      console.error('Gagal menghitung ongkir:', error);
      setError('Gagal menghitung ongkir');
    } finally {
      setLoading(false);
    }
  };

  const formatEtd = (etd) => {
    if (!etd) return '1-2 hari';
    if (etd.includes('-')) return etd;
    return `${etd} hari`;
  };

  const getServiceIcon = (courierCode) => {
    switch (courierCode.toLowerCase()) {
      case 'jne':
        return '🚚';
      case 'pos':
        return '📮';
      case 'tiki':
        return '📦';
      default:
        return '🚛';
    }
  };

  const handleShippingSelect = (option) => {
    setSelectedShipping(option);
    onShippingSelect && onShippingSelect(option);
  };

  // Show loading state while fetching address
  if (addressLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-gray-600 text-sm">Mendeteksi alamat...</span>
        </div>
      </div>
    );
  }

  // Show warning if no address is saved
  if (!customerAddress && !destination) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
          <span className="font-semibold text-yellow-800">Alamat Belum Diset</span>
        </div>
        <p className="text-sm text-yellow-700 mb-2">
          Anda belum menyimpan alamat di profil. Silakan update profil terlebih dahulu.
        </p>
        <a 
          href="/pelanggan/profile" 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          → Update Profil Sekarang
        </a>
      </div>
    );
  }

  // Show address info if available
  const showAddressInfo = customerAddress && !destination;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Estimasi Pengiriman</h3>
        {loading && (
          <div className="flex items-center text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Menghitung...
          </div>
        )}
      </div>

      {/* Customer Address Info */}
      {showAddressInfo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="font-medium text-green-800 text-sm">Alamat Tersimpan</span>
          </div>
          <p className="text-xs text-green-700">
            {customerAddress.address}
          </p>
          <p className="text-xs text-green-600 mt-1">
            ✓ Menggunakan alamat dari profil Anda
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {shippingOptions.length > 0 && (
        <div className="space-y-3">
          {shippingOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => handleShippingSelect(option)}
              className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                selectedShipping === option
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getServiceIcon(option.courierCode)}</span>
                  <div>
                    <div className="font-medium text-gray-800">
                      {option.courierName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {option.service} - {option.description}
                    </div>
                    <div className="text-xs text-gray-500">
                      Estimasi: {formatEtd(option.cost[0].etd)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-blue-600">
                    Rp{option.cost[0].value.toLocaleString()}
                  </div>
                  {selectedShipping === option && (
                    <div className="text-xs text-blue-600 font-medium">✓ Dipilih</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedShipping && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-green-800">Total Ongkir:</span>
              <span className="font-bold text-green-800">
                Rp{selectedShipping.cost[0].value.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              Estimasi tiba: {formatEtd(selectedShipping.cost[0].etd)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingEstimate; 