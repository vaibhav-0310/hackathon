// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // Important: Show loading state while the initial auth check is running
        // This prevents briefly showing the login page before the user state is confirmed
        return <div className="min-h-screen flex items-center justify-center text-xl bg-gray-100 dark:bg-gray-900">Authenticating...</div>;
    }

    if (!user) {
        // If loading is finished and there's no user, redirect to login
        // Pass the current location so the user can be redirected back after login
        console.log(`ProtectedRoute: No user (loading: ${loading}), redirecting to /login from ${location.pathname}`);
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If loading is finished and user exists, render the requested component/route
    // Outlet is used for nested routes (<Route><ProtectedRoute><Outlet/></ProtectedRoute></Route>)
    // children prop is used for element style (<Route element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />)
    return children ? children : <Outlet />;
}

export default ProtectedRoute;