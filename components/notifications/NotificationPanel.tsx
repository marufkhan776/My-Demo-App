
import React, { useState, useEffect, useMemo } from 'react';
import { CommunityUser, Notification, Post } from '../../types';
import { notificationService } from '../../services/notificationService';
import { communityService } from '../../services/communityService';
import { LoadingSpinner } from '../LoadingSpinner';

interface NotificationPanelProps {
    currentUser: CommunityUser;
    onClose: () => void;
    onNavigate: (path: string) => void;
    onDataChange: () => void; // To refresh header count
}

const NotificationItem: React.FC<{
    notification: Notification;
    actor: CommunityUser | undefined;
    post: Post | undefined;
    onNavigate: (path: string) => void;
    markAsRead: (id: string) => void;
}> = ({ notification, actor, post, onNavigate, markAsRead }) => {
    
    const group = useMemo(() => post ? communityService.getGroupById(post.groupId) : undefined, [post]);

    const getNotificationText = () => {
        if (!actor) return { pre: 'একটি নতুন বিজ্ঞপ্তি...', bold: '', post: '' };
        
        switch (notification.type) {
            case 'like':
                return { pre: '', bold: actor.username, post: ' আপনার একটি পোস্টে লাইক দিয়েছেন।' };
            case 'comment':
                 return { pre: '', bold: actor.username, post: ' আপনার একটি পোস্টে মন্তব্য করেছেন।' };
            case 'new_post':
                 return { pre: '', bold: actor.username, post: ` গ্রুপে একটি নতুন পোস্ট করেছেন: ${group?.name}` };
            case 'friend_request':
                return { pre: '', bold: actor.username, post: ' আপনাকে একটি বন্ধুত্বের অনুরোধ পাঠিয়েছেন।' };
            case 'friend_accept':
                return { pre: '', bold: actor.username, post: ' আপনার বন্ধুত্বের অনুরোধ গ্রহণ করেছেন।' };
            default:
                return { pre: 'একটি নতুন বিজ্ঞপ্তি...', bold: '', post: '' };
        }
    };
    
    const handleClick = () => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        if (notification.type === 'friend_request' || notification.type === 'friend_accept') {
            onNavigate(`#/profile/${notification.actorId}`);
        } else if (post) {
            onNavigate(`#/community/group/${post.groupId}`);
        }
    };
    
    // Time formatting logic
    const postDate = new Date(notification.timestamp);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - postDate.getTime()) / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    
    let timeAgo = '';
    if (diffSeconds < 60) {
        timeAgo = `${new Intl.NumberFormat('bn-BD').format(diffSeconds)} সেকেন্ড আগে`;
    } else if (diffMinutes < 60) {
        timeAgo = `${new Intl.NumberFormat('bn-BD').format(diffMinutes)} মিনিট আগে`;
    } else if (diffHours < 24) {
        timeAgo = `${new Intl.NumberFormat('bn-BD').format(diffHours)} ঘন্টা আগে`;
    } else {
        timeAgo = postDate.toLocaleDateString('bn-BD', { month: 'long', day: 'numeric' });
    }

    const { pre, bold, post: postText } = getNotificationText();

    return (
        <li className={`${!notification.isRead ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
             <button onClick={handleClick} className="w-full text-left flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                {actor ? (
                    <img src={actor.profilePicture} alt={actor.username} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
                )}
                <div className="flex-grow">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                        {pre}
                        <strong className="font-semibold">{bold}</strong>
                        {postText}
                    </p>
                    <p className={`text-xs font-bold ${notification.isRead ? 'text-gray-400 dark:text-gray-500' : 'text-red-600 dark:text-red-400'}`}>
                        {timeAgo}
                    </p>
                </div>
                {!notification.isRead && (
                     <div className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 mt-1" aria-label="Unread"></div>
                )}
            </button>
        </li>
    );
}


export const NotificationPanel: React.FC<NotificationPanelProps> = ({ currentUser, onClose, onNavigate, onDataChange }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [users, setUsers] = useState<Record<string, CommunityUser>>({});
    const [posts, setPosts] = useState<Record<string, Post>>({});
    const [isLoading, setIsLoading] = useState(true);

    const loadData = () => {
        setIsLoading(true);
        const userNotifications = notificationService.getNotificationsForUser(currentUser.id);
        setNotifications(userNotifications);

        const requiredUserIds = new Set(userNotifications.map(n => n.actorId));
        const requiredPostIds = new Set(userNotifications
            .filter(n => n.type !== 'friend_request' && n.type !== 'friend_accept')
            .map(n => n.entityId)
        );
        
        const fetchedUsers = communityService.getUsersByIds(Array.from(requiredUserIds));
        const usersMap = fetchedUsers.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {} as Record<string, CommunityUser>);
        setUsers(usersMap);

        const postsMap = Array.from(requiredPostIds).reduce((acc, postId) => {
            const post = communityService.getPostById(postId);
            if (post) acc[postId] = post;
            return acc;
        }, {} as Record<string, Post>);
        setPosts(postsMap);
        
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [currentUser]);

    const handleMarkAsRead = (id: string) => {
        notificationService.markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        onDataChange(); // Refresh header count
    };

    const handleMarkAllAsRead = () => {
        notificationService.markAllAsRead(currentUser.id);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        onDataChange();
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-full max-w-sm sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-fade-in-down" role="dialog" aria-modal="true" aria-labelledby="notifications-heading">
            <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
                <h2 id="notifications-heading" className="text-lg font-bold text-gray-900 dark:text-gray-100">বিজ্ঞপ্তিসমূহ</h2>
                <button onClick={handleMarkAllAsRead} className="text-sm font-semibold text-red-600 hover:underline">সবগুলো পড়া হয়েছে</button>
            </div>
            
            {isLoading ? (
                 <div className="h-48 flex justify-center items-center"><LoadingSpinner /></div>
            ) : notifications.length > 0 ? (
                <ul className="max-h-96 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications.map(notification => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            actor={users[notification.actorId]}
                            post={posts[notification.entityId]}
                            onNavigate={onNavigate}
                            markAsRead={handleMarkAsRead}
                        />
                    ))}
                </ul>
            ) : (
                <p className="p-8 text-center text-gray-500 dark:text-gray-400">আপনার কোনো নতুন বিজ্ঞপ্তি নেই।</p>
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
