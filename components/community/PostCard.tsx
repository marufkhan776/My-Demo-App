import React, { useState, useEffect, useRef } from 'react';
// Fix: Import 'Group' type to resolve 'Cannot find name 'Group'' error.
import { Post, CommunityUser, Comment, Group } from '../../types';
import { communityService } from '../../services/communityService';
import { SharePostModal } from './SharePostModal';

interface PostCardProps {
    post: Post;
    currentUser: CommunityUser | null;
    onDataChange: () => void;
    onNavigate: (path: string) => void;
}

const CommentForm: React.FC<{
    postId: string;
    currentUser: CommunityUser;
    onDataChange: () => void;
}> = ({ postId, currentUser, onDataChange }) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setIsLoading(true);
        communityService.addCommentToPost(postId, currentUser.id, content);
        onDataChange();
        setContent('');
        setIsLoading(false);
    };

    return (
         <form onSubmit={handleSubmit} className="flex items-start space-x-3 pt-4">
            <img src={currentUser.profilePicture} alt={currentUser.username} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
            <div className="flex-grow">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="আপনার মন্তব্য লিখুন..."
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                    rows={1}
                    onFocus={(e) => e.target.rows = 2}
                    onBlur={(e) => { if (!e.target.value) e.target.rows = 1; }}
                    required
                />
                <div className="flex justify-end mt-2">
                    <button type="submit" disabled={isLoading} className="bg-red-600 text-white font-semibold py-1 px-4 rounded-md hover:bg-red-700 transition duration-300 disabled:bg-red-400 text-sm">
                        মন্তব্য করুন
                    </button>
                </div>
            </div>
        </form>
    );
};

