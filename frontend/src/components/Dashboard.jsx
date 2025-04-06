// src/components/Dashboard_API.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Card from './Card';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext'; // Can use this to get user info if needed inside dashboard

const API_BASE_URL = 'http://localhost:8080';

// Local storage helpers (assuming they exist as defined before)
const FAVORITES_STORAGE_KEY = 'favorites';
const UPVOTED_STORAGE_KEY = 'aiDigestUpvotedItems';
// ... load/save functions for favorites and upvotes ...
const loadFromLocalStorage = (key, defaultValue = []) => { /* ... */ };
const saveToLocalStorage = (key, value) => { /* ... */ };
const loadUpvotedItems = () => new Set(loadFromLocalStorage(UPVOTED_STORAGE_KEY));
const saveUpvotedItems = (itemsSet) => saveToLocalStorage(UPVOTED_STORAGE_KEY, Array.from(itemsSet));
const loadFavorites = () => loadFromLocalStorage(FAVORITES_STORAGE_KEY);
const saveFavorites = (items) => saveToLocalStorage(FAVORITES_STORAGE_KEY, items);


function DashboardAPI({ theme, toggleTheme }) { // Props from App.jsx
    const { user } = useAuth(); // Get user info if needed for display or logic
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSource, setSelectedSource] = useState('All Sources');
    const [favorites, setFavorites] = useState(loadFavorites);
    const [showFavorites, setShowFavorites] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [sortBy, setSortBy] = useState('createdAt');
    const [userUpvotedItems, setUserUpvotedItems] = useState(loadUpvotedItems);

    const sources = ['All Sources', 'GitHub', 'ArXiv', 'Hugging Face'];

    // Fetch main digest data (publicly accessible - doesn't need auth check here)
    const fetchData = useCallback(async () => {
        console.log("Dashboard: Fetching summary data...");
        setLoading(true);
        setError(null);
        try {
            // Assuming /summary is public or backend handles guest view
            const response = await axios.get(`${API_BASE_URL}/summary`);
            const initialData = response.data.map(item => ({
                ...item,
                upvotes: item.upvotes === undefined ? 0 : item.upvotes,
                tags: item.tags || [],
            }));
            setData(initialData);
            console.log("Dashboard: Summary data loaded.");
        } catch (err) {
            console.error("Dashboard: Error fetching summary data:", err);
            setError("Failed to load digest data. Please try refreshing.");
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []); // useCallback dependency

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filtering & Sorting Logic (remains the same)
    useEffect(() => {
        let result = [...data];
        if (selectedSource !== 'All Sources') { result = result.filter(item => item.platform === selectedSource); }
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(lowerCaseSearch) ||
                item.summary.toLowerCase().includes(lowerCaseSearch) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearch)))
            );
        }
        if (showFavorites) { result = result.filter(item => favorites.includes(item.id)); }
        let sortedResult = [...result];
        if (sortBy === 'upvotes') { sortedResult.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)); }
        else { sortedResult.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); }
        setFilteredData(sortedResult);
    }, [data, searchTerm, selectedSource, showFavorites, favorites, sortBy]);

    // Favorite Handling (syncing with local storage)
    useEffect(() => {
        saveFavorites(favorites);
    }, [favorites]);

    const handleToggleFavorite = (itemId) => {
        // No need for !user check here - ProtectedRoute handles access
        setFavorites(prevFavs => {
            const newFavs = prevFavs.includes(itemId)
                ? prevFavs.filter(id => id !== itemId)
                : [...prevFavs, itemId];
            // Here you might add a debounced backend call to sync favorites
            // await axios.post(`${API_BASE_URL}/api/user/favorites`, { itemId, action: isAdding }, { withCredentials: true });
            return newFavs;
        });
    };

    // Upvote Handling (with API call)
    const handleUpvoteToggle = useCallback(async (itemId) => {
        // No need for !user check here

        const isCurrentlyUpvoted = userUpvotedItems.has(itemId);
        const optimisticChange = isCurrentlyUpvoted ? -1 : 1;
        const action = isCurrentlyUpvoted ? 'downvote' : 'upvote';

        // 1. Optimistic UI Update
        setUserUpvotedItems(prev => {
            const newSet = new Set(prev);
            if (isCurrentlyUpvoted) newSet.delete(itemId); else newSet.add(itemId);
            saveUpvotedItems(newSet); // Persist intermediate state locally
            return newSet;
        });
        setData(prevData => prevData.map(item =>
            item.id === itemId ? { ...item, upvotes: (item.upvotes || 0) + optimisticChange } : item
        ));

        // 2. Backend Call
        try {
            console.log(`Dashboard: Attempting ${action} for item ${itemId} via API...`);
            // Adjust endpoint as needed, e.g., /api/summary/:id/vote
            await axios.post(`${API_BASE_URL}/api/summary/${itemId}/vote`, { action }, {
                withCredentials: true // Send session cookie
            });
            console.log(`Dashboard: Backend ${action} successful for ${itemId}`);
            // Backend is source of truth, maybe refetch data or trust optimistic update
            // fetchData(); // Option to refetch all data after vote
        } catch (err) {
            console.error(`Dashboard: Backend ${action} failed:`, err);
            if (err.response && err.response.status === 401) {
                setError("Session expired. Please log in again to vote.");
                // Maybe trigger logout or redirect here
            } else {
                setError(`Failed to ${action}. Network or server error.`);
            }
            setTimeout(() => setError(null), 4000);

            // 3. Revert optimistic updates on failure
            setUserUpvotedItems(prev => {
                const newSet = new Set(prev);
                if (isCurrentlyUpvoted) newSet.add(itemId); else newSet.delete(itemId);
                saveUpvotedItems(newSet);
                return newSet;
            });
            setData(prevData => prevData.map(item =>
                item.id === itemId ? { ...item, upvotes: (item.upvotes || 0) - optimisticChange } : item
            ));
        }
    }, [userUpvotedItems]); // useCallback dependencies

    // --- Other Handlers ---
    const handleSearchChange = (event) => setSearchTerm(event.target.value);
    const handleSourceChange = (source) => { setSelectedSource(source); setShowFavorites(false); };
    const handleShowFavorites = () => { setShowFavorites(true); setSelectedSource('All Sources'); };
    const handleShowAll = () => { setShowFavorites(false); };
    const handleSortChange = (newSortBy) => setSortBy(newSortBy);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // --- JSX Rendering ---
    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900"> {/* Added background */}
            {/* Navbar receives theme props and uses useAuth internally */}
            <Navbar
                theme={theme}
                toggleTheme={toggleTheme}
                toggleSidebar={toggleSidebar}
            />

            <div className="flex flex-1 pt-16"> {/* pt-16 assumes navbar height, adjust if needed */}
                <Sidebar
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    selectedSource={selectedSource}
                    onSourceChange={handleSourceChange}
                    onShowFavorites={handleShowFavorites}
                    isShowingFavorites={showFavorites}
                    onShowAll={handleShowAll}
                    sources={sources}
                    sortBy={sortBy}
                    onSortChange={handleSortChange}
                />

                {/* Main Content Area */}
                <main className={`flex-grow p-4 md:p-6 lg:p-8 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
                    {/* General Error Display */}
                    {error && !loading && (
                        <div className="mb-4 text-center text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 p-3 rounded-md shadow">{error}</div>
                    )}

                    {loading && (
                        <div className="text-center py-20 text-xl text-gray-600 dark:text-gray-400">Loading Digest...</div>
                    )}

                    {!loading && (
                        <>
                            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                                {showFavorites ? 'Your Favorites' : `${selectedSource} Digest`}
                                {sortBy === 'upvotes' && !showFavorites && ' (Sorted by Upvotes)'}
                            </h1>
                            {filteredData.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6"> {/* Adjusted grid */}
                                    {filteredData.map((item) => (
                                        <Card
                                            key={item.id || `item-${index}`} // Use item.id, fallback if needed
                                            item={item}
                                            isFavorite={favorites.includes(item.id)}
                                            onToggleFavorite={handleToggleFavorite}
                                            hasUpvoted={userUpvotedItems.has(item.id)}
                                            onUpvoteToggle={handleUpvoteToggle} // Pass the memoized handler
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                                    {showFavorites ? "You haven't favorited any items yet." : "No items match your current filters."}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Footer - margin adjusts with sidebar */}
            <footer className={`text-center p-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
                AI Digest Generator - Hackathon Project
            </footer>
        </div>
    );
}

