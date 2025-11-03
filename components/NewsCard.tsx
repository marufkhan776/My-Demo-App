import React from 'react';
import { Article, CommunityUser } from '../types';

interface NewsCardProps {
    article: Article;
    onSelectArticle: () => void;
    onToggleBookmark: (articleId: string) => void;
    currentUser: CommunityUser | null;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onSelectArticle, onToggleBookmark, currentUser }) => {
    const isBookmarked = currentUser?.bookmarkedArticleIds?.includes(article.id) ?? false;
    
    const handleBookmarkClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent onSelectArticle from firing
        onToggleBookmark(article.id);
    };

    return (
        <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700 hover:border-red-500/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
        >
            <div className="w-full h-48 relative">
                <img src={article.imageUrl} alt={article.headline} className="w-full h-full object-cover" onClick={onSelectArticle} />
                {currentUser && (
                    <button 
                        onClick={handleBookmarkClick} 
                        aria-label={isBookmarked ? "Remove from Read Later" : "Add to Read Later"}
                        className="absolute top-2 right-2 p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                        {isBookmarked ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.125L5 18V4z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
            <div className="p-6 flex flex-col flex-grow cursor-pointer" onClick={onSelectArticle}>
                <div className="flex-grow">
                    <span className="text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 px-2 py-1 rounded-full">{article.category}</span>
                    <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300">{article.headline}</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">{article.summary}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    <span>{article.publishedDate}</span>
                </div>
            </div>
        </div>
    );
};