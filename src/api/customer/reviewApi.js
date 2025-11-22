/**
 * Customer Review API
 * Handles all product review-related API calls for customers
 */

export const reviewApi = {
    /**
     * Get reviews for a product
     * @param {number} productId - Product ID
     * @returns {Promise} Array of reviews
     */
    getByProduct: async (productId, page = 1, pageSize = 10) => {
        try {
            const response = await window.$axios.get(
                `/productreviews`,
                {
                    params: {
                        productId,
                        page,
                        pageSize
                    }
                }
            );
            console.log(`Fetched reviews for product ${productId}:`, response.data);
            return response.data; // {reviews: [], pagination: {}}
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
            const response = await window.$axios.post(`/productreviews`, reviewData);
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
            const response = await window.$axios.put(`/productreviews/${reviewId}`, reviewData);
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
            const response = await window.$axios.delete(`/productreviews/${reviewId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting review:", error);
            throw error;
        }
    },
};
