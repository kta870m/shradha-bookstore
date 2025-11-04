import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaRegHeart, FaSearch } from 'react-icons/fa';
import { AiOutlineShoppingCart, AiOutlineUser } from 'react-icons/ai';
import './Header.css';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  const handleSearchAll = () => {
    navigate('/products');
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo-link">
          <img 
            src="/assets/shradha-logo.jpg" 
            alt="Shradha Bookstore" 
            className="logo"
          />
        </Link>

        {/* Search Bar */}
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, author... ENTER for all results"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !searchQuery.trim()) {
                e.preventDefault();
                handleSearchAll();
              }
            }}
          />
          <button type="submit" className="search-button">
            <FaSearch className="search-icon" />
            Search
          </button>
        </form>

        {/* Header Icons */}
        <div className="header-icons">
          <Link to="/wishlist" className="header-icon">
            <FaRegHeart className="icon" />
            <span className="icon-label">Wish List</span>
          </Link>
          
          <Link to="/cart" className="header-icon">
            <AiOutlineShoppingCart className="icon" />
            <span className="icon-label">Cart</span>
            <span className="cart-badge">0</span>
          </Link>
          
          <Link to="/account" className="header-icon">
            <AiOutlineUser className="icon" />
            <span className="icon-label">User</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
