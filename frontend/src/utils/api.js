import axios from 'axios';

const envApiUrl = process.env.REACT_APP_API_URL;
// Gunakan localhost sebagai prioritas utama untuk development
// Tambahkan ngrok sebagai fallback jika diperlukan
const resolvedBase = (typeof window !== 'undefined' && window.__API_URL__) || 
                    envApiUrl || 
                    'http://localhost:5000' || 
                    'https://1837c60c25d5.ngrok-free.app';

const api = axios.create({
  baseURL: `${resolvedBase}/api`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Attach token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout and redirect to login if 401, but only for authenticated routes
api.interceptors.response.use(
  response => response,
  error => {
    // Hanya redirect ke login jika user sudah login dan mendapat 401
    // Untuk request tanpa token (user belum login), jangan redirect
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        // User sudah login tapi token expired/invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Hanya redirect jika bukan request untuk produk atau gambar
        const isProductRequest = error.config.url && (
          error.config.url.includes('/products/') || 
          error.config.url.includes('/categories/') ||
          error.config.url.includes('/shipping/cost')
        );
        if (!isProductRequest) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api; 