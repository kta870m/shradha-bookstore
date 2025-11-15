/**
 * Customer Product API
 * Handles all product-related API calls for customers
 */

// Không cần define API_BASE_URL vì window.$axios đã có baseURL rồi

export const productApi = {
    /**
     * Get all products with pagination
     * @param {number} page - Page number (default: 1)
     * @param {number} pageSize - Items per page (default: 12)
     * @returns {Promise} Products data with pagination info
     */
    getAll: async (page = 1, pageSize = 12) => {
        try {
        const response = await window.$axios.get('/products', {
            params: { page, pageSize },
        });
        return response.data;
        } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
        }
    },

    /**
     * Get product by ID
     * @param {number} id - Product ID
     * @returns {Promise} Product details
     */
    getById: async (id) => {
        try {
        const response = await window.$axios.get(`/products/${id}`);
        return response.data;
        } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        throw error;
        }
    },

    /**
     * Get new arrival products
     * @param {number} limit - Number of products to fetch
     * @returns {Promise} Array of new products
     */
    getNewArrivals: async (limit = 12) => {
        try {
        const response = await window.$axios.get('/products/new-arrivals', {
            params: { limit },
        });
        return response.data;
        } catch (error) {
        console.error("Error fetching new arrivals:", error);
        throw error;
        }
    },

    /**
     * Get best seller products
     * @param {number} limit - Number of products to fetch
     * @returns {Promise} Array of bestseller products
     */
    getBestSellers: async (limit = 12) => {
        try {
        const response = await window.$axios.get('/products/best-sellers', {
            params: { limit },
        });
        return response.data;
        } catch (error) {
        console.error("Error fetching bestsellers:", error);
        throw error;
        }
    },

    /**
     * Get featured products
     * @param {number} limit - Number of products to fetch
     * @returns {Promise} Array of featured products
     */
    getFeatured: async (limit = 12) => {
        try {
        const response = await window.$axios.get('/products/featured', {
            params: { limit },
        });
        return response.data;
        } catch (error) {
        console.error("Error fetching featured products:", error);
        throw error;
        }
    },

    /**
     * Search products
     * @param {string} query - Search query
     * @param {number} page - Page number
     * @param {number} pageSize - Items per page
     * @returns {Promise} Search results with pagination
     */
    search: async (query, page = 1, pageSize = 12) => {
        try {
        const response = await window.$axios.get('/products/search', {
            params: { query, page, pageSize },
        });
        return response.data;
        } catch (error) {
        console.error("Error searching products:", error);
        throw error;
        }
    },

    /**
     * Get products by category
     * @param {number} categoryId - Category ID
     * @param {number} page - Page number
     * @param {number} pageSize - Items per page
     * @returns {Promise} Products in category with pagination
     */
    getByCategory: async (categoryId, page = 1, pageSize = 12) => {
        try {
        const response = await window.$axios.get(`/products/category/${categoryId}`, {
            params: { page, pageSize },
        });
        return response.data;
        } catch (error) {
        console.error(`Error fetching products for category ${categoryId}:`, error);
        throw error;
        }
    },
};