export default DashboardAPI;


//api call version::
// src/components/Dashboard_API.jsx (Rename file if needed)
// import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // Import axios for API calls
// import Navbar from './Navbar';
// import Card from './Card';
// import Sidebar from './Sidebar';
// // No dummy data import needed

// const API_BASE_URL = 'http://localhost:8080'; // Your backend URL

// // --- Local Storage Helpers (same as above) ---
// const UPVOTED_STORAGE_KEY = 'aiDigestUpvotedItems';
// const FAVORITES_STORAGE_KEY = 'favorites';

// const loadFromLocalStorage = (key, defaultValue = []) => { /* ... */ };
// const saveToLocalStorage = (key, value) => { /* ... */ };
// const loadUpvotedItems = () => new Set(loadFromLocalStorage(UPVOTED_STORAGE_KEY));
// const saveUpvotedItems = (itemsSet) => saveToLocalStorage(UPVOTED_STORAGE_KEY, Array.from(itemsSet));
// const loadFavorites = () => loadFromLocalStorage(FAVORITES_STORAGE_KEY);
// const saveFavorites = (items) => saveToLocalStorage(FAVORITES_STORAGE_KEY, items);


// function DashboardAPI({ theme, toggleTheme, user, onLogin, onLogout }) {
//     // --- State (same as above) ---
//     const [data, setData] = useState([]);
//     const [filteredData, setFilteredData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedSource, setSelectedSource] = useState('All Sources');
//     const [favorites, setFavorites] = useState(loadFavorites);
//     const [showFavorites, setShowFavorites] = useState(false);
//     const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//     const [sortBy, setSortBy] = useState('createdAt');
//     const [userUpvotedItems, setUserUpvotedItems] = useState(loadUpvotedItems);

