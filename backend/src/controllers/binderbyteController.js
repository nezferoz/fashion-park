const axios = require('axios');

// -------------------------
// 1. Tracking Waybill menggunakan BinderByte
// -------------------------
const trackWaybill = async (req, res) => {
  try {
    const { waybill, courier } = req.query;
    if (!waybill || !courier) {
      return res.status(400).json({ 
        success: false,
        message: 'waybill & courier diperlukan',
        data: { waybill, courier }
      });
    }

    console.log(`Tracking waybill: ${waybill} with courier: ${courier}`);
    
    // Gunakan BinderByte API untuk tracking
    const BINDERBYTE_API_KEY = 'ffeaaeb1d82c778ce30cd694d34f768405475d7f4f54d36524ee794c5c2b2df5';
    const BINDERBYTE_URL = 'https://api.binderbyte.com/v1/track';
    
    const response = await axios.get(`${BINDERBYTE_URL}?api_key=${BINDERBYTE_API_KEY}&courier=${courier}&awb=${waybill}`);
    
    console.log('BinderByte API response:', response.data);
    
    if (response.data && response.data.status === 200) {
      // Transform BinderByte response ke format yang diharapkan
      const trackingData = response.data.data;
      const manifest = trackingData.history ? trackingData.history.map(item => ({
        manifest_code: item.status_code || '01',
        manifest_description: item.desc,
        manifest_date: item.date,
        manifest_time: item.time,
        city_name: item.location || 'Unknown'
      })) : [];
      
      res.json({
        success: true,
        message: 'Tracking data berhasil diambil',
        data: {
          delivered: trackingData.delivered || false,
          summary: {
            courier_name: courier.toUpperCase(),
            waybill_number: waybill,
            service_code: trackingData.service || 'REG',
            waybill_date: trackingData.date || new Date().toISOString().split('T')[0],
            shipper_name: trackingData.shipper || 'Fashion Park',
            receiver_name: trackingData.receiver || 'Customer',
            origin: trackingData.origin || 'Sintang',
            destination: trackingData.destination || 'Customer Address',
            status: trackingData.status || 'ON PROCESS'
          },
          details: {
            waybill_number: waybill,
            waybill_date: trackingData.date || new Date().toISOString().split('T')[0],
            waybill_time: '00:00',
            weight: trackingData.weight || '1000',
            origin: trackingData.origin || 'Sintang',
            destination: trackingData.destination || 'Customer Address',
            shipper_name: trackingData.shipper || 'Fashion Park',
            shipper_address1: trackingData.shipper_address || 'Jl. Lintas Melawi',
            shipper_address2: 'Ladang, Kec. Sintang',
            shipper_address3: 'Kabupaten Sintang, Kalimantan Barat',
            shipper_phone: '08123456789',
            receiver_name: trackingData.receiver || 'Customer',
            receiver_address1: trackingData.receiver_address || 'Customer Address',
            receiver_address2: '',
            receiver_address3: '',
            receiver_phone: '08123456789'
          },
          manifest: manifest
        }
      });
    } else {
      throw new Error(`BinderByte API error: ${response.data?.message || 'Unknown error'}`);
    }
  } catch (err) {
    console.error('trackWaybill error:', err.response?.data || err.message);
    
    res.status(500).json({ 
      success: false,
      message: 'Gagal mengambil data tracking',
      error: err.message,
      data: { waybill: req.query.waybill, courier: req.query.courier }
    });
  }
};

module.exports = {
  trackWaybill
};
