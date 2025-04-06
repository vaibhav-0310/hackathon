// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_BASE_URL = 'http://localhost:8080';
const JWT_STORAGE_KEY = 'authToken'; // Key for storing JWT in localStorage

// --- Axios Instance for Authenticated Requests ---
// Create an instance to easily attach the token later
const axiosAuth = axios.create({ baseURL: API_BASE_URL });

// Interceptor to add JWT to requests made with this instance
axiosAuth.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(JWT_STORAGE_KEY);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // config.withCredentials = true; // Keep if backend *also* uses cookies for CSRF etc.
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem(JWT_STORAGE_KEY)); // Load initial token
    const [loading, setLoading] = useState(true); // Initial auth check loading

    // Effect to update axios interceptor and fetch user when token changes
    useEffect(() => {
        const checkUserWithToken = async (currentToken) => {
            if (currentToken) {
                console.log("AuthContext: Token found, verifying with /api/user/me...");
                try {
                    // Use the axios instance with the interceptor
                    const response = await axiosAuth.get('/api/user/me'); // No need to manually add header here
                    setUser(response.data);
                    console.log("AuthContext: Token valid, user set -", response.data?.displayName);
                } catch (error) {
                    if (error.response && error.response.status === 401) {
                        console.log("AuthContext: Token invalid/expired (401). Clearing token.");
                    } else {
                        console.error("AuthContext: Error verifying token with /api/user/me -", error.message);
                    }
                    // Clear invalid token and user state
                    localStorage.removeItem(JWT_STORAGE_KEY);
                    setToken(null);
                    setUser(null);
                } finally {
                     // Ensure loading is set to false only after the initial check
                     if (loading) setLoading(false);
                }
            } else {
                // No token found
                setUser(null);
                 if (loading) setLoading(false); // Ensure loading stops if no token initially
                 console.log("AuthContext: No token found.");
            }
        };

        checkUserWithToken(token); // Check status when token state changes or on initial load

    }, [token, loading]); // Rerun when token changes or initial loading state finishes

    // --- Authentication Functions ---

    const handleAuthSuccess = (data) => {
        // Expect data like { token, user } from backend
        if (data.token && data.user) {
            localStorage.setItem(JWT_STORAGE_KEY, data.token);
            setToken(data.token); // Update token state (triggers useEffect to set user)
            // setUser(data.user); // Optionally set user immediately, but useEffect handles it too
            console.log("AuthContext: Auth success, token stored.");
            return true;
        } else {
             console.error("AuthContext: Auth success response missing token or user data.");
             return false;
        }
    };

    const loginWithPassword = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login/password`, { email, password });
            return handleAuthSuccess(response.data);
        } catch (error) {
            console.error("AuthContext: Password login failed -", error.response?.data?.message || error.message);
            // Rethrow or return specific error message
            throw error; // Let the component handle UI feedback
        }
    };

    const signupWithPassword = async (displayName, email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/signup/password`, { displayName, email, password });
             return handleAuthSuccess(response.data);
        } catch (error) {
             console.error("AuthContext: Password signup failed -", error.response?.data?.message || error.message);
             throw error; // Let the component handle UI feedback
        }
    };

    // OAuth Login (remains the same - redirects)
    const loginWithProvider = (provider) => {
        console.log(`AuthContext: Redirecting for ${provider} login...`);
        window.location.href = `${API_BASE_URL}/auth/${provider}`;
    };

    const logout = useCallback(async () => {
        console.log("AuthContext: Logging out...");
        const currentToken = localStorage.getItem(JWT_STORAGE_KEY); // Get token before clearing
        localStorage.removeItem(JWT_STORAGE_KEY);
        setToken(null);
        setUser(null);
        // Optionally call backend logout endpoint if it invalidates tokens/sessions
        try {
            // Use axiosAuth which will NOT have the token after it's cleared above
            await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
                 headers: currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {} // Send last token if available
                 // withCredentials: true // If backend logout needs cookies too
            });
            console.log("AuthContext: Backend logout notified.");
        } catch (error) {
             console.error("AuthContext: Backend logout notification failed (might be okay) -", error.message);
        }
    }, []);

    const value = {
        user,
        token, // Expose token if needed (generally avoid using directly in components)
        loading,
        loginWithPassword,
        signupWithPassword,
        loginWithProvider, // Keep OAuth login separate
        logout,
        axiosAuth, // Expose the configured axios instance for authenticated API calls
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};