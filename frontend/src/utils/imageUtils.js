// Utility untuk URL gambar yang konsisten
export const getImageUrl = (imageId) => {
  if (!imageId) return null;
  
  // Prioritaskan environment variable, lalu fallback ke localhost
  let baseUrl = process.env.REACT_APP_API_URL;
  
  if (!baseUrl) {
    // Fallback ke localhost jika tidak ada environment variable
    baseUrl = 'http://localhost:5000';
  }
  
  // Pastikan base URL tidak berakhir dengan slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  
  // Gunakan endpoint yang benar untuk gambar produk
  const finalUrl = `${cleanBaseUrl}/api/products/images/${imageId}`;
  
  return finalUrl;
};

export const getProductImageUrl = (productId, imageId) => {
  if (!imageId) return null;
  
  // Prioritaskan environment variable, lalu fallback ke localhost
  let baseUrl = process.env.REACT_APP_API_URL;
  
  if (!baseUrl) {
    // Fallback ke localhost jika tidak ada environment variable
    baseUrl = 'http://localhost:5000';
  }
  
  // Pastikan base URL tidak berakhir dengan slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  
  // Gunakan endpoint yang benar untuk gambar produk dengan product_id
  const finalUrl = `${cleanBaseUrl}/api/products/${productId}/images/${imageId}`;
  
  return finalUrl;
};

// Test function untuk debugging
export const testImageUrl = () => {
  console.log('Testing image URL generation...');
  const testUrl = getImageUrl(6);
  console.log('Test URL for image ID 6:', testUrl);
  return testUrl;
};

// Function untuk mengecek apakah gambar bisa diakses
export const checkImageAccessibility = async (imageId) => {
  if (!imageId) return false;
  
  try {
    const response = await fetch(getImageUrl(imageId), {
      method: 'HEAD',
      mode: 'cors'
    });
    return response.ok;
  } catch (error) {
    console.error('Image accessibility check failed:', error);
    return false;
  }
};

// Function untuk mendapatkan placeholder image yang sesuai
export const getPlaceholderImage = (productName = 'Produk') => {
  // Gunakan placeholder yang lebih menarik berdasarkan kategori produk
  const placeholders = {
    'Kaos': '👕',
    'Kemeja': '👔',
    'Celana': '👖',
    'Jaket': '🧥',
    'Sandal': '👟',
    'Tas': '👜',
    'Aksesoris': '💍',
    'default': '📷'
  };
  
  // Coba cari placeholder berdasarkan nama produk
  for (const [category, icon] of Object.entries(placeholders)) {
    if (productName.toLowerCase().includes(category.toLowerCase())) {
      return icon;
    }
  }
  
  return placeholders.default;
};

// Function untuk mendapatkan fallback icon berdasarkan kategori
export const getFallbackIcon = (categoryName) => {
  const iconMap = {
    'Kaos': '👕',
    'Kemeja': '👔',
    'Celana': '👖',
    'Jaket': '🧥',
    'Sandal': '👟',
    'Tas': '👜',
    'Aksesoris': '💍',
    'Celana Pendek': '🩳',
    'Celana Panjang': '👖'
  };
  
  return iconMap[categoryName] || '📦';
};
