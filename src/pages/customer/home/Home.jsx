import React, { useState, useEffect } from "react";
import { productApi, categoryApi } from "../../../api/customer";
import Banner from "./Banner";
import PromoBanner from "./PromoBanner";
import CategoryBadges from "./CategoryBadges";
import ProductSection from "./ProductSection";
import ReviewCarousel from "./ReviewCarousel";
import ReviewSection from "./ReviewSection";
import "./Home.css";


const Home = () => {
    const [categories, setCategories] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        newArrivals: false,
        bestSellers: false,
        featured: false,
    });

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [categoryRes, newA, best, featured] = await Promise.all([
                    categoryApi.getFeatured(15),
                    productApi.getNewArrivals(20),
                    productApi.getBestSellers(25),
                    productApi.getFeatured(15),
                ]);

                setCategories(categoryRes);
                setNewArrivals(newA);
                setBestSellers(best);
                setFeaturedProducts(featured);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <div className="home-page">
            <Banner />
            <PromoBanner />

            {categories.length > 0 && <CategoryBadges categories={categories} />}

            <div className="products-container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>Loading products...</p>
                    </div>
                ) : newArrivals.length === 0 && bestSellers.length === 0 && featuredProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <h3>No products found</h3>
                        <p>The database is empty. Please add some products via the Admin panel.</p>
                    </div>
                ) : (
                    <>
                        <ProductSection
                            title="NEW ARRIVALS"
                            products={newArrivals}
                            isExpanded={expandedSections.newArrivals}
                            onToggle={() => toggleSection('newArrivals')}
                        />

                        <ProductSection
                            title="BESTSELLERS"
                            products={bestSellers}
                            isExpanded={expandedSections.bestSellers}
                            onToggle={() => toggleSection('bestSellers')}
                        />

                        <ProductSection
                            title="FEATURED PRODUCTS"
                            products={featuredProducts}
                            isExpanded={expandedSections.featured}
                            onToggle={() => toggleSection('featured')}
                        />
                    </>
                )}
            </div>
            <ReviewCarousel />
            <ReviewSection />
        </div>
    );
};

export default Home;