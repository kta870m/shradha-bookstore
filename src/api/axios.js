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
    // Nếu lỗi 401 (Unauthorized), redirect về login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Gán vào window để dùng global
window.$axios = axiosInstance;

export default axiosInstance;
