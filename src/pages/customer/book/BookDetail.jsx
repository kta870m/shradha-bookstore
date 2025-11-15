import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaStar, FaHeart, FaMinus, FaPlus, FaTruck, FaExchangeAlt, FaUndo, FaShippingFast, FaFacebookF } from "react-icons/fa";
import { bookApi } from "../../../api/customer";
import "./BookDetail.css";

const currency = (v) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [sameCategoryBooks, setSameCategoryBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedFormat, setSelectedFormat] = useState("PAPERBACK");
    const [selectedCondition, setSelectedCondition] = useState("NEW");

    useEffect(() => {
        const fetchProductDetail = async () => {
        try {
            setLoading(true);
            const data = await bookApi.getById(id);
            console.log('[BookDetail] Product data:', data);
            setProduct(data);

            // Lấy sản phẩm "You Might Also Like" (4 sách)
            if (data.categoryId) {
                console.log('[BookDetail] Fetching related books for category:', data.categoryId);
                const related = await bookApi.getRelatedBooks(id, data.categoryId, 4);
                console.log('[BookDetail] Related books (You Might Also Enjoy):', related);
                setRelatedProducts(related);
                
                // Lấy sách cùng category cho section dưới (6 sách khác)
                const sameCategory = await bookApi.getRelatedBooks(id, data.categoryId, 10);
                console.log('[BookDetail] Same category books:', sameCategory);
                // Lấy 6 sách khác với "You Might Also Enjoy"
                const filteredSameCategory = sameCategory.filter(
                    book => !related.some(r => r.productId === book.productId)
                ).slice(0, 6);
                setSameCategoryBooks(filteredSameCategory);
            }
        } catch (error) {
            console.error("Error fetching product:", error);
        } finally {
            setLoading(false);
        }
        };

        fetchProductDetail();
        window.scrollTo(0, 0); // Scroll to top khi chuyển trang
    }, [id]);

    const handleQuantityChange = (action) => {
        if (action === "increase") {
        setQuantity(prev => Math.min(prev + 1, product?.stockQuantity || 99));
        } else if (action === "decrease" && quantity > 1) {
        setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
        // TODO: Implement add to cart logic
        console.log("Add to cart:", { product, quantity, selectedFormat, selectedCondition });
    };

    const handleBuyNow = () => {
        // TODO: Implement buy now logic
        console.log("Buy now:", { product, quantity, selectedFormat, selectedCondition });
    };

    if (loading) {
        return (
        <div className="book-detail-loading">
            <p>Loading product details...</p>
        </div>
        );
    }

    if (!product) {
        return (
        <div className="book-detail-error">
            <h3>Product not found</h3>
            <button onClick={() => navigate("/")}>Back to Home</button>
        </div>
        );
    }

    const imageUrl = product.mediaFiles && product.mediaFiles.length > 0 
        ? product.mediaFiles[0].mediaUrl 
        : product.thumbnailUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=720&auto=format&fit=crop";

    const rating = product.averageRating || 0;

    return (
        <div className="book-detail-page">
        {/* Breadcrumb */}
        <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>&gt;</span>
            <Link to="/new-arrivals">New Arrivals</Link>
            <span>&gt;</span>
            <Link to="/non-fiction">Non Fiction</Link>
            <span>&gt;</span>
            <span>{product.productName}</span>
        </div>

        {/* Main Product Section */}
        <div className="book-detail-container">
            {/* Left: Product Image */}
            <div className="book-image-section">
            <img src={imageUrl} alt={product.productName} />
            <button className="wishlist-btn">
                <FaHeart /> Add to Wish List
            </button>
            </div>

            {/* Middle: Product Info */}
            <div className="book-info-section">
            <h1 className="book-title">{product.productName}</h1>
            <p className="book-author">
                By: <Link to={`/author/${product.author}`} className="author-link">{product.author || "Unknown Author"}</Link>
            </p>

            <div className="book-category">
                Category: <Link to={`/category/${product.categoryId}`} className="category-link">{product.categoryName || "Uncategorized"}</Link>
            </div>

            <div className="book-price">{currency(product.price)}</div>

            <div className="book-meta">
                <div className="meta-item">
                <span className="meta-icon">📚</span>
                <span className="meta-label">Publisher:</span>
                <span className="meta-value">{product.publisher || "N/A"}</span>
                </div>
                <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span className="meta-label">Released Date:</span>
                <span className="meta-value">{product.publicationDate || "N/A"}</span>
                </div>
                <div className="meta-item">
                <span className="meta-icon">📖</span>
                <span className="meta-label">ISBN:</span>
                <span className="meta-value">{product.isbn || "N/A"}</span>
                </div>
            </div>

            {/* Format Selection */}
            <div className="selection-group">
                <h4>Format</h4>
                <div className="format-options">
                <button 
                    className={`format-btn ${selectedFormat === "PAPERBACK" ? "active" : ""}`}
                    onClick={() => setSelectedFormat("PAPERBACK")}
                >
                    PAPERBACK
                </button>
                <button 
                    className={`format-btn ${selectedFormat === "HARDCOVER" ? "active" : ""}`}
                    onClick={() => setSelectedFormat("HARDCOVER")}
                >
                    HARDCOVER
                </button>
                </div>
            </div>

            {/* Condition Selection */}
            <div className="selection-group">
                <h4>Condition</h4>
                <div className="condition-options">
                <button 
                    className={`condition-btn ${selectedCondition === "NEW" ? "active" : ""}`}
                    onClick={() => setSelectedCondition("NEW")}
                >
                    NEW
                </button>
                <button 
                    className={`condition-btn ${selectedCondition === "USED" ? "active" : ""}`}
                    onClick={() => setSelectedCondition("USED")}
                >
                    USED
                </button>
                </div>
            </div>

            {/* Quantity */}
            <div className="quantity-section">
                <h4>QUANTITY</h4>
                <div className="quantity-controls">
                <button onClick={() => handleQuantityChange("decrease")} disabled={quantity <= 1}>
                    <FaMinus />
                </button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => handleQuantityChange("increase")} disabled={quantity >= (product.stockQuantity || 99)}>
                    <FaPlus />
                </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
                <button className="btn-buy-now" onClick={handleBuyNow}>Buy Now</button>
                <button className="btn-add-cart" onClick={handleAddToCart}>Add to cart</button>
            </div>

            <div className="availability-badge">
                Availability: <span className={product.stockQuantity > 0 ? "in-stock" : "out-stock"}>
                {product.stockQuantity > 0 ? product.stockQuantity : "Out of Stock"}
                </span>
            </div>
            </div>

            {/* Right: Sidebar */}
            <div className="book-sidebar">
                <div className="sidebar-feature">
                    <FaTruck className="sidebar-icon" />
                    <div className="sidebar-text">
                        <h4>Nationwide Shipping</h4>
                    </div>
                </div>
                <div className="sidebar-feature">
                    <FaShippingFast className="sidebar-icon" />
                    <div className="sidebar-text">
                        <h4>Fast Shipping: Same day Delivery</h4>
                    </div>
                </div>
                <div className="sidebar-feature">
                    <FaExchangeAlt className="sidebar-icon" />
                    <div className="sidebar-text">
                        <h4>Exchange in 48 hours</h4>
                    </div>
                </div>
                <div className="sidebar-feature">
                    <FaUndo className="sidebar-icon" />
                    <div className="sidebar-text">
                        <h4>Repay 1/3 the purchase price of books returns in good condition</h4>
                    </div>
                </div>
                <div className="sidebar-feature">
                    <FaTruck className="sidebar-icon" />
                    <div className="sidebar-text">
                        <h4>Free Shipping for orders &gt;500k in Hanoi, or &gt;800k outside Hanoi</h4>
                    </div>
                </div>
                <div className="sidebar-cta">
                    <h3>CAN'T FIND BOOK IN STOCK?</h3>
                    <button className="ordering-btn">Ordering Books</button>
                </div>
                <div className="sidebar-social">
                    <h3>FIND US ON FACEBOOK</h3>
                    <div className="facebook-placeholder">
                        <FaFacebookF size={40} color="#1877f2" />
                        <p>Follow us on Facebook</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Book Overview */}
        <div className="book-overview-section">
            <h2>BOOK OVERVIEW</h2>
            <div className="overview-content">
            <p>{product.description || "No description available for this book."}</p>
            </div>
        </div>

        {/* Same Category Books Section */}
        {sameCategoryBooks.length > 0 && (
            <div className="same-category-section">
            <h2 className="section-title-red">{product.categoryName || "Related Books"}</h2>
            <div className="same-category-grid">
                {sameCategoryBooks.map((book) => {
                const bookImageUrl = book.mediaFiles && book.mediaFiles.length > 0 
                    ? book.mediaFiles[0].mediaUrl 
                    : book.thumbnailUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=720&auto=format&fit=crop";
                
                return (
                    <div 
                    key={book.productId} 
                    className="same-category-card"
                    onClick={() => navigate(`/book/${book.productId}`)}
                    >
                    <img src={bookImageUrl} alt={book.productName} />
                    <div className="same-category-info">
                        <h4>{book.productName}</h4>
                        <p className="same-category-author">{book.author || "Unknown Author"}</p>
                        <div className="same-category-rating">
                        {[...Array(5)].map((_, index) => (
                            <FaStar
                            key={index}
                            style={{
                                color: index < Math.floor(book.averageRating || 0) ? "#fbbf24" : "#d1d5db",
                                fontSize: "12px",
                            }}
                            />
                        ))}
                        </div>
                        <p className="same-category-price">{currency(book.price)}</p>
                    </div>
                    </div>
                );
                })}
            </div>
            </div>
        )}

        {/* You Might Also Like */}
        {relatedProducts.length > 0 && (
            <div className="related-products-section">
            <h2>YOU MIGHT ALSO ENJOY</h2>
            <div className="related-products-grid">
                {relatedProducts.map((relatedProduct) => {
                const relatedImageUrl = relatedProduct.mediaFiles && relatedProduct.mediaFiles.length > 0 
                    ? relatedProduct.mediaFiles[0].mediaUrl 
                    : relatedProduct.thumbnailUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=720&auto=format&fit=crop";
                
                return (
                    <div 
                    key={relatedProduct.productId} 
                    className="related-product-card"
                    onClick={() => navigate(`/book/${relatedProduct.productId}`)}
                    >
                    <img src={relatedImageUrl} alt={relatedProduct.productName} />
                    <div className="related-product-info">
                        <h4>{relatedProduct.productName}</h4>
                        <div className="related-product-rating">
                        {[...Array(5)].map((_, index) => (
                            <FaStar
                            key={index}
                            style={{
                                color: index < Math.floor(relatedProduct.averageRating || 0) ? "#fbbf24" : "#d1d5db",
                                fontSize: "12px",
                            }}
                            />
                        ))}
                        </div>
                        <p className="related-product-price">{currency(relatedProduct.price)}</p>
                    </div>
                    </div>
                );
                })}
            </div>
            </div>
        )}
        </div>
    );
};

export default BookDetail;