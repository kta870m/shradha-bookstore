import { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Badge, Typography } from 'antd';
import {
    DashboardOutlined,
    ShoppingOutlined,
    UnorderedListOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    TeamOutlined,
    StarOutlined,
    MessageOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BellOutlined,
    SettingOutlined,
    LogoutOutlined,
    BookOutlined
} from '@ant-design/icons';
import { isAdmin, getUserFromToken, isTokenExpired } from '../../utils/jwtHelper';
import DashboardHome from './DashboardHome';
import '../../styles/AdminDashboard.css';
import '../../styles/AntdOverrides.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Get token and verify admin access
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
            navigate('/admin/login');
            return;
        }

        // Check if token is expired
        if (isTokenExpired(token)) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            navigate('/admin/login');
            return;
        }

        // Check if user is admin (case insensitive)
        if (!isAdmin(token)) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            navigate('/admin/login');
            return;
        }

        // Get user info from token
        const userInfo = getUserFromToken(token);
        setUser(userInfo);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
    };

    const menuItems = [
        {
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/admin/products',
            icon: <ShoppingOutlined />,
            label: 'Products',
        },
        {
            key: '/admin/categories',
            icon: <UnorderedListOutlined />,
            label: 'Categories',
        },
        {
            key: '/admin/orders',
            icon: <ShoppingCartOutlined />,
            label: 'Orders',
        },
        {
            key: '/admin/users',
            icon: <TeamOutlined />,
            label: 'User Management',
        },
        {
            key: '/admin/reviews',
            icon: <StarOutlined />,
            label: 'Reviews',
        },
        {
            key: '/admin/feedback',
            icon: <MessageOutlined />,
            label: 'Feedback',
        },
    ];

    const userMenuItems = [
        {
            key: 'profile',
            label: 'Profile',
            icon: <UserOutlined />,
        },
        {
            key: 'settings',
            label: 'Settings',
            icon: <SettingOutlined />,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogoutOutlined />,
            onClick: handleLogout,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sider 
                trigger={null} 
                collapsible 
                collapsed={sidebarCollapsed}
                style={{
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                    background: '#001529'
                }}
                width={250}
            >
                {/* Logo */}
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    padding: sidebarCollapsed ? '0' : '0 24px',
                    background: 'rgba(255,255,255,0.1)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <BookOutlined style={{ fontSize: 24, color: '#0EADD5' }} />
                    {!sidebarCollapsed && (
                        <Text strong style={{ color: 'white', marginLeft: 12, fontSize: 16 }}>
                            BookStore Admin
                        </Text>
                    )}
                </div>

                {/* Menu */}
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{
                        borderRight: 0,
                        background: 'transparent'
                    }}
                />

                {/* User Info - At bottom */}
                {user && (
                    <div style={{
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        right: 16,
                        padding: 12,
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <Avatar icon={<UserOutlined />} />
                        {!sidebarCollapsed && (
                            <div style={{ flex: 1 }}>
                                <Text style={{ color: 'white', display: 'block', fontSize: 12 }}>
                                    {user.fullName}
                                </Text>
                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                                    {user.userType}
                                </Text>
                            </div>
                        )}
                    </div>
                )}
            </Sider>

            <Layout>
                {/* Header */}
                <Header style={{
                    padding: '0 24px',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 1
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Button
                            type="text"
                            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            style={{
                                fontSize: '16px',
                                width: 40,
                                height: 40,
                                border: '1px solid #d9d9d9'
                            }}
                        />
                        <Text style={{ fontSize: 18, fontWeight: 500, color: '#1f2937' }}>
                            Dashboard
                        </Text>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Badge count={3} size="small">
                            <Button
                                type="text"
                                icon={<BellOutlined />}
                                style={{
                                    width: 40,
                                    height: 40,
                                    border: '1px solid #d9d9d9'
                                }}
                            />
                        </Badge>

                        <Button
                            type="text"
                            icon={<SettingOutlined />}
                            style={{
                                width: 40,
                                height: 40,
                                border: '1px solid #d9d9d9'
                            }}
                        />

                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <Button
                                type="text"
                                style={{
                                    height: 40,
                                    padding: '0 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    border: '1px solid #d9d9d9'
                                }}
                            >
                                <Avatar size="small" icon={<UserOutlined />} />
                                {user && (
                                    <Text style={{ fontSize: 14 }}>
                                        {user.fullName}
                                    </Text>
                                )}
                            </Button>
                        </Dropdown>
                    </div>
                </Header>

                {/* Main Content */}
                <Content style={{
                    margin: '24px',
                    padding: '24px',
                    background: 'white',
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    overflow: 'auto',
                    minHeight: 'calc(100vh - 112px)'
                }}>
                    {location.pathname === '/admin/dashboard' ? <DashboardHome /> : <Outlet />}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminDashboard;
