import React, { useState, useRef, useEffect } from 'react';
import { NewsComment, CommunityUser } from '../../types';
import { commentService } from '../../services/commentService';
import { CommentForm } from './CommentForm';

interface CommentCardProps {
    comment: NewsComment;
    allComments: NewsComment[];
    authors: Record<string, CommunityUser>;
    currentUser: CommunityUser | null;
    onDataChange: () => void;
    onLoginClick: () => void;
}

export const CommentCard: React.FC<CommentCardProps> = ({ comment, allComments, authors, currentUser, onDataChange, onLoginClick }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    
    const author = authors[comment.authorId];
    const replies = allComments
        .filter(c => c.parentId === comment.id)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Time formatting logic
    const postDate = new Date(comment.timestamp);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - postDate.getTime()) / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    let timeAgo = '';
    if (diffSeconds < 60) timeAgo = `এই মাত্র`;
    else if (diffMinutes < 60) timeAgo = `${new Intl.NumberFormat('bn-BD').format(diffMinutes)} মিনিট আগে`;
    else if (diffHours < 24) timeAgo = `${new Intl.NumberFormat('bn-BD').format(diffHours)} ঘন্টা আগে`;
    else if (diffDays < 7) timeAgo = `${new Intl.NumberFormat('bn-BD').format(diffDays)} দিন আগে`;
    else timeAgo = postDate.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

    const handleLike = () => {
        if (!currentUser) {
            onLoginClick();
            return;
        }
        commentService.toggleLike(comment.id, currentUser.id);
        onDataChange();
    };

    const handleReplySubmit = (content: string) => {
        if (!currentUser) return;
        commentService.addComment(comment.articleId, currentUser.id, content, comment.id);
        setIsReplying(false);
        onDataChange();
    };

    const handleEditSubmit = () => {
        if (!editedContent.trim()) return;
        commentService.updateComment(comment.id, editedContent.trim());
        setIsEditing(false);
        onDataChange();
    };

    const handleDelete = () => {
        if (window.confirm('আপনি কি নিশ্চিত যে এই মন্তব্যটি মুছে ফেলতে চান?')) {
            commentService.deleteComment(comment.id);
            onDataChange();
        }
    };

    if (!author) return null;

    const isLiked = currentUser ? comment.likeUserIds.includes(currentUser.id) : false;

    return (
        <div className="flex items-start space-x-3">
            <img src={author.profilePicture} alt={author.username} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            <div className="flex-grow">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-2">
                    <div className="flex items-baseline justify-between">
                         <div className="flex items-baseline space-x-2">
                            <span className="font-bold text-sm text-gray-800 dark:text-gray-100">{author.username}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">&middot; {timeAgo}</span>
                        </div>
                        {currentUser?.id === author.id && !isEditing && (
                            <div className="flex items-center space-x-3 text-xs">
                                <button onClick={() => setIsEditing(true)} className="font-semibold text-gray-500 hover:underline">সম্পাদনা</button>
                                <button onClick={handleDelete} className="font-semibold text-red-500 hover:underline">মুছুন</button>
                            </div>
                        )}
                    </div>
                    {isEditing ? (
                        <div>
                            <CommentForm
                                onSubmit={handleEditSubmit}
                                currentUser={currentUser!}
                                initialText={editedContent}
                                onTextChange={setEditedContent}
                                buttonText="সংরক্ষণ"
                            />
                             <button onClick={() => setIsEditing(false)} className="text-xs text-gray-500 hover:underline mt-1">বাতিল</button>
                        </div>
                    ) : (
                         <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-1">{comment.content}</p>
                    )}
                </div>
                {!isEditing && (
                     <div className="flex items-center space-x-4 mt-1 px-2 text-xs font-semibold">
                        <button onClick={handleLike} className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.562 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
                             <span>{isLiked ? 'পছন্দ হয়েছে' : 'পছন্দ'}</span>
                             {comment.likeUserIds.length > 0 && <span>({new Intl.NumberFormat('bn-BD').format(comment.likeUserIds.length)})</span>}
                        </button>
                         <button onClick={() => setIsReplying(!isReplying)} className="text-gray-500 hover:text-red-600">উত্তর দিন</button>
                    </div>
                )}
                 {isReplying && currentUser && (
                    <div className="mt-3">
                        <CommentForm
                            onSubmit={handleReplySubmit}
                            currentUser={currentUser}
                            onCancel={() => setIsReplying(false)}
                            placeholder={`${author.username}-কে উত্তর দিন...`}
                            buttonText="উত্তর দিন"
                        />
                    </div>
                )}
                 {replies.length > 0 && (
                    <div className="mt-4 space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                        {replies.map(reply => (
                            <CommentCard
                                key={reply.id}
                                comment={reply}
                                allComments={allComments}
                                authors={authors}
                                currentUser={currentUser}
                                onDataChange={onDataChange}
                                onLoginClick={onLoginClick}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
