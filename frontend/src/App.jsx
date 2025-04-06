// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, Navigate, Link } from 'react-router-dom'; // Ensure Link is imported for 404
// Use correct Dashboard component name
import DashboardComponent from './components/Dashboard'; // Or DashboardLocal etc.
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    // const { loading: authLoading } = useAuth(); // Get loading state from context

    useEffect(() => {
        const root = window.document.documentElement;
        const oldTheme = theme === 'dark' ? 'light' : 'dark';
        root.classList.remove(oldTheme);
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // No need for global loading screen here if ProtectedRoute handles it

    return (
        // Removed bg-gray-100 dark:bg-gray-900 here - apply background to specific pages or body if needed
        <div className="App min-h-screen font-sans">
            <Routes>
                {/* Public Login Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Public Signup Route */}
                <Route path="/signup" element={<SignupPage />} />

                {/* Protected Dashboard Route */}
                <Route
                    path="/dashboard/:id"
                    element={
    
                            <DashboardComponent
                                theme={theme}
                                toggleTheme={toggleTheme}
                                // No need to pass user/login/logout if Navbar/Dashboard use useAuth hook
                            />  
                    }
                />

                {/* Redirect root path to dashboard (ProtectedRoute will handle redirect to login if needed) */}
                <Route path="/" element={<Navigate replace to="/dashboard" />} />

                {/* Catch-all 404 Not Found Route */}
                <Route path="*" element={
                    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
                        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">404 - Page Not Found</h1>
                        <Link to="/dashboard" className="text-purple-600 hover:underline dark:text-purple-400">
                            Go to Dashboard
                        </Link>
                    </div>
                } />
            </Routes>
        </div>
    );
}

export default App;