import React from 'react';
import { Article, CommunityUser } from '../types';

interface HeroSectionProps {
    article: Article;
    onReadMore: () => void;
    onToggleBookmark: (articleId: string) => void;
    currentUser: CommunityUser | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ article, onReadMore, onToggleBookmark, currentUser }) => {
    const isBookmarked = currentUser?.bookmarkedArticleIds?.includes(article.id) ?? false;
    
    const handleBookmarkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleBookmark(article.id);
    };

    return (
        <div className="grid md:grid-cols-2 gap-8 items-center bg-white dark:bg-gradient-to-br from-gray-800 to-gray-900/90 border border-transparent dark:border-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 relative">
            {currentUser && (
                <button 
                    onClick={handleBookmarkClick} 
                    aria-label={isBookmarked ? "Remove from Read Later" : "Add to Read Later"}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition-colors"
                >
                    {isBookmarked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.125L5 18V4z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    )}
                </button>
            )}
            <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden">
                <img src={article.imageUrl} alt={article.headline} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-center">
                 <span className="bg-red-600 text-white px-3 py-1 text-sm font-semibold rounded-full self-start mb-4">{article.category}</span>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100 leading-tight">{article.headline}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">{article.summary}</p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <span>{article.publishedDate}</span>
                </div>
                <button
                    onClick={onReadMore}
                    className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition duration-300 self-start">
                    বিস্তারিত পড়ুন
                </button>
            </div>
        </div>
    );
};