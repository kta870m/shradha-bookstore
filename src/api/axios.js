import axios from 'axios';

const API_BASE_URL = 'http://localhost:5047/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Tăng từ 10s lên 30s để xử lý search queries phức tạp
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Tự động đính kèm token
axiosInstance.interceptors.request.use(
  (config) => {
    // Ưu tiên adminToken, sau đó mới đến token thường
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Xử lý lỗi tự động
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Check if user is in admin area
      const isAdminArea = window.location.pathname.startsWith('/admin');
      
      if (isAdminArea) {
        // Admin area: clear admin tokens and redirect to admin login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      } else {
        // Customer area: clear customer token but don't redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Let the component handle the UI (show login modal, etc.)
      }
    }
    return Promise.reject(error);
  }
);

// Gán vào window để dùng global
window.$axios = axiosInstance;

export default axiosInstance;
