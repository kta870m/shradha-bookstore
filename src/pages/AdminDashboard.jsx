import { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Get user info from localStorage
        const userStr = localStorage.getItem('adminUser');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
    };

    const menuItems = [
        {
            title: 'Dashboard',
            icon: 'fa-home',
            path: '/admin/dashboard',
        },
        {
            title: 'Products',
            icon: 'fa-book',
            path: '/admin/products',
        },
        {
            title: 'Categories',
            icon: 'fa-list',
            path: '/admin/categories',
        },
        {
            title: 'Orders',
            icon: 'fa-shopping-cart',
            path: '/admin/orders',
        },
        {
            title: 'Customers',
            icon: 'fa-users',
            path: '/admin/customers',
        },
        {
            title: 'Reviews',
            icon: 'fa-star',
            path: '/admin/reviews',
        },
        {
            title: 'Feedback',
            icon: 'fa-comments',
            path: '/admin/feedback',
        },
    ];

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <i className="fas fa-book-reader"></i>
                        {!sidebarCollapsed && <span>BookStore Admin</span>}
                    </div>
                    <button
                        className="toggle-btn"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        <i className={`fas fa-${sidebarCollapsed ? 'angle-right' : 'angle-left'}`}></i>
                    </button>
                </div>

                <nav className="sidebar-menu">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            className="menu-item"
                            onClick={() => navigate(item.path)}
                        >
                            <i className={`fas ${item.icon}`}></i>
                            {!sidebarCollapsed && <span>{item.title}</span>}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            <i className="fas fa-user-circle"></i>
                        </div>
                        {!sidebarCollapsed && user && (
                            <div className="user-details">
                                <div className="user-name">{user.fullName}</div>
                                <div className="user-role">{user.userType}</div>
                            </div>
                        )}
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                <header className="content-header">
                    <h1>Dashboard</h1>
                    <div className="header-actions">
                        <button className="icon-btn">
                            <i className="fas fa-bell"></i>
                            <span className="badge">3</span>
                        </button>
                        <button className="icon-btn">
                            <i className="fas fa-cog"></i>
                        </button>
                    </div>
                </header>

                <div className="content-body">
                    {location.pathname === '/admin/dashboard' ? <DashboardHome /> : <Outlet />}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