//     const sources = ['All Sources', 'GitHub', 'ArXiv', 'Hugging Face'];

//     // --- Data Loading (API) ---
//     useEffect(() => {
//         const fetchData = async () => {
//             console.log("Fetching data from API...");
//             setLoading(true);
//             setError(null);
//             try {
//                 const response = await axios.get(`${API_BASE_URL}/summary`);
//                  // Ensure data has upvotes, default to 0 if missing from API
//                 const initialData = response.data.map(item => ({
//                     ...item,
//                     upvotes: item.upvotes === undefined ? 0 : item.upvotes,
//                     tags: item.tags || [],
//                 }));
//                 setData(initialData);
//                 console.log("API data loaded:", initialData);
//             } catch (err) {
//                 console.error("Error fetching data from API:", err);
//                 setError("Failed to fetch data. Is the backend running?");
//                 setData([]); // Clear data on error
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, []); // Run only once on mount

//     // --- Filtering & Sorting Logic (same as above) ---
//     useEffect(() => {
//        // ... (Identical filtering and sorting logic as Version 1) ...
//         let result = [...data];
//         if (selectedSource !== 'All Sources') { /* ... */ }
//         if (searchTerm) { /* ... */ }
//         if (showFavorites) { /* ... */ }
//         let sortedResult = [...result];
//         if (sortBy === 'upvotes') { /* ... */ }
//         else { /* ... */ }
//         setFilteredData(sortedResult);
//     }, [data, searchTerm, selectedSource, showFavorites, favorites, sortBy]);

//     // --- Favorite Handling (same as above) ---
//     useEffect(() => {
//         saveFavorites(favorites);
//     }, [favorites]);

//     const handleToggleFavorite = (itemId) => { /* ... (Same logic) ... */ };


