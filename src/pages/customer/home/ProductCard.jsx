import React, { useState } from "react";
import { FaStar, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../../../contexts/CartContext";
import { message } from "antd";
import "./ProductCard.css";

const currency = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

const ProductCard = ({ product }) => {
  const { addToCart, loading } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const imageUrl = product.mediaFiles && product.mediaFiles.length > 0 
    ? product.mediaFiles[0].mediaUrl 
    : product.thumbnailUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=720&auto=format&fit=crop";

  const rating = product.averageRating || 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (addingToCart || loading) return;

    setAddingToCart(true);
    try {
      const success = await addToCart(product.productId, 1);
      if (!success) {
        // Error message đã được hiển thị trong addToCart function
      }
    } catch {
      message.error('An error occurred while adding to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div 
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative' }}
    >
      <div className="product-media" style={{ position: 'relative' }}>
        <img src={imageUrl} alt={product.productName} />
        
        {/* Add to Cart Button - chỉ hiển thị icon mờ khi hover */}
        <button
          onClick={handleAddToCart}
          disabled={addingToCart || loading}
          className="add-to-cart-btn"
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            transform: isHovered ? 'scale(1)' : 'scale(0)',
            opacity: isHovered ? 0.7 : 0,
            visibility: isHovered ? 'visible' : 'hidden',
            transition: 'all 0.3s ease',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#111827',
            border: 'none',
            padding: '12px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 10,
            width: '44px',
            height: '44px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <FaShoppingCart />
        </button>
      </div>
      <div className="product-info">
        <div className="product-title" title={product.productName}>
          {product.productName}
        </div>
        <div className="product-rating">
          {[...Array(5)].map((_, index) => (
            <FaStar
              key={index}
              style={{
                color: index < Math.floor(rating) ? "#fbbf24" : "#d1d5db",
                fontSize: "14px",
                marginRight: "2px",
              }}
            />
          ))}
          <span style={{ marginLeft: "5px", fontSize: "12px", color: "#6b7280" }}>
            ({rating.toFixed(1)})
          </span>
        </div>
        <div className="product-price">{currency(product.price)}</div>
      </div>
    </div>
  );
};

export default ProductCard;
