import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaStar, FaHeart, FaMinus, FaPlus, FaTruck, FaExchangeAlt, FaUndo, FaShippingFast, FaFacebookF } from "react-icons/fa";
import { DollarOutlined, CreditCardOutlined } from '@ant-design/icons';
import { Modal, Radio, Card, Space, Typography, Divider, Statistic } from "antd";
import { bookApi, reviewApi } from "../../../api/customer";
import { useCart } from "../../../contexts/CartContext";
import { message } from "antd";
import { createOrder } from '../../../api/orders';
import { createPayment } from '../../../api/payment';
import { convertUsdToVnd, formatVnd, CURRENCY_CONFIG } from '../../../config/currency';
import "./BookDetail.css";

const { Text } = Typography;

const currency = (v) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, loading: cartLoading } = useCart();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [sameCategoryBooks, setSameCategoryBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedFormat, setSelectedFormat] = useState("PAPERBACK");
    const [selectedCondition, setSelectedCondition] = useState("NEW");
    const [addingToCart, setAddingToCart] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online');
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [refreshReview, setRefreshReview] = useState(false);


    // Get userId from JWT token
    const getUserId = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return parseInt(payload.sid);
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchProductDetail = async () => {
        try {
            setLoading(true);
            const data = await bookApi.getById(id);
            console.log('[BookDetail] Product data:', data);
            setProduct(data);
            setLoading(false); // Set loading false ngay sau khi có product data

            // Fetch related books không blocking
            if (data.categoryId) {
                console.log('[BookDetail] Fetching related books for category:', data.categoryId);
                
                // Fetch related books với error handling riêng
                bookApi.getRelatedBooks(id, data.categoryId, 4)
                    .then(related => {
                        console.log('[BookDetail] Related books (You Might Also Enjoy):', related);
                        setRelatedProducts(related);
                        
                        // Fetch same category books
                        return bookApi.getRelatedBooks(id, data.categoryId, 10)
                            .then(sameCategory => {
                                console.log('[BookDetail] Same category books:', sameCategory);
                                const filteredSameCategory = sameCategory.filter(
                                    book => !related.some(r => r.productId === book.productId)
                                ).slice(0, 6);
                                setSameCategoryBooks(filteredSameCategory);
                            });
                    })
                    .catch(error => {
                        console.error("Error fetching related books:", error);
                        // Không hiển thị error cho user, chỉ log
                        setRelatedProducts([]);
                        setSameCategoryBooks([]);
                    });
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            setLoading(false);
        }
        };

        fetchProductDetail();
        window.scrollTo(0, 0); // Scroll to top khi chuyển trang
    }, [id]);

    useEffect(() => {
        if (!product?.productId) return;
        loadReviews();
    }, [product?.productId, refreshReview]);

    const loadReviews = async () => {
        try {
            setLoadingReviews(true);
            const data = await reviewApi.getByProduct(product.productId);
            console.log("Loaded reviews:", data);
            setReviews(data.reviews || data); 
        } catch (err) {
            console.log("Load review failed:", err);
        } finally {
            setLoadingReviews(false);
        }
    };

    const handleSubmitReview = async () => {
        const userId = getUserId();
        if (!userId) {
            message.error("Please login to submit a review!");
            return navigate("/login");
        }

        if (!reviewComment.trim()) {
            return message.error("Comment cannot be empty!");
        }

        try {
            await reviewApi.submitReview({
                userId: userId,
                productId: product.productId,
                rating: reviewRating,
                comment: reviewComment
            });

            message.success("Review submitted!");
            setReviewComment("");
            setReviewRating(5);
            setRefreshReview(prev => !prev); // reload
        } catch (error) {
            message.error("Failed to submit review");
        }
    };


    const handleQuantityChange = (action) => {
        if (action === "increase") {
        setQuantity(prev => Math.min(prev + 1, product?.stockQuantity || 99));
        } else if (action === "decrease" && quantity > 1) {
        setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = async () => {
        if (addingToCart || cartLoading) return;

        setAddingToCart(true);
        try {
            const success = await addToCart(product.productId, quantity);
            if (success) {
                message.success(`Added ${quantity} item(s) to cart successfully!`);
                // Reset quantity after adding to cart
                setQuantity(1);
            }
        } catch {
            message.error('An error occurred while adding to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = () => {
        const userId = getUserId();
        if (!userId) {
            message.error('Please login to buy');
            navigate('/login');
            return;
        }

        if (!product || quantity < 1) {
            message.error('Invalid product or quantity');
            return;
        }

        // Show payment method selection modal
        setShowPaymentModal(true);
    };

    const handlePaymentMethodConfirm = async () => {
        setShowPaymentModal(false);
        setCheckoutLoading(true);

        const userId = getUserId();

        try {
            // Create order with single product
            const orderDetails = [{
                productId: product.productId,
                quantity: quantity
            }];

            const orderResponse = await createOrder({
                userId: userId,
                shippingFee: 0,
                paymentMethod: paymentMethod === 'cod' ? 'COD' : 'VNPAY',
                orderDetails: orderDetails
            });

            if (paymentMethod === 'cod') {
                // COD payment - Order is confirmed
                message.success('Order placed successfully with Cash on Delivery!');
                
                // Navigate to orders page
                navigate('/orders');
            } else {
                // Online payment - Store info and redirect to VNPay
                localStorage.setItem('pendingOrderId', orderResponse.orderId.toString());

                // Create payment and get VNPay URL
                const paymentResponse = await createPayment({
                    orderId: orderResponse.orderId,
                    returnUrl: `${window.location.origin}/payment-return`
                });

                // Redirect to VNPay
                window.location.href = paymentResponse.paymentUrl;
            }
        } catch (error) {
            console.error('Buy now error:', error);
            message.error(error.response?.data?.message || 'Failed to process order');
            setCheckoutLoading(false);
        }
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
                <button 
                    className="btn-add-cart" 
                    onClick={handleAddToCart}
                    disabled={addingToCart || cartLoading || product.stockQuantity === 0}
                >
                    {addingToCart ? 'Adding...' : 'Add to cart'}
                </button>
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

        <div className="reviews-section">
            <h2>CUSTOMER REVIEWS</h2>

            {/* Review Form */}
            <div className="review-form">
                <h3>Write a Review</h3>

                <div className="rating-stars">
                    {[1,2,3,4,5].map(star => (
                        <FaStar
                            key={star}
                            onClick={() => setReviewRating(star)}
                            style={{
                                cursor: "pointer",
                                color: reviewRating >= star ? "#fbbf24" : "#ccc",
                                fontSize: "22px",
                                marginRight: "4px"
                            }}
                        />
                    ))}
                </div>

                <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your thoughts about this book..."
                />

                <button className="submit-review-btn" onClick={handleSubmitReview}>
                    Submit Review
                </button>
            </div>

            <Divider />

            {/* Review List */}
            {loadingReviews ? (
                <p>Loading reviews...</p>
            ) : reviews.length === 0 ? (
                <p>No reviews yet. Be the first to review!</p>
            ) : (
                <div className="review-list">
                    {reviews.map(review => (
                        <div key={review.reviewId} className="review-item">
                            <div className="review-header">
                                <strong>{review.userName}</strong>
                                <span>{new Date(review.reviewDate).toLocaleDateString()}</span>
                            </div>

                            <div className="review-stars-small">
                                {[1,2,3,4,5].map(star => (
                                    <FaStar
                                        key={star}
                                        style={{
                                            color: star <= review.rating ? "#fbbf24" : "#ccc",
                                            fontSize: "16px"
                                        }}
                                    />
                                ))}
                            </div>

                            <p className="review-comment">{review.comment}</p>
                        </div>
                    ))}
                </div>
            )}
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

        {/* Payment Method Selection Modal */}
        <Modal
            title="Select Payment Method"
            open={showPaymentModal}
            onOk={handlePaymentMethodConfirm}
            onCancel={() => setShowPaymentModal(false)}
            okText="Confirm Order"
            cancelText="Cancel"
            okButtonProps={{ loading: checkoutLoading }}
            width={500}
        >
            <Space direction="vertical" size="large" style={{ width: '100%', padding: '20px 0' }}>
                <Text>Please select your preferred payment method:</Text>
                
                <Radio.Group 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                    value={paymentMethod}
                    style={{ width: '100%' }}
                >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Card 
                            hoverable
                            style={{ 
                                border: paymentMethod === 'online' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                cursor: 'pointer'
                            }}
                            onClick={() => setPaymentMethod('online')}
                        >
                            <Radio value="online">
                                <Space>
                                    <CreditCardOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                                    <div>
                                        <Text strong>Online Payment (VNPay)</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            Pay securely with VNPay gateway
                                        </Text>
                                    </div>
                                </Space>
                            </Radio>
                        </Card>

                        <Card 
                            hoverable
                            style={{ 
                                border: paymentMethod === 'cod' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                cursor: 'pointer'
                            }}
                            onClick={() => setPaymentMethod('cod')}
                        >
                            <Radio value="cod">
                                <Space>
                                    <DollarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                                    <div>
                                        <Text strong>Cash on Delivery (COD)</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            Pay when you receive your order
                                        </Text>
                                    </div>
                                </Space>
                            </Radio>
                        </Card>
                    </Space>
                </Radio.Group>

                <Divider style={{ margin: '8px 0' }} />
                
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Quantity:</Text>
                        <Text strong style={{ fontSize: '16px' }}>
                            {quantity} {quantity === 1 ? 'item' : 'items'}
                        </Text>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Total Amount (USD):</Text>
                        <Text strong style={{ fontSize: '18px' }}>
                            ${(product?.price * quantity).toFixed(2)}
                        </Text>
                    </div>
                    
                    {paymentMethod === 'online' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary">Amount in VND:</Text>
                            <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                                {formatVnd(convertUsdToVnd(product?.price * quantity))}
                            </Text>
                        </div>
                    )}
                    
                    <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>
                        {paymentMethod === 'online' && `Exchange rate: 1 USD ≈ ${CURRENCY_CONFIG.USD_TO_VND_RATE.toLocaleString('vi-VN')} VND`}
                    </Text>
                </Space>
            </Space>
        </Modal>
      </div>
    );
};

export default BookDetail;