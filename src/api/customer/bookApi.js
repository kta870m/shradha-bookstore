/**
 * Customer Book API
 * Handles book detail and related books API calls
 */

export const bookApi = {
    /**
     * Get book detail by ID
     * @param {number} id - Book/Product ID
     * @returns {Promise} Book details with full information
     */
    getById: async (id) => {
        try {
            const response = await window.$axios.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching book ${id}:`, error);
            throw error;
        }
    },

    /**
     * Get books by category (for related books)
     * @param {number} categoryId - Category ID
     * @param {number} limit - Number of books to fetch
     * @returns {Promise} Array of books in the same category
     */
    getByCategory: async (categoryId, limit = 6) => {
        try {
            const response = await window.$axios.get(`/products/by-category/${categoryId}`, {
                params: { 
                    page: 1, 
                    pageSize: limit 
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching books for category ${categoryId}:`, error);
            throw error;
        }
    },

    /**
     * Get related books (same category, excluding current book)
     * @param {number} bookId - Current book ID to exclude
     * @param {number} categoryId - Category ID
     * @param {number} limit - Number of related books
     * @returns {Promise} Array of related books
     */
    getRelatedBooks: async (bookId, categoryId, limit = 6) => {
        try {
            const response = await window.$axios.get(`/products/by-category/${categoryId}`, {
                params: { 
                    page: 1, 
                    pageSize: limit + 1 // Lấy thêm 1 để lọc bỏ current book
                }
            });
            
            const books = Array.isArray(response.data) ? response.data : response.data.$values || [];
            
            // Lọc bỏ sách hiện tại và giới hạn số lượng
            return books
                .filter(book => book.productId !== parseInt(bookId))
                .slice(0, limit);
        } catch (error) {
            console.error('Error fetching related books:', error);
            return [];
        }
    }
};
