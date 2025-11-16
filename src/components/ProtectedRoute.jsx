import { Navigate } from 'react-router-dom';
import { isAdmin, isTokenExpired } from '../utils/jwtHelper';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('adminToken');

    // Check if token exists
    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        return <Navigate to="/admin/login" replace />;
    }

    // Check if user is admin (case insensitive check)
    if (!isAdmin(token)) {
        // Not an admin, redirect to login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        return <Navigate to="/admin/login" replace />;
    }

    // User is authenticated and is admin
    return children;
};

export default ProtectedRoute;
