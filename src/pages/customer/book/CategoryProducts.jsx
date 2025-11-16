import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { bookApi, categoryApi } from "../../../api/customer";
import "./CategoryProducts.css";

const CategoryProducts = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryId = searchParams.get("category");
  
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 24;

  useEffect(() => {
    if (categoryId) {
      fetchData();
    }
  }, [categoryId, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch cả 2 cùng lúc thay vì tuần tự
      // Lấy pageSize lớn để có tất cả products (hoặc có thể dùng 1000)
      const [productsResponse, categoryResponse] = await Promise.all([
        window.$axios.get(`/products/by-category/${categoryId}`, {
          params: { pageSize: 1000 } // Lấy tất cả products của category
        }),
        window.$axios.get(`/categories/${categoryId}`).catch(() => ({ data: { categoryName: "Category" } }))
      ]);
      
      // Set category name
      setCategoryName(categoryResponse.data.categoryName || "Category");
      
      // Process products
      const allProducts = Array.isArray(productsResponse.data) 
        ? productsResponse.data 
        : productsResponse.data.$values || [];
      
      // Calculate pagination
      const total = Math.ceil(allProducts.length / productsPerPage);
      setTotalPages(total);
      
      // Get products for current page
      const startIndex = (currentPage - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      const paginatedProducts = allProducts.slice(startIndex, endIndex);
      
      setProducts(paginatedProducts);
    } catch (error) {
      console.error("Error fetching data:", error);
      setProducts([]);
      setCategoryName("Category");
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/book/${productId}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        className={`pagination-btn ${currentPage === 1 ? "disabled" : ""}`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className="pagination-btn"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          className="pagination-btn"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        className={`pagination-btn ${currentPage === totalPages ? "disabled" : ""}`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    );

    return <div className="pagination">{pages}</div>;
  };

  if (loading) {
    return (
      <div className="category-products-page">
        <div className="loading-container">
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-products-page">
      <div className="category-header">
        <h1 className="category-title">{categoryName}</h1>
        <p className="category-subtitle">
          Showing {products.length} of {products.length + (totalPages - 1) * productsPerPage} books
        </p>
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <h3>No books found in this category</h3>
          <button onClick={() => navigate("/")} className="back-home-btn">
            Back to Home
          </button>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map((product) => {
              const imageUrl = product.mediaFiles?.[0]?.mediaUrl || 
                              product.mediaFiles?.$values?.[0]?.mediaUrl || 
                              "/placeholder.jpg";
              
              return (
                <div
                  key={product.productId}
                  className="product-card"
                  onClick={() => handleProductClick(product.productId)}
                >
                  <div className="product-image-wrapper">
                    <img
                      src={imageUrl}
                      alt={product.productName}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = "/placeholder.jpg";
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.productName}</h3>
                    <p className="product-author">
                      {product.manufacturer || product.author || "Unknown Author"}
                    </p>
                    <div className="product-footer">
                      <span className="product-price">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(product.price || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default CategoryProducts;
