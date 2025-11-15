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
        const fetchCategories = async () => {
        try {
            console.log('[Categories] Starting fetch...');
            const data = await categoryApi.getFeatured(15);
            console.log('[Categories] Raw API response:', data);
            console.log('[Categories] Response type:', typeof data);
            console.log('[Categories] Is Array?', Array.isArray(data));
            
            let categoriesData = Array.isArray(data) ? data : data.$values || [];
            console.log('[Categories] After array extraction:', categoriesData);
            console.log('[Categories] Array length:', categoriesData.length);
            
            setCategories(categoriesData);
        } catch (error) {
            console.error('[Categories] Error fetching categories:', error);
            setCategories([]);
        }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
        try {
            setLoading(true);
            const [newArrivalsData, bestSellersData, featuredData] = await Promise.all([
            productApi.getNewArrivals(25),
            productApi.getBestSellers(25),
            productApi.getFeatured(25)
            ]);

            setNewArrivals(Array.isArray(newArrivalsData) ? newArrivalsData : []);
            setBestSellers(Array.isArray(bestSellersData) ? bestSellersData : []);
            setFeaturedProducts(Array.isArray(featuredData) ? featuredData : []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setNewArrivals([]);
            setBestSellers([]);
            setFeaturedProducts([]);
        } finally {
            setLoading(false);
        }
        };
        fetchProducts();
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