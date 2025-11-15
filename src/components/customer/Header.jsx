import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaRegHeart, FaSearch } from 'react-icons/fa';
import { AiOutlineShoppingCart, AiOutlineUser } from 'react-icons/ai';
import { Dropdown } from 'antd';
import { useCart } from '../../contexts/CartContext';
import LoginModal from './LoginModal';
import './Header.css';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const { getTotalItems, loadCart } = useCart();

  const totalItems = getTotalItems();

  // Load user từ localStorage
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    };

    loadUser();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  const handleSearchAll = () => {
    navigate('/products');
  };

  const handleLoginSuccess = () => {
    // Reload user data
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    // Reload cart
    loadCart();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    window.location.reload(); // Reload để clear cart context
  };

  // Menu items cho user dropdown
  const userMenuItems = [
    {
      key: 'account',
      label: 'My Account',
      onClick: () => navigate('/account'),
    },
    {
      key: 'orders',
      label: 'Orders',
      onClick: () => navigate('/orders'),
    },
    {
      key: 'divider',
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

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
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
          
          {/* User / Login Button */}
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div className="header-icon" style={{ cursor: 'pointer' }}>
                <AiOutlineUser className="icon" />
                <span className="icon-label">{user.fullName || user.username}</span>
              </div>
            </Dropdown>
          ) : (
            <div 
              className="header-icon" 
              style={{ cursor: 'pointer' }}
              onClick={() => setShowLoginModal(true)}
            >
              <AiOutlineUser className="icon" />
              <span className="icon-label">Login</span>
            </div>
          )}
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
};

export default Header;
