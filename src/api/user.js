import axiosInstance from './axios';

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async () => {
  const response = await axiosInstance.get('/auth/profile');
  return response.data;
};

/**
 * Update user profile
 * @param {Object} profileData - { fullName, phoneNumber, address, birthDate, gender }
 * @returns {Promise<Object>} Update result
 */
export const updateUserProfile = async (profileData) => {
  const response = await axiosInstance.put('/auth/profile', profileData);
  return response.data;
};

/**
 * Change password
 * @param {Object} passwordData - { currentPassword, newPassword }
 * @returns {Promise<Object>} Change password result
 */
export const changePassword = async (passwordData) => {
  const response = await axiosInstance.put('/auth/change-password', passwordData);
  return response.data;
};
