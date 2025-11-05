import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');

    // Check if token exists
    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    // Check if user info exists and user is admin
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.userType !== 'Admin') {
                // Not an admin, redirect to login
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                return <Navigate to="/admin/login" replace />;
            }
        } catch (error) {
            // Invalid user data, redirect to login
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            return <Navigate to="/admin/login" replace />;
        }
    } else {
        return <Navigate to="/admin/login" replace />;
    }

    // User is authenticated and is admin
    return children;
};

export default ProtectedRoute;
