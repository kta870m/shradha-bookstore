import axiosInstance from '../axios';

const BASE_URL = '/customers';

export const customerApi = {
    // Get all customers with pagination and filtering
    getCustomers: async (params = {}) => {
        try {
            console.log('[CUSTOMER API] Getting customers with params:', params);
            const response = await axiosInstance.get(BASE_URL, { params });
            console.log('[CUSTOMER API] Customers fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[CUSTOMER API] Error fetching customers:', error);
            throw error;
        }
    },

    // Get single customer by ID
    getCustomer: async (id) => {
        try {
            console.log('[CUSTOMER API] Getting customer with ID:', id);
            const response = await axiosInstance.get(`${BASE_URL}/${id}`);
            console.log('[CUSTOMER API] Customer fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[CUSTOMER API] Error fetching customer:', error);
            throw error;
        }
    },

    // Create new customer
    createCustomer: async (customerData) => {
        try {
            console.log('[CUSTOMER API] Creating customer:', customerData);
            const response = await axiosInstance.post(BASE_URL, customerData);
            console.log('[CUSTOMER API] Customer created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[CUSTOMER API] Error creating customer:', error);
            throw error;
        }
    },

    // Update customer
    updateCustomer: async (id, customerData) => {
        try {
            console.log('[CUSTOMER API] Updating customer:', id, customerData);
            const response = await axiosInstance.put(`${BASE_URL}/${id}`, customerData);
            console.log('[CUSTOMER API] Customer updated successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[CUSTOMER API] Error updating customer:', error);
            throw error;
        }
    },

    // Delete customer (soft delete)
    deleteCustomer: async (id) => {
        try {
            console.log('[CUSTOMER API] Deleting customer with ID:', id);
            const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
            console.log('[CUSTOMER API] Customer deleted successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[CUSTOMER API] Error deleting customer:', error);
            throw error;
        }
    },

    // Get customer statistics
    getStatistics: async () => {
        try {
            console.log('[CUSTOMER API] Getting customer statistics');
            const response = await axiosInstance.get(`${BASE_URL}/statistics`);
            console.log('[CUSTOMER API] Statistics fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[CUSTOMER API] Error fetching statistics:', error);
            throw error;
        }
    }
};

export default customerApi;