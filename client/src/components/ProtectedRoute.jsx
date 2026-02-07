import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUser, isAuthenticated } from '../utils/auth';
import { hasRole } from '../utils/rbac';

const ProtectedRoute = ({ children, requiredRole }) => {
    const user = getUser();
    const location = useLocation();
    const isAuth = isAuthenticated();

    if (!isAuth) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && !hasRole(user, requiredRole)) {
        // If user doesn't have required role, redirect to dashboard or appropriate page
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
