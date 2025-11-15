import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const menuItems = [
    { label: 'All Categories', path: '/categories' },
    { label: 'Fiction', path: '/categories/fiction' },
    { label: 'Non Fiction', path: '/categories/non-fiction' },
    { label: 'VN & Southeast Asia', path: '/categories/vn-southeast-asia' },
    { label: "Kid's & Young Adult", path: '/categories/kids-young-adult' },
    { label: 'Discount Deals', path: '/deals' },
    { label: 'Sell Your Books', path: '/sell' },
    { label: 'About Shradha', path: '/about' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <ul className="navbar-menu">
          {menuItems.map((item, index) => (
            <li key={index} className="navbar-item">
              <Link to={item.path} className="navbar-link">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
