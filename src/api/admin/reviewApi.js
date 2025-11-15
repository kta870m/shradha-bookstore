import axiosInstance from '../axios';

const BASE_URL = '/productreviews';

export const reviewApi = {
    // Get all reviews with pagination and filtering
    getReviews: async (params = {}) => {
        try {
            console.log('[REVIEW API] Getting reviews with params:', params);
            const response = await axiosInstance.get(BASE_URL, { params });
            console.log('[REVIEW API] Reviews fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[REVIEW API] Error fetching reviews:', error);
            throw error;
        }
    },

    // Get single review by ID
    getReview: async (id) => {
        try {
            console.log('[REVIEW API] Getting review with ID:', id);
            const response = await axiosInstance.get(`${BASE_URL}/${id}`);
            console.log('[REVIEW API] Review fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[REVIEW API] Error fetching review:', error);
            throw error;
        }
    },

    // Create new review
    createReview: async (reviewData) => {
        try {
            console.log('[REVIEW API] Creating review:', reviewData);
            const response = await axiosInstance.post(BASE_URL, reviewData);
            console.log('[REVIEW API] Review created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[REVIEW API] Error creating review:', error);
            throw error;
        }
    },

    // Update review
    updateReview: async (id, reviewData) => {
        try {
            console.log('[REVIEW API] Updating review:', id, reviewData);
            const response = await axiosInstance.put(`${BASE_URL}/${id}`, reviewData);
            console.log('[REVIEW API] Review updated successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[REVIEW API] Error updating review:', error);
            throw error;
        }
    },

    // Delete review (soft delete)
    deleteReview: async (id) => {
        try {
            console.log('[REVIEW API] Deleting review with ID:', id);
            const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
            console.log('[REVIEW API] Review deleted successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[REVIEW API] Error deleting review:', error);
            throw error;
        }
    },

    // Get review statistics
    getStatistics: async () => {
        try {
            console.log('[REVIEW API] Getting review statistics');
            const response = await axiosInstance.get(`${BASE_URL}/statistics`);
            console.log('[REVIEW API] Statistics fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[REVIEW API] Error fetching statistics:', error);
            throw error;
        }
    }
};

export default reviewApi;