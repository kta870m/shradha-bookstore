import axiosInstance from './axios';

export const login = async (email, password) => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (data) => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

// Có thể mở rộng thêm các hàm lấy profile, refresh token, ...
