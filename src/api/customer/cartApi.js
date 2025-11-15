/**
 * Customer Cart API
 * Handles all shopping cart-related API calls for customers
 */

const API_BASE_URL = "http://localhost:5047/api";

export const cartApi = {
    /**
     * Get user's shopping cart
     * @param {number} userId - User ID
     * @returns {Promise} Cart data with items
     */
    getCart: async (userId) => {
        try {
        const response = await window.$axios.get(
            `${API_BASE_URL}/shoppingcarts/${userId}`
        );
        return response.data;
        } catch (error) {
        console.error("Error fetching cart:", error);
        throw error;
        }
    },

    /**
     * Add item to cart
     * @param {object} cartItem - Cart item data {userId, productId, quantity}
     * @returns {Promise} Added cart item
     */
    addItem: async (cartItem) => {
        try {
        const response = await window.$axios.post(
            `${API_BASE_URL}/cartitems`,
            cartItem
        );
        return response.data;
        } catch (error) {
        console.error("Error adding item to cart:", error);
        throw error;
        }
    },

    /**
     * Update cart item quantity
     * @param {number} cartItemId - Cart item ID
     * @param {number} quantity - New quantity
     * @returns {Promise} Updated cart item
     */
    updateItem: async (cartItemId, quantity) => {
        try {
        const response = await window.$axios.put(
            `${API_BASE_URL}/cartitems/${cartItemId}`,
            {
            quantity,
            }
        );
        return response.data;
        } catch (error) {
        console.error("Error updating cart item:", error);
        throw error;
        }
    },

    /**
   * Remove item from cart
   * @param {number} cartItemId - Cart item ID
   * @returns {Promise} Delete confirmation
   */
    removeItem: async (cartItemId) => {
        try {
        const response = await window.$axios.delete(
            `${API_BASE_URL}/cartitems/${cartItemId}`
        );
        return response.data;
        } catch (error) {
        console.error("Error removing cart item:", error);
        throw error;
        }
    },

    /**
   * Clear entire cart
   * @param {number} userId - User ID
   * @returns {Promise} Clear confirmation
   */
    clearCart: async (userId) => {
        try {
            const response = await window.$axios.delete(
            `${API_BASE_URL}/shoppingcarts/${userId}/clear`
        );
        return response.data;
        } catch (error) {
            console.error("Error clearing cart:", error);
            throw error;
        }
    },
};
