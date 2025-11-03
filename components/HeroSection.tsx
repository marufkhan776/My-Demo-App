import React from 'react';
import { Article } from '../types';

interface HeroSectionProps {
    article: Article;
    onReadMore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ article, onReadMore }) => {
    return (
        <div className="grid md:grid-cols-2 gap-8 items-center bg-white dark:bg-gradient-to-br from-gray-800 to-gray-900/90 border border-transparent dark:border-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
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
