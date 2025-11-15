import api from '../axios';

// Get all feedbacks for admin with pagination, search, and filters
export const getFeedbacksForAdmin = async (params = {}) => {
  try {
    const response = await api.get('/feedbackqueries/admin', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching feedbacks for admin:', error);
    throw error;
  }
};

// Get feedback statistics
export const getFeedbackStatistics = async () => {
  try {
    const response = await api.get('/feedbackqueries/admin/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching feedback statistics:', error);
    throw error;
  }
};

// Get single feedback by ID
export const getFeedbackById = async (id) => {
  try {
    const response = await api.get(`/feedbackqueries/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
};

// Create new feedback
export const createFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/feedbackqueries', feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw error;
  }
};

// Update feedback
export const updateFeedback = async (id, feedbackData) => {
  try {
    const response = await api.put(`/feedbackqueries/${id}`, feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }
};

// Delete feedback (soft delete)
export const deleteFeedback = async (id) => {
  try {
    const response = await api.delete(`/feedbackqueries/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
};

// Get customer feedbacks
export const getCustomerFeedbacks = async (userId, params = {}) => {
  try {
    const response = await api.get(`/feedbackqueries/customer/${userId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching customer feedbacks:', error);
    throw error;
  }
};

// Submit feedback from customer
export const submitCustomerFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/feedbackqueries', feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error submitting customer feedback:', error);
    throw error;
  }
};