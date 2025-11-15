import axiosInstance from './axios';

/**
 * Create a new order
 * @param {Object} orderData - { userId, shippingFee, orderDetails: [{ productId, quantity }] }
 * @returns {Promise<Object>} OrderResponse with orderId, orderCode, totalAmount, etc.
 */
export const createOrder = async (orderData) => {
  const response = await axiosInstance.post('/orders/create', orderData);
  return response.data;
};

/**
 * Get order details by ID
 * @param {number} orderId
 * @returns {Promise<Object>} Order details
 */
export const getOrderById = async (orderId) => {
  const response = await axiosInstance.get(`/orders/${orderId}`);
  return response.data;
};

/**
 * Get all orders for current user
 * @returns {Promise<Array>} List of orders
 */
export const getUserOrders = async () => {
  const response = await axiosInstance.get('/orders');
  return response.data;
};
