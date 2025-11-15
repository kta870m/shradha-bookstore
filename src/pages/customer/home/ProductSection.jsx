import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ProductCard from "./ProductCard";

const ProductSection = ({ title, products, isExpanded, onToggle }) => {
  const carouselRef = React.useRef(null);
  const displayProducts = isExpanded ? products : products.slice(0, 6);

  return (
    <div className="product-section">
      <div className="section-header">
        <h2>{title}</h2>
        <div className="section-controls">
          <button 
            className="carousel-btn prev"
            onClick={() => carouselRef.current?.prev()}
          >
            <FaChevronLeft />
          </button>
          <button 
            className="carousel-btn next"
            onClick={() => carouselRef.current?.next()}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
      
      <div className="products-carousel">
        <div className="products-grid">
          {displayProducts.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      </div>

      {products.length > 6 && (
        <div className="see-more-container">
          <button className="see-more-btn" onClick={onToggle}>
            {isExpanded ? "Show Less" : `See More (${products.length - 6} more)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductSection;
