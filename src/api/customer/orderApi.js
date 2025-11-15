/**
 * Customer Order API
 * Handles all order-related API calls for customers
 */

const API_BASE_URL = "http://localhost:5047/api";

export const orderApi = {
    /**
     * Create new order
     * @param {object} orderData - Order data {userId, shippingAddress, paymentMethod, items}
     * @returns {Promise} Created order
     */
    createOrder: async (orderData) => {
        try {
        const response = await window.$axios.post(`${API_BASE_URL}/orders`, orderData);
        return response.data;
        } catch (error) {
        console.error("Error creating order:", error);
        throw error;
        }
    },

    /**
     * Get order by ID
     * @param {number} orderId - Order ID
     * @returns {Promise} Order details
     */
    getById: async (orderId) => {
        try {
        const response = await window.$axios.get(`${API_BASE_URL}/orders/${orderId}`);
        return response.data;
        } catch (error) {
        console.error(`Error fetching order ${orderId}:`, error);
        throw error;
        }
    },

    /**
     * Get user's orders
     * @param {number} userId - User ID
     * @returns {Promise} Array of user's orders
     */
    getUserOrders: async (userId) => {
        try {
        const response = await window.$axios.get(`${API_BASE_URL}/orders/user/${userId}`);
        return response.data;
        } catch (error) {
        console.error("Error fetching user orders:", error);
        throw error;
        }
    },

    /**
     * Cancel order
     * @param {number} orderId - Order ID
     * @returns {Promise} Cancellation confirmation
     */
    cancelOrder: async (orderId) => {
        try {
        const response = await window.$axios.put(`${API_BASE_URL}/orders/${orderId}/cancel`);
        return response.data;
        } catch (error) {
        console.error("Error cancelling order:", error);
        throw error;
        }
    },

    /**
     * Track order status
     * @param {number} orderId - Order ID
     * @returns {Promise} Order tracking info
     */
    trackOrder: async (orderId) => {
        try {
        const response = await window.$axios.get(`${API_BASE_URL}/orders/${orderId}/track`);
        return response.data;
        } catch (error) {
        console.error("Error tracking order:", error);
        throw error;
        }
    },
};
