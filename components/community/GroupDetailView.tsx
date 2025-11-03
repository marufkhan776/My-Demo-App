import React, { useState, useEffect, useCallback } from 'react';
import { communityService } from '../../services/communityService';
import { Group, Post, CommunityUser, Article } from '../../types';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { ChatView } from './ChatView';

interface GroupDetailViewProps {
    groupId: string;
    currentUser: CommunityUser | null;
    onNavigate: (path: string) => void;
    onSelectArticle: (article: Article) => void;
}

export const GroupDetailView: React.FC<GroupDetailViewProps> = ({ groupId, currentUser, onNavigate, onSelectArticle }) => {
    const [group, setGroup] = useState<Group | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [members, setMembers] = useState<CommunityUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'posts' | 'chat'>('posts');

    const refreshData = useCallback(() => {
        const foundGroup = communityService.getGroupById(groupId);
        if (foundGroup) {
            setGroup(foundGroup);
            setPosts(communityService.getPostsForGroup(groupId));
            setMembers(communityService.getUsersByIds(foundGroup.memberIds));
        }
        setIsLoading(false);
    }, [groupId]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);
    
    const handleJoinGroup = () => {
        if (currentUser && group) {
            communityService.joinGroup(group.id, currentUser.id);
            refreshData(); // Refresh to update member list and button state
        }
    };
    
    if (isLoading) {
        return <div className="text-center p-10">লোড হচ্ছে...</div>;
    }

    if (!group) {
        return <div className="text-center p-10">গ্রুপ পাওয়া যায়নি।</div>;
    }

    const isMember = currentUser ? group.memberIds.includes(currentUser.id) : false;

    return (
        <main className="flex-grow container mx-auto px-4 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{group.name}</h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">{group.description}</p>
                        <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                             <span>{new Intl.NumberFormat('bn-BD').format(group.memberIds.length)} জন সদস্য</span>
                             <div className="flex -space-x-2">
                                {members.slice(0, 5).map(member => (
                                    <img key={member.id} src={member.profilePicture} alt={member.username} title={member.username} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                                ))}
                                {members.length > 5 && (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold border-2 border-white dark:border-gray-800">
                                        +{members.length - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                     {currentUser && !isMember && (
                        <button onClick={handleJoinGroup} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition duration-300 flex-shrink-0">
                            গ্রুপে যোগ দিন
                        </button>
                    )}
                </div>
            </div>

            {isMember && (
                <div className="border-b border-gray-200 dark:border-gray-700 flex mb-8 max-w-3xl mx-auto">
                    <button 
                        onClick={() => setActiveTab('posts')}
                        className={`flex-1 py-3 font-semibold text-center ${activeTab === 'posts' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        পোস্টসমূহ
                    </button>
                    <button 
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 py-3 font-semibold text-center ${activeTab === 'chat' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        চ্যাট
                    </button>
                </div>
            )}

            {activeTab === 'posts' ? (
                <>
                    {currentUser && isMember && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8 max-w-3xl mx-auto">
                            <div className="flex items-center gap-3">
                                <img src={currentUser.profilePicture} alt={currentUser.username} className="w-10 h-10 rounded-full object-cover" />
                                <button 
                                    onClick={() => setIsCreatePostModalOpen(true)}
                                    className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-full h-10 px-4 text-left text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                    একটি পোস্ট লিখুন...
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-6 max-w-3xl mx-auto">
                        {posts.map(post => (
                            <PostCard 
                                key={post.id} 
                                post={post}
                                currentUser={currentUser}
                                onDataChange={refreshData}
                                onNavigate={onNavigate}
                                onSelectArticle={onSelectArticle}
                            />
                        ))}
                    </div>
                    
                    {posts.length === 0 && (
                        <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-3xl mx-auto">
                            <h2 className="text-2xl font-semibold">এখনও কোনো পোস্ট নেই।</h2>
                            <p className="mt-2">{isMember ? 'প্রথম পোস্টটি আপনিই করুন!' : 'গ্রুপে যোগ দিয়ে আলোচনা শুরু করুন।'}</p>
                        </div>
                    )}
                </>
            ) : (
                <ChatView groupId={groupId} currentUser={currentUser} />
            )}

            
            {isCreatePostModalOpen && currentUser && group && (
                <CreatePostModal 
                    currentUser={currentUser}
                    userGroups={[group]}
                    defaultGroupId={group.id}
                    onClose={() => setIsCreatePostModalOpen(false)}
                    onPostCreated={() => {
                        setIsCreatePostModalOpen(false);
                        refreshData();
                    }}
                />
            )}
        </main>
    );
};