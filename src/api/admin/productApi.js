import axiosInstance from '../axios';

const BASE_URL = '/products';

export const productApi = {
    // Get all products with pagination and filtering
    getProducts: async (params = {}) => {
        try {
            console.log('[PRODUCT API] Getting products with params:', params);
            const response = await axiosInstance.get(BASE_URL, { params });
            console.log('[PRODUCT API] Products fetched successfully:', response.data);
            // Transform response to match expected format
            return {
                products: response.data.items || response.data.products || [],
                pagination: response.data.pagination || {}
            };
        } catch (error) {
            console.error('[PRODUCT API] Error fetching products:', error);
            throw error;
        }
    },

    // Get single product by ID
    getProduct: async (id) => {
        try {
            console.log('[PRODUCT API] Getting product with ID:', id);
            const response = await axiosInstance.get(`${BASE_URL}/${id}`);
            console.log('[PRODUCT API] Product fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[PRODUCT API] Error fetching product:', error);
            throw error;
        }
    },

    // Create new product
    createProduct: async (productData) => {
        try {
            console.log('[PRODUCT API] Creating product:', productData);
            const response = await axiosInstance.post(BASE_URL, productData);
            console.log('[PRODUCT API] Product created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[PRODUCT API] Error creating product:', error);
            throw error;
        }
    },

    // Update product
    updateProduct: async (id, productData) => {
        try {
            console.log('[PRODUCT API] Updating product:', id, productData);
            const response = await axiosInstance.put(`${BASE_URL}/${id}`, productData);
            console.log('[PRODUCT API] Product updated successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[PRODUCT API] Error updating product:', error);
            throw error;
        }
    },

    // Delete product (soft delete)
    deleteProduct: async (id) => {
        try {
            console.log('[PRODUCT API] Deleting product with ID:', id);
            const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
            console.log('[PRODUCT API] Product deleted successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[PRODUCT API] Error deleting product:', error);
            throw error;
        }
    },

    // Get product statistics
    getStatistics: async () => {
        try {
            console.log('[PRODUCT API] Getting product statistics');
            const response = await axiosInstance.get(`${BASE_URL}/statistics`);
            console.log('[PRODUCT API] Statistics fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[PRODUCT API] Error fetching statistics:', error);
            throw error;
        }
    }
};

export default productApi;