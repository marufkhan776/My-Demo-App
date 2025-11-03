
import React, { useState, useEffect, useCallback } from 'react';
import { communityService } from '../../services/communityService';
import { Group, Post, CommunityUser } from '../../types';
import { PostCard } from './PostCard';
import { LoadingSpinner } from '../LoadingSpinner';
import { CreatePostModal } from './CreatePostModal';

interface FeedViewProps {
    currentUser: CommunityUser | null;
    onLoginClick: () => void;
    onNavigate: (path: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({ currentUser, onLoginClick, onNavigate }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [userGroups, setUserGroups] = useState<Group[]>([]);
    const [friends, setFriends] = useState<CommunityUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

    const refreshFeed = useCallback(() => {
        if (currentUser) {
            setIsLoading(true);
            setPosts(communityService.getFeedForUser(currentUser.id));
            setUserGroups(communityService.getGroupsForUser(currentUser.id));
            setFriends(communityService.getFriendsForUser(currentUser.id));
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            refreshFeed();
        } else {
            setPosts([]);
            setUserGroups([]);
            setFriends([]);
            setIsLoading(false);
        }
    }, [currentUser, refreshFeed]);

    if (isLoading) {
        return <div className="py-10"><LoadingSpinner /></div>;
    }

    if (!currentUser) {
        return (
            <main className="flex-grow container mx-auto px-4 py-8 text-center">
                 <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold mb-4">আপনার ফিড দেখুন</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">আপনার সদস্য থাকা গ্রুপগুলির পোস্ট দেখতে এবং নতুন পোস্ট করতে অনুগ্রহ করে লগইন করুন।</p>
                    <button onClick={onLoginClick} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300">
                        লগইন / রেজিস্টার
                    </button>
                </div>
            </main>
        );
    }
    
    if (userGroups.length === 0) {
         return (
            <main className="flex-grow container mx-auto px-4 py-8 text-center">
                 <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold mb-4">স্বাগতম, {currentUser.username}!</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">আপনার ফিডটি এখনও খালি। পোস্ট দেখতে, অনুগ্রহ করে কিছু গ্রুপে যোগ দিন।</p>
                    <button onClick={() => onNavigate('#/community')} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300 inline-block">
                        গ্রুপগুলো দেখুন
                    </button>
                </div>
            </main>
        );
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900/95">
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-12 gap-8">
                    {/* Left Sidebar */}
                    <aside className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24 space-y-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                                <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-100">আপনার গ্রুপসমূহ</h3>
                                <ul className="space-y-2">
                                    {userGroups.map(group => (
                                        <li key={group.id}>
                                            <button onClick={() => onNavigate(`#/community/group/${group.id}`)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
                                                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center font-bold text-red-600 dark:text-red-300 flex-shrink-0">{group.name.charAt(0)}</div>
                                                <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">{group.name}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>

                    {/* Center Column */}
                    <div className="col-span-12 lg:col-span-6">
                        {/* Create Post Trigger */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <img src={currentUser.profilePicture} alt={currentUser.username} className="w-10 h-10 rounded-full object-cover" />
                                <button 
                                    onClick={() => setIsCreatePostModalOpen(true)}
                                    className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-full h-10 px-4 text-left text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                    আপনার মনে কী চলছে, {currentUser.username}?
                                </button>
                            </div>
                        </div>

                        {/* Posts */}
                        <div className="space-y-6">
                            {posts.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    currentUser={currentUser}
                                    onDataChange={refreshFeed}
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </div>
                         {posts.length === 0 && (
                            <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                <h2 className="text-2xl font-semibold">আপনার ফিডে কোনো পোস্ট নেই।</h2>
                                <p className="mt-2">উপরে একটি পোস্ট তৈরি করে আলোচনা শুরু করুন!</p>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                     <aside className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24 space-y-4">
                             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                                <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-100">বন্ধুরা</h3>
                                <ul className="space-y-2">
                                    {friends.length > 0 ? friends.map(user => (
                                        <li key={user.id}>
                                            <button onClick={() => onNavigate(`#/profile/${user.id}`)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
                                                <img src={user.profilePicture} alt={user.username} className="w-9 h-9 rounded-full object-cover" />
                                                <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">{user.username}</span>
                                            </button>
                                        </li>
                                    )) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">আপনার কোনো বন্ধু নেই।</p>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
            {isCreatePostModalOpen && (
                <CreatePostModal 
                    currentUser={currentUser}
                    userGroups={userGroups}
                    onClose={() => setIsCreatePostModalOpen(false)}
                    onPostCreated={() => {
                        setIsCreatePostModalOpen(false);
                        refreshFeed();
                    }}
                />
            )}
        </div>
    );
};
