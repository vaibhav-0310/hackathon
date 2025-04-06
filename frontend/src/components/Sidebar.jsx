// src/components/Sidebar.jsx
import React from 'react';
import { MagnifyingGlassIcon, StarIcon, TagIcon, CalendarIcon, XMarkIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

function Sidebar({
    isOpen,
    toggleSidebar,
    searchTerm,
    onSearchChange,
    selectedSource,
    onSourceChange,
    onShowFavorites,
    isShowingFavorites,
    onShowAll,
    sources,
    sortBy, // Add sortBy state
    onSortChange // Add handler to change sort
}) {

    return (
        <aside
            className={`
                fixed top-0 left-0 z-40 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                w-64 flex flex-col  /* Removed p-4 from here */
            `}
            aria-label="Sidebar"
        >
            {/* Content Wrapper: Add padding-top here */}
            <div className="flex-grow overflow-y-auto p-4 pt-16 space-y-6"> {/* Added pt-16 (adjust if needed) and moved p-4 here */}

                {/* Search */}
                <div>
                    <label htmlFor="sidebar-search" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Search</label>
                    {/* ... rest of search input ... */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="sidebar-search"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                            placeholder="Title, summary, tags..."
                            value={searchTerm}
                            onChange={onSearchChange}
                        />
                    </div>
                </div>
                <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Sort By</h3>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                    >
                        <option value="createdAt">Most Recent</option>
                        <option value="upvotes">Most Upvoted</option>
                    </select>
                    {/* OR a simpler button toggle:
                       <button
                           onClick={() => onSortChange(sortBy === 'upvotes' ? 'createdAt' : 'upvotes')}
                           className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                       >
                           <span>{sortBy === 'upvotes' ? 'Most Upvoted' : 'Most Recent'}</span>
                           <ArrowsUpDownIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                       </button>
                       */}
                </div>

                {/* Sources */}
                <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Sources</h3>
                    <ul className="space-y-1">
                        {/* Add 'All Sources' button logic here if needed */}
                        <li>
                            <button
                                onClick={() => onSourceChange('All Sources')} // Handle 'All Sources' click
                                className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${selectedSource === 'All Sources' && !isShowingFavorites
                                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                All {/* Display 'All' */}
                                {selectedSource === 'All Sources' && !isShowingFavorites && <span className="w-2 h-2 bg-purple-500 rounded-full"></span>}
                            </button>
                        </li>
                        {/* Map over other sources */}
                        {sources.filter(s => s !== 'All Sources').map(source => ( // Filter out 'All Sources' here
                            <li key={source}>
                                <button
                                    onClick={() => onSourceChange(source)}
                                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${selectedSource === source && !isShowingFavorites
                                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {source}
                                    {selectedSource === source && !isShowingFavorites && <span className="w-2 h-2 bg-purple-500 rounded-full"></span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Favorites Button */}
                <div>
                    {/* ... rest of favorites button ... */}
                    <button
                        onClick={isShowingFavorites ? onShowAll : onShowFavorites}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${isShowingFavorites
                            ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <StarIcon className={`w-5 h-5 mr-2 ${isShowingFavorites ? 'text-yellow-500 dark:text-yellow-400' : ''}`} />
                        Favorites
                    </button>
                </div>

                {/* Filters (Placeholders) */}
                <div>
                    {/* ... rest of filters ... */}
                    <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Filters</h3>
                    <ul className="space-y-1">
                        <li>
                            <button className="w-full text-left px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center disabled:opacity-50" disabled>
                                <CalendarIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" />
                                Date Range (soon)
                            </button>
                        </li>
                        <li>
                            <button className="w-full text-left px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center disabled:opacity-50" disabled>
                                <TagIcon className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" />
                                Tags (soon)
                            </button>
                        </li>
                    </ul>
                </div>
            </div> {/* End Content Wrapper */}

            {/* Collapse Button at the bottom */}
            <div className="mt-auto border-t border-gray-200 dark:border-gray-700 p-4"> {/* Moved p-4 here */}
                {/* ... rest of collapse button ... */}
                <button
                    onClick={toggleSidebar}
                    className="w-full flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    <ChevronLeftIcon className={`w-5 h-5 mr-2 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`} />
                    {isOpen ? "Collapse" : ""}
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;