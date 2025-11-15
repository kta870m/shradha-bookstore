import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryApi } from '../../api/customer';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [allCategories, setAllCategories] = useState([]);
  const [dropdownCategories, setDropdownCategories] = useState({});
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [loading, setLoading] = useState({});

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const fetchAllCategories = async () => {
    try {
      const data = await categoryApi.getFeatured(15);
      const categoriesData = Array.isArray(data) ? data : data.$values || [];
      setAllCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setAllCategories([]);
    }
  };

  const fetchCategoriesByParent = async (parentName, menuIndex) => {
    // Nếu đã có cache thì không cần fetch lại
    if (dropdownCategories[parentName]) {
      return;
    }

    setLoading(prev => ({ ...prev, [menuIndex]: true }));
    
    try {
      const data = await categoryApi.getByParentName(parentName, 15);
      const categoriesData = Array.isArray(data) ? data : data.$values || [];
      setDropdownCategories(prev => ({
        ...prev,
        [parentName]: categoriesData
      }));
    } catch (error) {
      console.error(`Error fetching categories for ${parentName}:`, error);
      setDropdownCategories(prev => ({
        ...prev,
        [parentName]: []
      }));
    } finally {
      setLoading(prev => ({ ...prev, [menuIndex]: false }));
    }
  };

  const menuItems = [
    { 
      label: 'All Categories', 
      path: '/categories',
      hasDropdown: true,
      dropdownType: 'all'
    },
    { 
      label: 'Fiction', 
      path: '/products?category=1',
      hasDropdown: false
    },
    { 
      label: 'Non Fiction', 
      path: '/products?category=2',
      hasDropdown: false
    },
    { 
      label: 'VN & Southeast Asia', 
      path: '/products?category=3',
      hasDropdown: false
    },
    { 
      label: "Kid's & Young Adult", 
      path: '/products?category=4',
      hasDropdown: false
    },
    { 
      label: 'Discount Deals', 
      path: '/deals',
      hasDropdown: false
    },
    { 
      label: 'Sell Your Books', 
      path: '/sell-books',
      hasDropdown: false
    },
    { 
      label: 'Gifts & Others', 
      path: '/gifts',
      hasDropdown: false
    },
    { 
      label: 'Events', 
      path: '/events',
      hasDropdown: false
    },
    { 
      label: 'About Shradha', 
      path: '/about',
      hasDropdown: false
    },
  ];

  const handleMenuHover = (item, index) => {
    setHoveredMenu(index);
    
    // Chỉ fetch cho "All Categories" dropdown
    // Các menu khác không có dropdown nữa
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
    setHoveredMenu(null);
  };

  const renderDropdown = (item, index) => {
    if (!item.hasDropdown) return null;

    // Chỉ "All Categories" có dropdown
    if (item.dropdownType !== 'all') return null;

    let displayCategories = allCategories;

    if (displayCategories.length === 0 && !loading[index]) {
      return (
        <div className="dropdown-menu">
          <div className="dropdown-empty">No categories found</div>
        </div>
      );
    }

    if (loading[index]) {
      return (
        <div className="dropdown-menu">
          <div className="dropdown-loading">Loading...</div>
        </div>
      );
    }

    return (
      <div className="dropdown-menu">
        <ul className="dropdown-list">
          {displayCategories.map((category) => (
            <li 
              key={category.categoryId} 
              className="dropdown-item"
              onClick={() => handleCategoryClick(category.categoryId)}
            >
              {category.categoryName}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <ul className="navbar-menu">
          {menuItems.map((item, index) => (
            <li 
              key={index} 
              className="navbar-item"
              onMouseEnter={() => handleMenuHover(item, index)}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <Link to={item.path} className="navbar-link">
                {item.label}
              </Link>
              {hoveredMenu === index && renderDropdown(item, index)}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