const CommentView: React.FC<{ comment: Comment, onNavigate: (path: string) => void }> = ({ comment, onNavigate }) => {
    const [author, setAuthor] = useState<CommunityUser | null>(null);

    useEffect(() => {
        const user = communityService.getUserById(comment.authorId);
        if (user) setAuthor(user);
    }, [comment.authorId]);
    
    if (!author) return null;

    return (
        <div className="flex items-start space-x-3">
             <img src={author.profilePicture} alt={author.username} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
             <div className="flex-grow bg-gray-100 dark:bg-gray-700/80 rounded-xl px-4 py-2">
                <div className="flex items-baseline space-x-2">
                    <button onClick={() => onNavigate(`#/profile/${author.id}`)} className="font-bold text-sm text-gray-800 dark:text-gray-100 hover:underline">{author.username}</button>
                </div>
                 <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
             </div>
        </div>
    )
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onDataChange, onNavigate }) => {
    const [author, setAuthor] = useState<CommunityUser | null>(null);
    const [group, setGroup] = useState<Group | null>(null);
    const [showComments, setShowComments] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post.content);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);


    useEffect(() => {
        setAuthor(communityService.getUserById(post.authorId) || null);
        setGroup(communityService.getGroupById(post.groupId) || null);
    }, [post.authorId, post.groupId]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLikeClick = () => {
        if (!currentUser) return;
        communityService.toggleLikePost(post.id, currentUser.id);
        onDataChange();
    };

    const handleEdit = () => {
        setIsEditing(true);
        setIsMenuOpen(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedContent(post.content); // Reset content
    };

    const handleSaveEdit = () => {
        if (!editedContent.trim()) return;
        communityService.updatePost(post.id, editedContent.trim());
        setIsEditing(false);
        onDataChange();
    };

    const handleDelete = () => {
        setIsMenuOpen(false);
        if (window.confirm('আপনি কি নিশ্চিত যে এই পোস্টটি ডিলিট করতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।')) {
            communityService.deletePost(post.id);
            onDataChange();
        }
    };

    const isLiked = currentUser ? post.likeUserIds.includes(currentUser.id) : false;

    if (!author) {
        return null; // Don't render post if author not found
    }
    
    // Time formatting logic
    const postDate = new Date(post.timestamp);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - postDate.getTime()) / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    let timeAgo = '';
    if (diffSeconds < 60) {
        timeAgo = `${new Intl.NumberFormat('bn-BD').format(diffSeconds)} সেকেন্ড আগে`;
    } else if (diffMinutes < 60) {
        timeAgo = `${new Intl.NumberFormat('bn-BD').format(diffMinutes)} মিনিট আগে`;
    } else if (diffHours < 24) {
        timeAgo = `${new Intl.NumberFormat('bn-BD').format(diffHours)} ঘন্টা আগে`;
    } else if (diffDays < 7) {
        timeAgo = `${new Intl.NumberFormat('bn-BD').format(diffDays)} দিন আগে`;
    } else {
        timeAgo = postDate.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    return (
        <>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow relative">
            <div className="p-4">
                 <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 mb-4">
                        <img src={author.profilePicture} alt={author.username} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100 leading-tight">
                                <button onClick={() => onNavigate(`#/profile/${author.id}`)} className="hover:underline">{author.username}</button>
                                {group && 
                                    <>
                                     <span className="text-gray-500 dark:text-gray-400 font-normal mx-1">&gt;</span> 
                                     <button onClick={() => onNavigate(`#/community/group/${group.id}`)} className="font-normal hover:underline">{group.name}</button>
                                    </>
                                }
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</p>
                        </div>
                    </div>
                    {currentUser?.id === post.authorId && !isEditing && (
                        <div className="relative flex-shrink-0" ref={menuRef}>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Post options">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-900 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 py-1">
                                    <button onClick={handleEdit} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                                        এডিট করুন
                                    </button>
                                    <button onClick={handleDelete} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        ডিলিট করুন
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                 </div>
                {isEditing ? (
                    <div>
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="w-full p-2 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            rows={4}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={handleCancelEdit} className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-semibold py-1 px-4 rounded-md text-sm">বাতিল</button>
                            <button onClick={handleSaveEdit} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-4 rounded-md text-sm">সেভ</button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                    </p>
                )}
            </div>
             {post.imageUrl && !isEditing && (
                <div className="mt-2 bg-gray-100 dark:bg-gray-900">
                    <img src={post.imageUrl} alt="" className="w-full max-h-[500px] object-contain" />
                </div>
            )}
            
            {!isEditing && (
                <>
                {/* Stats */}
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 my-1 px-4">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.562 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path></svg>
                        {new Intl.NumberFormat('bn-BD').format(post.likeUserIds.length)}
                    </span>
                    <button onClick={() => setShowComments(!showComments)} className="hover:underline">
                        {new Intl.NumberFormat('bn-BD').format(post.comments.length)} টি মন্তব্য
                    </button>
                </div>
                
                {/* Action Buttons */}
                <div className="border-t border-gray-200 dark:border-gray-700 flex justify-around text-sm font-semibold text-gray-600 dark:text-gray-300">
                    <button 
                        onClick={handleLikeClick} 
                        className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-bl-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isLiked ? 'text-red-600' : ''}`}
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.562 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        লাইক
                    </button>
                     <button onClick={() => setShowComments(!showComments)} className="flex-1 flex justify-center items-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                        </svg>
                        মন্তব্য
                    </button>
                     <button onClick={() => setIsShareModalOpen(true)} className="flex-1 flex justify-center items-center gap-2 py-2 rounded-br-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        শেয়ার
                    </button>
                </div>
                
                {/* Comments Section */}
                {showComments && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                         <div className="space-y-4">
                            {post.comments.map(comment => <CommentView key={comment.id} comment={comment} onNavigate={onNavigate} />)}
                         </div>
                         {currentUser && (
                             <CommentForm postId={post.id} currentUser={currentUser} onDataChange={onDataChange} />
                         )}
                    </div>
                )}
                </>
            )}
        </div>
        {isShareModalOpen && author && group && (
            <SharePostModal 
                post={post}
                group={group}
                author={author}
                onClose={() => setIsShareModalOpen(false)}
            />
        )}
        </>
    );
};
