import React from "react";
import { useNavigate } from "react-router-dom";

const CategoryBadges = ({ categories }) => {
  const navigate = useNavigate();

  return (
    <div className="category-badges-section">
      <h2 className="section-title">Browse by Category</h2>
      <div className="category-badges">
        {categories.map((category) => (
          <div
            key={category.categoryId}
            className="category-badge"
            onClick={() => navigate(`/products?category=${category.categoryId}`)}
          >
            {category.categoryName}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBadges;
