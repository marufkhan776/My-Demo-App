
import React, { useState, useEffect } from 'react';
import { communityService } from '../../services/communityService';
import { Group, CommunityUser } from '../../types';
import { CreateGroupModal } from './CreateGroupModal';

interface GroupsViewProps {
    currentUser: CommunityUser | null;
    onLoginClick: () => void;
    onNavigate: (path: string) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({ currentUser, onLoginClick, onNavigate }) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        setGroups(communityService.getGroups());
    }, []);
    
    const handleGroupCreated = (newGroup: Group) => {
        setGroups(prev => [newGroup, ...prev]);
        setIsCreateModalOpen(false);
    };

    const filteredGroups = groups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="flex-grow container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">কমিউনিটি গ্রুপসমূহ</h1>
                {currentUser ? (
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300"
                    >
                        নতুন গ্রুপ তৈরি করুন
                    </button>
                ) : (
                    <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="mb-2">গ্রুপে যোগ দিতে বা নতুন গ্রুপ তৈরি করতে লগইন করুন।</p>
                        <button onClick={onLoginClick} className="font-bold text-red-600 hover:underline">
                            লগইন / রেজিস্টার
                        </button>
                    </div>
                )}
            </div>

            <div className="mb-8">
                <input
                    type="search"
                    placeholder="গ্রুপ খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-lg mx-auto block pl-5 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
            </div>
            
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredGroups.map(group => (
                    <div 
                        key={group.id} 
                        onClick={() => onNavigate(`#/community/group/${group.id}`)}
                        role="link"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate(`#/community/group/${group.id}`); }}
                        className="cursor-pointer block bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">{group.name}</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{group.description}</p>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span>{new Intl.NumberFormat('bn-BD').format(group.memberIds.length)} জন সদস্য</span>
                        </div>
                    </div>
                ))}
            </div>
            
            {filteredGroups.length === 0 && (
                 <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <h2 className="text-2xl font-semibold">কোনো গ্রুপ পাওয়া যায়নি।</h2>
                    <p className="mt-2">{searchQuery ? 'আপনার অনুসন্ধানের সাথে মেলে এমন কোনো ফলাফল নেই।' : 'একটি নতুন গ্রুপ তৈরি করে কমিউনিটি শুরু করুন!'}</p>
                </div>
            )}

            {isCreateModalOpen && currentUser && (
                <CreateGroupModal 
                    currentUser={currentUser}
                    onClose={() => setIsCreateModalOpen(false)}
                    onGroupCreated={handleGroupCreated}
                />
            )}
        </main>
    );
};
