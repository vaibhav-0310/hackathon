// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Use hook to get state/functions
import { SunIcon, MoonIcon, UserCircleIcon, ArrowRightOnRectangleIcon as LogoutIcon, Bars3Icon as MenuIcon } from '@heroicons/react/24/outline';

function Navbar({ theme, toggleTheme, toggleSidebar }) {
    const { user, logout } = useAuth(); // Get user object and logout function
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout(); // Call context logout
            console.log("Navbar: Logout complete, navigating to login.");
            navigate('/login'); // Redirect to login page after logout completes
        } catch (error) {
            console.error("Navbar: Error during logout:", error)
            // Handle potential errors during logout if needed
        }
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 px-4 md:px-8 py-3">
            <div className="container mx-auto flex items-center justify-between">
                {/* Left Side */}
                <div className="flex items-center space-x-4">
                    {/* Hamburger Menu Button (only if sidebar exists) */}
                    {toggleSidebar && (
                         <button onClick={toggleSidebar} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500" aria-label="Toggle sidebar">
                             <MenuIcon className="h-6 w-6" />
                         </button>
                     )}
                    {/* Logo/Title */}
                    <Link to="/dashboard" className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
                        AI Digest
                    </Link>
                </div>

                {/* Center Links */}
                <div className="hidden md:flex items-center space-x-4">
                     <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Dashboard</Link>
                     {/* Add other nav links as needed */}
                     {/* <Link to="/saved" className="...">Saved Items</Link> */}
                     {/* <Link to="/about" className="...">About</Link> */}
                 </div>

                {/* Right Side */}
                <div className="flex items-center space-x-3 md:space-x-4">
                    {/* Theme Toggle */}
                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                        {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                    </button>

                    {/* Subscribe Button (Placeholder) */}
                    {/* Consider hiding or changing if user not logged in */}
                    {user && (
                        <button className="hidden md:inline-block bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-1.5 px-3 rounded-md transition-colors">
                             Subscribe
                        </button>
                     )}

                    {/* Auth Buttons */}
                    {user ? (
                        // ---- Logged In ----
                        <div className="flex items-center space-x-2">
                            <button className="flex items-center space-x-2 p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" title={user.displayName || 'User Profile'}>
                                {user.avatarUrl ? ( <img src={user.avatarUrl} alt="Avatar" className="h-7 w-7 rounded-full object-cover border-2 border-transparent group-hover:border-gray-300" /> ) : ( <UserCircleIcon className="h-7 w-7" /> )}
                            </button>
                            <button onClick={handleLogout} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400" title="Logout">
                                <LogoutIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        // ---- Logged Out ----
                        <div className="flex items-center space-x-2">
                             <Link to="/login" className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"> Log In </Link>
                             <Link to="/signup" className="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"> Sign Up </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;