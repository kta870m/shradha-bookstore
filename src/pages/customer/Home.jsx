import React, { useMemo, useState } from 'react';
import './Home.css';

const MOCK_CATEGORIES = [
  'Activity Books',
  'Arts & Design',
  'Baby',
  'Biographies',
  "Children's Books",
  "Children's Non Fiction",
  "Children's Novels",
  "Children's Science",
  'Cookbooks',
  'Crime & Thriller',
  'Educations',
  'Fiction',
  'Graphic Novels',
  'Languages',
  'Medical',
  'Music',
  'Non Fiction',
];

const MOCK_PRODUCTS = [
  {
    id: 'p1',
    title: 'Alchemised',
    author: 'SenLinYu',
    price: 780000,
    category: 'Fiction',
    image:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=720&auto=format&fit=crop',
  },
  {
    id: 'p2',
    title: 'A Case of Mice and Murder',
    author: 'Sally Smith',
    price: 380000,
    category: 'Fiction',
    image:
      'https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=720&auto=format&fit=crop',
  },
  {
    id: 'p3',
    title: 'Aflame: Learning from Silence',
    author: 'Pico Iyer',
    price: 380000,
    category: 'Non Fiction',
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=720&auto=format&fit=crop',
  },
  {
    id: 'p4',
    title: 'Death at the Sign of the Rook',
    author: 'Kate Atkinson',
    price: 280000,
    category: 'Fiction',
    image:
      'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=720&auto=format&fit=crop',
  },
  {
    id: 'p5',
    title: 'Andy Warhol & Pat Hackett Poems',
    author: 'Andy Warhol',
    price: 120000,
    category: 'Art-Books',
    image:
      'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=720&auto=format&fit=crop',
  },
  {
    id: 'p6',
    title: 'Feed',
    author: 'Mira Grant',
    price: 120000,
    category: 'Fiction',
    image:
      'https://images.unsplash.com/photo-1526312426976-593c0fbe24e4?q=80&w=720&auto=format&fit=crop',
  },
];

const currency = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const SectionHeader = ({ title, tabs, active, onChange }) => {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {!!tabs?.length && (
        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t}
              className={`tab ${active === t ? 'active' : ''}`}
              onClick={() => onChange(t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-media">
        <img src={product.image} alt={product.title} />
      </div>
      <div className="product-info">
        <div className="product-title" title={product.title}>{product.title}</div>
        <div className="product-author">{product.author}</div>
        <div className="product-price">{currency(product.price)}</div>
      </div>
    </div>
  );
};

const Home = () => {
  const [newArrivalsTab, setNewArrivalsTab] = useState('All');
  const [bestsellersTab, setBestsellersTab] = useState('All');

  const newArrivals = useMemo(() => MOCK_PRODUCTS, []);
  const bestsellers = useMemo(() => [...MOCK_PRODUCTS].reverse(), []);

  const filterByTab = (list, tab) => {
    if (tab === 'All') return list;
    return list.filter((p) => (tab === 'Non Fiction' ? p.category === 'Non Fiction' : p.category === tab));
  };

  return (
    <div className="home-page">
      {/* Promotion banner under navbar */}
      <div className="promo-banner">
        <div className="promo-item promo-sell">
          <div className="promo-title">SELL YOUR BOOKS</div>
          <div className="promo-sub">for the best price in town</div>
        </div>
        <div className="promo-item promo-discount">
          <div className="promo-title">5% DISCOUNT</div>
          <div className="promo-sub">for Bookworm Online Membership</div>
        </div>
        <div className="promo-item promo-delivery">
          <div className="promo-title">SAME-DAY DELIVERY</div>
          <div className="promo-sub">Free shipping ≥ 500,000 VND</div>
        </div>
      </div>

      <div className="content-grid">
        <aside className="sidebar">
          <div className="sidebar-title">CATEGORIES</div>
          <ul className="category-list">
            {MOCK_CATEGORIES.map((c) => (
              <li key={c} className="category-item">{c}</li>
            ))}
          </ul>
        </aside>

        <section className="main-section">
          <div className="products-section">
            <SectionHeader
              title="NEW ARRIVALS"
              tabs={[ 'All', 'Fiction', 'Non Fiction', "Children's Books" ]}
              active={newArrivalsTab}
              onChange={setNewArrivalsTab}
            />
            <div className="product-row">
              {filterByTab(newArrivals, newArrivalsTab).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>

          <div className="products-section">
            <SectionHeader
              title="BESTSELLERS"
              tabs={[ 'All', 'Fiction', 'Non Fiction', 'Art-Books' ]}
              active={bestsellersTab}
              onChange={setBestsellersTab}
            />
            <div className="product-row">
              {filterByTab(bestsellers, bestsellersTab).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
