import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCartByUser, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart, updateCartItemQuantity } from '../api/cart';
import { message } from 'antd';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy userId từ localStorage
  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      // Decode JWT token để lấy userId
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Backend sử dụng 'sid' claim để lưu userId
      return parseInt(payload.sid);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Load cart khi component mount hoặc khi user login
  const loadCart = async () => {
    const userId = getUserId();
    if (!userId) {
      setCart(null);
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      const cartData = await getCartByUser(userId);
      setCart(cartData);
      setCartItems(cartData.cartItems || []);
    } catch (error) {
      console.error('Error loading cart:', error);
      message.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (productId, quantity = 1) => {
    const userId = getUserId();
    if (!userId) {
      message.warning('Please login to add items to cart');
      return false;
    }

    try {
      setLoading(true);
      
      // Load cart nếu chưa có
      let currentCart = cart;
      if (!currentCart) {
        const cartData = await getCartByUser(userId);
        currentCart = cartData;
        setCart(cartData);
      }

      const cartId = currentCart?.cartId;
      if (!cartId) {
        message.error('Cart not found');
        return false;
      }

      const payload = {
        cartId,
        productId,
        quantity
      };
      
      console.log('Adding to cart with payload:', payload);

      await apiAddToCart(payload);

      // Refresh cart
      await loadCart();
      message.success('Added to cart successfully');
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      console.error('Error response:', error.response?.data);
      message.error('Failed to add to cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (cartItemId) => {
    try {
      setLoading(true);
      await apiRemoveFromCart(cartItemId);
      await loadCart();
      message.success('Removed from cart');
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      message.error('Failed to remove item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật số lượng
  const updateQuantity = async (cartItemId, quantity) => {
    try {
      setLoading(true);
      await updateCartItemQuantity(cartItemId, quantity);
      await loadCart();
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      message.error('Failed to update quantity');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Tính tổng số lượng items trong cart
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Tính tổng giá trị giỏ hàng
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.priceAtAddTime || item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  // Load cart khi component mount
  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    cart,
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    loadCart,
    fetchCart: loadCart, // Alias for consistency
    getTotalItems,
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