//     // --- Upvote Handling (with actual API call simulation/placeholder) ---
//     const handleUpvoteToggle = async (itemId) => {
//         const isCurrentlyUpvoted = userUpvotedItems.has(itemId);
//         const optimisticChange = isCurrentlyUpvoted ? -1 : 1;
//         const action = isCurrentlyUpvoted ? 'downvote' : 'upvote'; // Determine action for backend

//         // 1. Optimistic UI Update (same as above)
//         setUserUpvotedItems(prev => { /* ... */ });
//         setData(prevData => prevData.map(item => /* ... */));

//         // 2. Actual Backend Call (or simulation)
//         try {
//             console.log(`Attempting ${action} for item ${itemId} via API...`);

//             // *** UNCOMMENT AND ADAPT WHEN BACKEND IS READY ***
//             // const response = await axios.post(`${API_BASE_URL}/summary/${itemId}/vote`, { action });
//             // console.log('Backend vote successful:', response.data);
//             // If backend returns updated count, you might want to update state again here,
//             // though the optimistic update often suffices if backend logic is simple increment/decrement.

//             // *** SIMULATION (REMOVE WHEN USING REAL API) ***
//             await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
//             console.log(`Simulated backend ${action} success for ${itemId}`);
//             // *** END SIMULATION ***

//         } catch (err) {
//             console.error(`Backend ${action} failed:`, err);
//             setError(`Failed to ${action}. Please try again.`);
//             setTimeout(() => setError(null), 3000);

//             // 3. Revert optimistic updates on failure (same as above)
//             setUserUpvotedItems(prev => { /* ... */ });
//             setData(prevData => prevData.map(item => /* ... */));
//         }
//     };


//     // --- Other Handlers (same as above) ---
//     const handleSearchChange = (event) => setSearchTerm(event.target.value);
//     const handleSourceChange = (source) => { /* ... */ };
//     const handleShowFavorites = () => { /* ... */ };
//     const handleShowAll = () => { /* ... */ };
//     const handleSortChange = (newSortBy) => setSortBy(newSortBy);
//     const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

//     // --- JSX Rendering (Identical to Version 1) ---
//     return (
//         <div className="flex flex-col min-h-screen">
//             <Navbar /* ...props... */ toggleSidebar={toggleSidebar}/>
//             <div className="flex flex-1 pt-16"> {/* Added pt-16 */}
//                 <Sidebar /* ...props... */
//                     isOpen={isSidebarOpen}
//                     toggleSidebar={toggleSidebar}
//                     searchTerm={searchTerm}
//                     onSearchChange={handleSearchChange}
//                     selectedSource={selectedSource}
//                     onSourceChange={handleSourceChange}
//                     onShowFavorites={handleShowFavorites}
//                     isShowingFavorites={showFavorites}
//                     onShowAll={handleShowAll}
//                     sources={sources}
//                     sortBy={sortBy}
//                     onSortChange={handleSortChange}
//                 />
//                 <main className={`/* ... */ ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
//                      {error && !loading && ( /* Error display */ )}
//                      {loading && ( /* Loading display */ )}
//                      {!loading && (
//                         <>
//                             <h1 /* ...title... */></h1>
//                             {filteredData.length > 0 ? (
//                                 <div className="grid ...">
//                                     {filteredData.map((item) => (
//                                         <Card
//                                             key={item.id}
//                                             item={item}
//                                             isFavorite={favorites.includes(item.id)}
//                                             onToggleFavorite={handleToggleFavorite}
//                                             hasUpvoted={userUpvotedItems.has(item.id)}
//                                             onUpvoteToggle={handleUpvoteToggle}
//                                         />
//                                     ))}
//                                 </div>
//                             ) : ( /* No items message */ )}
//                         </>
//                      )}
//                  </main>
//             </div>
//             <footer className={`/* ... */ ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
//                 {/* ... footer content ... */}
//             </footer>
//         </div>
//     );
// }

// export default DashboardAPI; // Export with a specific name