    import React, { useState, useEffect } from "react";
    import { useSearchParams, useNavigate } from "react-router-dom";
    import "./SearchResults.css";

    const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get("q");
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) {
        fetchSearchResults();
        }
    }, [query]);

    const fetchSearchResults = async () => {
        try {
        setLoading(true);
        const response = await window.$axios.get(`/products/search`, {
            params: { 
            q: query,
            limit: 100 
            }
        });
        
        const results = Array.isArray(response.data) 
            ? response.data 
            : response.data.$values || [];
        
        setProducts(results);
        } catch (error) {
        console.error("Error searching products:", error);
        setProducts([]);
        } finally {
        setLoading(false);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/book/${productId}`);
    };

    if (loading) {
        return (
        <div className="search-results-page">
            <div className="loading-container">
            <p>Searching...</p>
            </div>
        </div>
        );
    }

    return (
        <div className="search-results-page">
        <div className="search-header">
            <h1 className="search-title">
            Search Results for "{query}"
            </h1>
            <p className="search-subtitle">
            Found {products.length} {products.length === 1 ? 'result' : 'results'}
            </p>
        </div>

        {products.length === 0 ? (
            <div className="no-results">
            <h3>No books found</h3>
            <p>Try different keywords or browse our categories</p>
            <button onClick={() => navigate("/")} className="back-home-btn">
                Back to Home
            </button>
            </div>
        ) : (
            <div className="search-results-grid">
            {products.map((product) => {
                const imageUrl = product.thumbnailUrl || "/placeholder.jpg";
                
                return (
                <div
                    key={product.productId}
                    className="search-result-card"
                    onClick={() => handleProductClick(product.productId)}
                >
                    <div className="result-image-wrapper">
                    <img
                        src={imageUrl}
                        alt={product.productName}
                        className="result-image"
                        onError={(e) => {
                        e.target.src = "/placeholder.jpg";
                        }}
                    />
                    </div>
                    <div className="result-info">
                    <h3 className="result-title">{product.productName}</h3>
                    <p className="result-code">Code: {product.productCode}</p>
                    <div className="result-footer">
                        <span className="result-price">
                        {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        }).format(product.price || 0)}
                        </span>
                        <span className={`result-stock ${product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                        </span>
                    </div>
                    </div>
                </div>
                );
            })}
            </div>
        )}
        </div>
    );
    };

    export default SearchResults;
