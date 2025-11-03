import React, { useState, useEffect } from 'react';
import { Article, CommunityUser } from '../../types';
import { communityService } from '../../services/communityService';
import { contentService } from '../../services/contentService';
import { NewsCard } from '../NewsCard';

interface ReadLaterViewProps {
    currentUser: CommunityUser | null;
    onLoginClick: () => void;
    onSelectArticle: (article: Article) => void;
    onToggleBookmark: (articleId: string) => void;
}

export const ReadLaterView: React.FC<ReadLaterViewProps> = ({ currentUser, onLoginClick, onSelectArticle, onToggleBookmark }) => {
    const [bookmarkedArticles, setBookmarkedArticles] = useState<Article[]>([]);

    useEffect(() => {
        if (currentUser) {
            const allArticles = contentService.getArticles();
            const bookmarkedIds = currentUser.bookmarkedArticleIds || [];
            const userBookmarks = allArticles.filter(article => bookmarkedIds.includes(article.id));
             // Sort to show newest first
            userBookmarks.sort((a, b) => (currentUser.bookmarkedArticleIds?.indexOf(b.id) ?? 0) - (currentUser.bookmarkedArticleIds?.indexOf(a.id) ?? 0));
            setBookmarkedArticles(userBookmarks);
        }
    }, [currentUser]);

    if (!currentUser) {
        return (
            <main className="flex-grow container mx-auto px-4 py-8 text-center">
                 <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold mb-4">আপনার পড়া তালিকা</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">আপনার সংরক্ষিত খবরগুলো দেখতে অনুগ্রহ করে লগইন করুন।</p>
                    <button onClick={onLoginClick} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300">
                        লগইন / রেজিস্টার
                    </button>
                </div>
            </main>
        );
    }
    
    return (
        <main className="flex-grow container mx-auto px-4 py-8">
             <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">আপনার পড়া তালিকা</h1>
            </div>
            {bookmarkedArticles.length > 0 ? (
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {bookmarkedArticles.map((article) => (
                        <NewsCard 
                            key={article.id} 
                            article={article} 
                            onSelectArticle={() => onSelectArticle(article)} 
                            onToggleBookmark={onToggleBookmark}
                            currentUser={currentUser}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <h2 className="text-2xl font-semibold">আপনার তালিকাটি খালি।</h2>
                    <p className="mt-2">কোনো খবরের কার্ডে বুকমার্ক আইকনে ক্লিক করে সেটি এখানে যোগ করুন।</p>
                </div>
            )}
        </main>
    );
};