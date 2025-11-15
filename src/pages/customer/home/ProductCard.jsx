import React from "react";
import { FaStar } from "react-icons/fa";

const currency = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

const ProductCard = ({ product }) => {
  const imageUrl = product.mediaFiles && product.mediaFiles.length > 0 
    ? product.mediaFiles[0].mediaUrl 
    : product.thumbnailUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=720&auto=format&fit=crop";

  const rating = product.averageRating || 0;

  return (
    <div className="product-card">
      <div className="product-media">
        <img src={imageUrl} alt={product.productName} />
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
