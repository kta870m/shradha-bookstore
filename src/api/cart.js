import axiosInstance from './axios';

/**
 * Lấy giỏ hàng của user
 * @param {number} userId - ID của user
 */
export const getCartByUser = async (userId) => {
  const response = await axiosInstance.get(`/shoppingcarts/user/${userId}`);
  return response.data;
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {object} cartItem - { cartId, productId, quantity }
 */
export const addToCart = async (cartItem) => {
  const response = await axiosInstance.post('/cartitems', cartItem);
  return response.data;
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * @param {number} cartItemId 
 * @param {number} quantity 
 */
export const updateCartItemQuantity = async (cartItemId, quantity) => {
  const response = await axiosInstance.put(`/cartitems/${cartItemId}/quantity`, quantity, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

/**
 * Xóa sản phẩm khỏi giỏ hàng (soft delete)
 * @param {number} cartItemId 
 */
export const removeFromCart = async (cartItemId) => {
  const response = await axiosInstance.delete(`/cartitems/${cartItemId}`);
  return response.data;
};

/**
 * Lấy tất cả items trong giỏ hàng
 * @param {number} cartId 
 */
export const getCartItems = async (cartId) => {
  const response = await axiosInstance.get(`/cartitems/cart/${cartId}`);
  return response.data;
};

/**
 * Xóa toàn bộ giỏ hàng
 * @param {number} cartId 
 */
export const clearCart = async (cartId) => {
  const response = await axiosInstance.post(`/shoppingcarts/${cartId}/clear`);
  return response.data;
};
