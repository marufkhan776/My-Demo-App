import React, { useState, useEffect } from 'react';
import { Article, CommunityUser, Group } from '../../types';
import { communityService } from '../../services/communityService';

interface ShareToFeedModalProps {
    article: Article;
    currentUser: CommunityUser;
    onClose: () => void;
    onPostCreated: () => void;
}

export const ShareToFeedModal: React.FC<ShareToFeedModalProps> = ({ article, currentUser, onClose, onPostCreated }) => {
    const [userGroups, setUserGroups] = useState<Group[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [opinion, setOpinion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const groups = communityService.getGroupsForUser(currentUser.id);
        setUserGroups(groups);
        if (groups.length > 0) {
            setSelectedGroupId(groups[0].id);
        }
    }, [currentUser.id]);

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!selectedGroupId) {
            setError('পোস্ট করার জন্য একটি গ্রুপ নির্বাচন করুন।');
            return;
        }
        setIsLoading(true);

        const postOptions = {
            imageUrl: article.imageUrl,
            sharedArticleId: article.id,
        };

        communityService.createPost(selectedGroupId, currentUser.id, opinion.trim(), postOptions);
        
        setIsLoading(false);
        onPostCreated();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={handleBackdropClick}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg animate-fade-in-up flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">ফিডে শেয়ার করুন</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-200 transition text-3xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                    <div className="p-6 overflow-y-auto">
                        <div className="flex items-start space-x-3 mb-4">
                            <img src={currentUser.profilePicture} alt={currentUser.username} className="w-10 h-10 rounded-full object-cover"/>
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-100">{currentUser.username}</p>
                                <select
                                    value={selectedGroupId}
                                    onChange={(e) => setSelectedGroupId(e.target.value)}
                                    className="text-sm p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                                >
                                    {userGroups.length > 0 ? (
                                        userGroups.map(group => (
                                            <option key={group.id} value={group.id}>{group.name}</option>
                                        ))
                                    ) : (
                                        <option value="" disabled>আপনার কোনো গ্রুপ নেই</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        <textarea
                            value={opinion}
                            onChange={(e) => setOpinion(e.target.value)}
                            placeholder="এই খবরটি সম্পর্কে আপনার মতামত কী?"
                            className="w-full p-2 text-base border-none bg-transparent focus:outline-none focus:ring-0 resize-none"
                            rows={4}
                            autoFocus
                        />

                        <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex gap-3 bg-gray-50 dark:bg-gray-900/40">
                            <img src={article.imageUrl} alt={article.headline} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-gray-100 line-clamp-2">{article.headline}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">{article.summary}</p>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <button type="submit" disabled={isLoading || userGroups.length === 0} className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition duration-300 disabled:bg-red-400 disabled:cursor-not-allowed">
                            {isLoading ? 'পোস্ট হচ্ছে...' : 'পোস্ট করুন'}
                        </button>
                    </div>
                </form>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};