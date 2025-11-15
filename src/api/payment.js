import axiosInstance from './axios';

/**
 * Create payment and get VNPay URL
 * @param {Object} paymentData - { orderId, returnUrl }
 * @returns {Promise<Object>} PaymentResponse with paymentUrl
 */
export const createPayment = async (paymentData) => {
  const response = await axiosInstance.post('/payment/create', paymentData);
  return response.data;
};

/**
 * Handle VNPay return callback
 * @param {string} queryString - Full query string from VNPay redirect
 * @returns {Promise<Object>} Payment verification result
 */
export const handleVnpayReturn = async (queryString) => {
  const response = await axiosInstance.get(`/payment/vnpay-return${queryString}`);
  return response.data;
};
