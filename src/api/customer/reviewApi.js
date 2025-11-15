/**
 * Customer Review API
 * Handles all product review-related API calls for customers
 */

const API_BASE_URL = "http://localhost:5047/api";

export const reviewApi = {
    /**
     * Get reviews for a product
     * @param {number} productId - Product ID
     * @returns {Promise} Array of reviews
     */
    getByProduct: async (productId) => {
        try {
        const response = await window.$axios.get(`${API_BASE_URL}/productreviews/product/${productId}`);
        return response.data;
        } catch (error) {
        console.error(`Error fetching reviews for product ${productId}:`, error);
        throw error;
        }
    },

    /**
     * Submit a product review
     * @param {object} reviewData - Review data {userId, productId, rating, comment}
     * @returns {Promise} Created review
     */
    submitReview: async (reviewData) => {
        try {
        const response = await window.$axios.post(`${API_BASE_URL}/productreviews`, reviewData);
        return response.data;
        } catch (error) {
        console.error("Error submitting review:", error);
        throw error;
        }
    },

    /**
     * Update a review
     * @param {number} reviewId - Review ID
     * @param {object} reviewData - Updated review data {rating, comment}
     * @returns {Promise} Updated review
     */
    updateReview: async (reviewId, reviewData) => {
        try {
        const response = await window.$axios.put(`${API_BASE_URL}/productreviews/${reviewId}`, reviewData);
        return response.data;
        } catch (error) {
        console.error("Error updating review:", error);
        throw error;
        }
    },

    /**
     * Delete a review
     * @param {number} reviewId - Review ID
     * @returns {Promise} Delete confirmation
     */
    deleteReview: async (reviewId) => {
        try {
        const response = await window.$axios.delete(`${API_BASE_URL}/productreviews/${reviewId}`);
        return response.data;
        } catch (error) {
        console.error("Error deleting review:", error);
        throw error;
        }
    },
};
