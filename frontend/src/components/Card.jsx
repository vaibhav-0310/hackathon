// src/components/Card.jsx
import React from 'react';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
// Make sure you have the correct icon import for ExternalLinkIcon (it's ArrowTopRightOnSquareIcon in v2)
import { StarIcon as StarOutline, ArrowTopRightOnSquareIcon,ArrowUpIcon } from '@heroicons/react/24/outline';

// ... (formatDate and getPlatformStyle helpers remain the same) ...
const formatDate = (dateString) => {
    if (!dateString) return 'Date N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
};

const getPlatformStyle = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'github':
        return { icon: ' G ', color: 'bg-gray-700 dark:bg-gray-600', textColor: 'text-white' };
      case 'arxiv':
        return { icon: 'Ar', color: 'bg-red-600 dark:bg-red-700', textColor: 'text-white' };
      case 'hugging face':
        return { icon: '🤗', color: 'bg-yellow-400 dark:bg-yellow-500', textColor: 'text-gray-800' };
      default:
        return { icon: ' ? ', color: 'bg-gray-400 dark:bg-gray-500', textColor: 'text-white' };
    }
};



function Card({ item, isFavorite, onToggleFavorite, hasUpvoted, onUpvoteToggle }) { // Added hasUpvoted, onUpvoteToggle props
    const { id, platform, title, createdAt, summary, tags, link, upvotes = 0 } = item; // Destructure upvotes, default to 0
    const platformStyle = getPlatformStyle(platform);

    const handleUpvoteClick = (e) => {
        e.preventDefault(); // Prevent potential link navigation if button is inside <a> somehow
        e.stopPropagation(); // Prevent card click events if needed
        onUpvoteToggle(id);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col transition-shadow hover:shadow-lg">
            {/* Header */}
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700"> {/* Use items-center */}
                {/* Platform Info */}
                <div className="flex items-center flex-grow min-w-0 mr-2"> {/* Allow platform info to shrink */}
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full ${platformStyle.color} ${platformStyle.textColor} text-sm font-bold mr-3 flex-shrink-0`}>
                        {platformStyle.icon}
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate" title={platform}>
                        {platform}
                    </span>
                </div>

                {/* Action Buttons (Upvote & Favorite) */}
                <div className="flex items-center flex-shrink-0 space-x-2">
                     {/* Upvote Button */}
                     <button
                        onClick={handleUpvoteClick}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs transition-colors ${
                            hasUpvoted
                                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        title={hasUpvoted ? "Remove Upvote" : "Upvote"}
                    >
                        <ArrowUpIcon className={`h-4 w-4 ${hasUpvoted ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                        <span>{upvotes}</span>
                    </button>

                    {/* Favorite Button */}
                    <button
                        onClick={() => onToggleFavorite(id)}
                        className={`p-1 rounded-full transition-colors ${
                            isFavorite
                                ? 'text-yellow-500 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900'
                                : 'text-gray-400 dark:text-gray-500 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                        {isFavorite ? <StarSolid className="h-5 w-5" /> : <StarOutline className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-4 flex-grow">
                {/* ... (Title, date, summary) ... */}
                 <h3 className="text-lg font-semibold mb-1 dark:text-white hover:text-purple-600 dark:hover:text-purple-400">
                     <a href={link} target="_blank" rel="noopener noreferrer">{title}</a>
                 </h3>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                   {formatDate(createdAt)}
                 </p>
                 <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed line-clamp-4">
                   {summary}
                 </p>
            </div>

            {/* Tags */}
            {/* ... (Tags mapping) ... */}
             {tags && tags.length > 0 && (
                 <div className="px-4 pb-2">
                     <div className="flex flex-wrap gap-2">
                         {tags.map((tag, index) => (
                             <span
                                 key={index}
                                 className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
                             >
                                 {tag}
                             </span>
                         ))}
                     </div>
                 </div>
             )}

            {/* Footer with Centered Button Link */}
            {/* ... (View Original button) ... */}
              <div className="px-4 pt-4 pb-5 border-t border-gray-100 dark:border-gray-700 mt-auto text-center">
                  <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 dark:bg-purple-700 transition duration-200 ease-in-out transform hover:bg-purple-700 dark:hover:bg-purple-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 active:scale-95"
                  >
                      View Original
                      <ArrowTopRightOnSquareIcon className="ml-2 h-4 w-4" />
                  </a>
              </div>
        </div>
    );
}

export default Card;