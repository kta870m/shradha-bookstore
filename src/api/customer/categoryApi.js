/**
 * Customer Category API
 * Handles all category-related API calls for customers
 */

// Không cần define API_BASE_URL vì window.$axios đã có baseURL rồi

export const categoryApi = {
    /**
     * Get all categories
     * @returns {Promise} Array of all categories
     */
    getAll: async () => {
        try {
        const response = await window.$axios.get('/categories');
        return response.data;
        } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
        }
    },

    /**
     * Get category by ID
     * @param {number} id - Category ID
     * @returns {Promise} Category details
     */
    getById: async (id) => {
        try {
        const response = await window.$axios.get(`/categories/${id}`);
        return response.data;
        } catch (error) {
        console.error(`Error fetching category ${id}:`, error);
        throw error;
        }
    },

    /**
     * Get featured categories
     * @param {number} limit - Number of categories to fetch
     * @returns {Promise} Array of featured categories
     */
    getFeatured: async (limit = 15) => {
        try {
        const response = await window.$axios.get('/categories/featured', {
            params: { limit },
        });
        return response.data;
        } catch (error) {
        console.error("Error fetching featured categories:", error);
        throw error;
        }
    },
};
