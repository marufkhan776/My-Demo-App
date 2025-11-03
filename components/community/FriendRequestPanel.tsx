
import React, { useState, useEffect } from 'react';
import { CommunityUser, FriendRequest } from '../../types';
import { communityService } from '../../services/communityService';
import { LoadingSpinner } from '../LoadingSpinner';

interface FriendRequestPanelProps {
    currentUser: CommunityUser;
    onClose: () => void;
    onNavigate: (path: string) => void;
    onDataChange: () => void; // To refresh header count
}

const RequestItem: React.FC<{
    request: FriendRequest;
    onAction: (requestId: string, action: 'accepted' | 'declined') => void;
    onNavigate: (path: string) => void;
}> = ({ request, onAction, onNavigate }) => {
    const [actor, setActor] = useState<CommunityUser | null>(null);

    useEffect(() => {
        setActor(communityService.getUserById(request.fromUserId) || null);
    }, [request.fromUserId]);

    if (!actor) return null;

    return (
        <li className="p-3">
            <div className="flex items-center gap-3">
                <img 
                    src={actor.profilePicture} 
                    alt={actor.username} 
                    className="w-12 h-12 rounded-full object-cover cursor-pointer"
                    onClick={() => onNavigate(`#/profile/${actor.id}`)}
                />
                <div className="flex-grow">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                        <strong 
                            className="font-semibold cursor-pointer hover:underline"
                            onClick={() => onNavigate(`#/profile/${actor.id}`)}
                        >
                            {actor.username}
                        </strong> আপনাকে একটি বন্ধুত্বের অনুরোধ পাঠিয়েছেন।
                    </p>
                    <div className="flex gap-2 mt-2">
                        <button onClick={() => onAction(request.id, 'accepted')} className="flex-1 bg-red-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-700 transition duration-300 text-sm">
                            গ্রহণ করুন
                        </button>
                        <button onClick={() => onAction(request.id, 'declined')} className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-1 px-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-300 text-sm">
                            বাতিল করুন
                        </button>
                    </div>
                </div>
            </div>
        </li>
    );
};

export const FriendRequestPanel: React.FC<FriendRequestPanelProps> = ({ currentUser, onClose, onNavigate, onDataChange }) => {
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = () => {
        setIsLoading(true);
        setRequests(communityService.getPendingFriendRequestsForUser(currentUser.id));
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [currentUser]);

    const handleAction = (requestId: string, action: 'accepted' | 'declined') => {
        communityService.respondToFriendRequest(requestId, action);
        onDataChange();
        loadData(); // Refresh the list in the panel
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-full max-w-sm sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-fade-in-down" role="dialog" aria-modal="true" aria-labelledby="friend-requests-heading">
            <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
                <h2 id="friend-requests-heading" className="text-lg font-bold text-gray-900 dark:text-gray-100">বন্ধুত্বের অনুরোধ</h2>
            </div>
            
            {isLoading ? (
                 <div className="h-48 flex justify-center items-center"><LoadingSpinner /></div>
            ) : requests.length > 0 ? (
                <ul className="max-h-96 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                    {requests.map(request => (
                       <RequestItem key={request.id} request={request} onAction={handleAction} onNavigate={onNavigate} />
                    ))}
                </ul>
            ) : (
                <p className="p-8 text-center text-gray-500 dark:text-gray-400">আপনার কোনো নতুন অনুরোধ নেই।</p>
            )}
             <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
