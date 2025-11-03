
import React, { useState, useEffect, useCallback } from 'react';
import { communityService } from '../../services/communityService';
import { Post, CommunityUser, Group, Article } from '../../types';
import { PostCard } from './PostCard';
import { LoadingSpinner } from '../LoadingSpinner';
import { EditProfileModal } from './EditProfileModal';

interface ProfileViewProps {
    userId: string;
    currentUser: CommunityUser | null;
    onNavigate: (path: string) => void;
    onDataChange: () => void; // To refresh friend request count in header
    onSelectArticle: (article: Article) => void;
}

const StatItem: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="text-center">
        <p className="font-bold text-2xl text-gray-800 dark:text-gray-100">{new Intl.NumberFormat('bn-BD').format(value)}</p>
        <p className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
    </div>
);

export const ProfileView: React.FC<ProfileViewProps> = ({ userId, currentUser, onNavigate, onDataChange, onSelectArticle }) => {
    const [profileUser, setProfileUser] = useState<CommunityUser | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [friends, setFriends] = useState<CommunityUser[]>([]);
    const [stats, setStats] = useState({ totalLikes: 0, totalComments: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'posts' | 'groups' | 'friends'>('posts');
    const [friendshipStatus, setFriendshipStatus] = useState<'friends' | 'request_sent' | 'request_received' | 'not_friends' | null>(null);

    const refreshData = useCallback(() => {
        const user = communityService.getUserById(userId);
        if (user) {
            setProfileUser(user);
            setPosts(communityService.getPostsByAuthor(userId));
            setGroups(communityService.getGroupsForUser(userId));
            setFriends(communityService.getFriendsForUser(userId));
            setStats(communityService.getUserStats(userId));
            if (currentUser && currentUser.id !== userId) {
                setFriendshipStatus(communityService.getFriendshipStatus(currentUser.id, userId));
            } else {
                setFriendshipStatus(null);
            }
        }
        setIsLoading(false);
    }, [userId, currentUser]);

    useEffect(() => {
        setIsLoading(true);
        refreshData();
        // Reset tab to posts when viewing a new profile
        setActiveTab('posts');
    }, [refreshData, userId]);

    const handleProfileUpdate = (updatedUser: CommunityUser) => {
        setProfileUser(updatedUser);
        setIsEditModalOpen(false);
    };
    
    const handleFriendAction = () => {
        if (!currentUser || !profileUser) return;
        switch (friendshipStatus) {
            case 'not_friends':
                communityService.sendFriendRequest(currentUser.id, profileUser.id);
                break;
            case 'request_received':
                // For simplicity, we assume they accept from the request panel,
                // but a direct accept button here would be a good addition.
                // For now, this button might link to the request panel or be disabled.
                break;
            case 'friends':
                if (window.confirm(`আপনি কি নিশ্চিত যে ${profileUser.username}-কে বন্ধু তালিকা থেকে সরাতে চান?`)) {
                    communityService.removeFriend(currentUser.id, profileUser.id);
                }
                break;
        }
        refreshData(); // Refresh to show new status
        onDataChange(); // Refresh counts in header
    };

    const renderFriendshipButton = () => {
        if (!currentUser || !profileUser || currentUser.id === profileUser.id) {
            return (
                <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="mt-4 sm:mt-0 bg-red-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-red-700 transition duration-300 text-sm">
                    প্রোফাইল সম্পাদনা করুন
                </button>
            );
        }

        switch (friendshipStatus) {
            case 'friends':
                return (
                    <button onClick={handleFriendAction} className="mt-4 sm:mt-0 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300 text-sm">
                        বন্ধু
                    </button>
                );
            case 'request_sent':
                return (
                    <button disabled className="mt-4 sm:mt-0 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-semibold py-2 px-5 rounded-lg text-sm cursor-not-allowed">
                        অনুরোধ পাঠানো হয়েছে
                    </button>
                );
             case 'request_received':
                 // In a real app, this button could trigger an accept/decline modal.
                 // For now, we'll guide them to the request panel via header icon.
                 return (
                    <button disabled className="mt-4 sm:mt-0 bg-green-500 text-white font-semibold py-2 px-5 rounded-lg text-sm cursor-not-allowed">
                        অনুরোধ গ্রহণ করুন
                    </button>
                );
            case 'not_friends':
            default:
                return (
                     <button onClick={handleFriendAction} className="mt-4 sm:mt-0 bg-red-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-red-700 transition duration-300 text-sm">
                        বন্ধু হিসেবে যুক্ত করুন
                    </button>
                );
        }
    };

    if (isLoading) {
        return <div className="py-10"><LoadingSpinner /></div>;
    }

    if (!profileUser) {
        return <div className="text-center p-10">ব্যবহারকারী পাওয়া যায়নি।</div>;
    }

    const creationDate = new Date(profileUser.createdAt).toLocaleDateString('bn-BD', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <>
            <main className="bg-gray-100 dark:bg-gray-900/95 flex-grow">
                <div className="container mx-auto px-2 sm:px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Profile Header */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
                            <div className="h-48 bg-gray-200 dark:bg-gray-700">
                                {profileUser.coverPhoto && (
                                    <img src={profileUser.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="px-6 pb-6 -mt-20 relative">
                                <div className="flex flex-col sm:flex-row items-center sm:items-end sm:justify-between">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                                        <img 
                                            src={profileUser.profilePicture} 
                                            alt={profileUser.username} 
                                            className="w-36 h-36 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                                        />
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4 sm:mt-0 text-center sm:text-left">{profileUser.username}</h1>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">সদস্য হয়েছেন: {creationDate}</p>
                                        </div>
                                    </div>
                                    {renderFriendshipButton()}
                                </div>
                                {profileUser.bio && (
                                    <p className="text-gray-600 dark:text-gray-300 mt-4 text-center sm:text-left">{profileUser.bio}</p>
                                )}
                                <div className="flex justify-around items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <StatItem value={posts.length} label="পোস্ট" />
                                    <StatItem value={friends.length} label="বন্ধু" />
                                    <StatItem value={groups.length} label="গ্রুপ" />
                                    <StatItem value={stats.totalLikes} label="লাইক পেয়েছেন" />
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <div className="border-b border-gray-200 dark:border-gray-700 flex">
                                <button 
                                    onClick={() => setActiveTab('posts')}
                                    className={`flex-1 py-3 font-semibold text-center ${activeTab === 'posts' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    পোস্টসমূহ
                                </button>
                                 <button 
                                    onClick={() => setActiveTab('friends')}
                                    className={`flex-1 py-3 font-semibold text-center ${activeTab === 'friends' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    বন্ধুরা
                                </button>
                                <button 
                                    onClick={() => setActiveTab('groups')}
                                    className={`flex-1 py-3 font-semibold text-center ${activeTab === 'groups' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    গ্রুপসমূহ
                                </button>
                            </div>
                            <div className="p-2 sm:p-6">
                                {activeTab === 'posts' && (
                                    <div className="space-y-6">
                                        {posts.length > 0 ? (
                                            posts.map(post => (
                                                <PostCard 
                                                    key={post.id} 
                                                    post={post}
                                                    currentUser={currentUser}
                                                    onDataChange={refreshData}
                                                    onNavigate={onNavigate}
                                                    onSelectArticle={onSelectArticle}
                                                />
                                            ))
                                        ) : (
                                            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                                                <h2 className="text-xl font-semibold">{profileUser.username} এখনও কোনো পোস্ট করেননি।</h2>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {activeTab === 'friends' && (
                                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {friends.length > 0 ? (
                                            friends.map(friend => (
                                                 <div 
                                                    key={friend.id}
                                                    onClick={() => onNavigate(`#/profile/${friend.id}`)}
                                                    className="cursor-pointer flex flex-col items-center text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <img src={friend.profilePicture} alt={friend.username} className="w-20 h-20 rounded-full object-cover mb-2"/>
                                                    <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100">{friend.username}</h3>
                                                 </div>
                                            ))
                                        ) : (
                                             <div className="text-center py-16 text-gray-500 dark:text-gray-400 col-span-full">
                                                <h2 className="text-xl font-semibold">{profileUser.username}-এর কোনো বন্ধু নেই।</h2>
                                            </div>
                                        )}
                                     </div>
                                )}
                                {activeTab === 'groups' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {groups.length > 0 ? (
                                            groups.map(group => (
                                                <div 
                                                    key={group.id}
                                                    onClick={() => onNavigate(`#/community/group/${group.id}`)}
                                                    className="cursor-pointer bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center font-bold text-red-600 dark:text-red-300 flex-shrink-0 text-xl">
                                                        {group.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800 dark:text-gray-100">{group.name}</h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Intl.NumberFormat('bn-BD').format(group.memberIds.length)} জন সদস্য</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-16 text-gray-500 dark:text-gray-400 sm:col-span-2">
                                                <h2 className="text-xl font-semibold">{profileUser.username} কোনো গ্রুপে যোগ দেননি।</h2>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {isEditModalOpen && currentUser?.id === userId && (
                <EditProfileModal 
                    user={profileUser} 
                    onClose={() => setIsEditModalOpen(false)}
                    onProfileUpdate={handleProfileUpdate}
                />
            )}
        </>
    );
};
