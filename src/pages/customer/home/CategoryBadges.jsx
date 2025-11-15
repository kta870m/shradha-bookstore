import React from "react";
import { useNavigate } from "react-router-dom";

const CategoryBadges = ({ categories }) => {
  const navigate = useNavigate();

  return (
    <div className="category-badges-section">
      <h2 className="section-title">Browse by Category</h2>
      <div className="category-badges">
        {categories.map((category) => {
          // API featured endpoint trả về camelCase
          const id = category.categoryId;
          const name = category.categoryName;
          return (
            <div
              key={id}
              className="category-badge"
              onClick={() => navigate(`/products?category=${id}`)}
            >
              {name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBadges;
