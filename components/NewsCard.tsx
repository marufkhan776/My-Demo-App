import React from 'react';
import { Article } from '../types';

interface NewsCardProps {
    article: Article;
    onSelectArticle: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onSelectArticle }) => {
    return (
        <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-red-500/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            onClick={onSelectArticle}
        >
            <div className="w-full h-48">
                <img src={article.imageUrl} alt={article.headline} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
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
