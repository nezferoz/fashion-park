const db = require('../config/db');

// Indonesian city coordinates (major cities)
const cityCoordinates = {
  '255': { lat: 0.0694, lng: 111.4753, name: 'Sintang' }, // Kalimantan Barat
  '256': { lat: 0.0000, lng: 109.3333, name: 'Pontianak' }, // Kalimantan Barat
  '152': { lat: -6.2088, lng: 106.8456, name: 'Jakarta Pusat' },
  '158': { lat: -6.9175, lng: 107.6191, name: 'Bandung' },
  '166': { lat: -6.9932, lng: 110.4203, name: 'Semarang' },
  '172': { lat: -7.7971, lng: 110.3708, name: 'Yogyakarta' },
  '177': { lat: -7.2575, lng: 112.7521, name: 'Surabaya' },
  '153': { lat: -6.2088, lng: 106.8456, name: 'Jakarta Utara' },
  '154': { lat: -6.2088, lng: 106.8456, name: 'Jakarta Barat' },
  '155': { lat: -6.2088, lng: 106.8456, name: 'Jakarta Selatan' },
  '156': { lat: -6.2088, lng: 106.8456, name: 'Jakarta Timur' },
};

// Shipping cost calculation based on distance and weight
const calculateShippingCost = (originCityId, destinationCityId, weight = 1000) => {
  const origin = cityCoordinates[originCityId];
  const destination = cityCoordinates[destinationCityId];
  
  if (!origin || !destination) {
    // Default cost if coordinates not found
    return {
      cost: 20000,
      estimated_days: '2-3',
      service: 'Regular'
    };
  }
  
  // Calculate distance using Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (destination.lat - origin.lat) * Math.PI / 180;
  const dLon = (destination.lng - origin.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  // Calculate cost based on distance and weight
  let baseCost = 0;
  let estimatedDays = '1-2';
  
  if (distance <= 50) {
    baseCost = 15000;
    estimatedDays = '1-2';
  } else if (distance <= 100) {
    baseCost = 20000;
    estimatedDays = '2-3';
  } else if (distance <= 200) {
    baseCost = 25000;
    estimatedDays = '2-3';
  } else if (distance <= 500) {
    baseCost = 35000;
    estimatedDays = '3-4';
  } else {
    baseCost = 50000;
    estimatedDays = '4-7';
  }
  
  // Add weight factor (per kg)
  const weightCost = Math.ceil(weight / 1000) * 5000;
  const totalCost = baseCost + weightCost;
  
  return {
    cost: totalCost,
    estimated_days: estimatedDays,
    service: 'Regular',
    distance: Math.round(distance),
    weight: weight
  };
};

// Get shipping cost with detailed calculation
const getCost = async (req, res) => {
  try {
    const { 
      origin_city_id, 
      destination_city_id, 
      weight = 1000,
      destination_district_id,
      destination_postal_code 
    } = req.body;
    
    if (!destination_city_id) {
      return res.status(400).json({
        message: 'destination_city_id diperlukan'
      });
    }
    
    // Get sender address from database
    const [senderRows] = await db.query(`
      SELECT sender_city_id FROM system_settings WHERE id = 1
    `);
    
    const senderCityId = senderRows.length > 0 ? senderRows[0].sender_city_id : '152'; // Default Jakarta Pusat
    
    // If origin_city_id is provided, use it; otherwise use sender address
    const originCityId = origin_city_id || senderCityId;
    
    // Calculate shipping cost
    const shippingInfo = calculateShippingCost(originCityId, destination_city_id, weight);
    
    // Add additional cost based on district (if available)
    let additionalCost = 0;
    if (destination_district_id) {
      // Some districts might have additional costs
      const premiumDistricts = ['1521', '1522', '1523']; // Example premium districts
      if (premiumDistricts.includes(destination_district_id)) {
        additionalCost = 5000;
      }
    }
    
    // Add postal code factor (if available)
    if (destination_postal_code) {
      // Remote areas might have additional costs
      const remotePostalCodes = ['12345', '67890']; // Example remote postal codes
      if (remotePostalCodes.includes(destination_postal_code)) {
        additionalCost += 3000;
      }
    }
    
    const finalCost = shippingInfo.cost + additionalCost;
    
    res.json({
      success: true,
      data: {
        cost: finalCost,
        estimated_days: shippingInfo.estimated_days,
        service: shippingInfo.service,
        distance: shippingInfo.distance,
        weight: shippingInfo.weight,
        origin_city_id: originCityId,
        destination_city_id: destination_city_id,
        destination_district_id: destination_district_id || null,
        destination_postal_code: destination_postal_code || null,
        additional_cost: additionalCost,
        breakdown: {
          base_cost: shippingInfo.cost,
          weight_cost: shippingInfo.cost - (shippingInfo.cost - Math.ceil(weight / 1000) * 5000),
          district_cost: destination_district_id ? additionalCost : 0,
          postal_code_cost: destination_postal_code ? (additionalCost - (destination_district_id ? 5000 : 0)) : 0
        }
      }
    });
    
  } catch (error) {
    console.error('Shipping cost calculation error:', error);
    res.status(500).json({
      message: 'Gagal menghitung ongkos kirim',
      error: error.message
    });
  }
};

module.exports = {
  getCost,
  calculateShippingCost
}; 