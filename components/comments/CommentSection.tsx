import React, { useState, useEffect, useCallback } from 'react';
import { NewsComment, CommunityUser } from '../../types';
import { commentService } from '../../services/commentService';
import { communityService } from '../../services/communityService';
import { LoadingSpinner } from '../LoadingSpinner';
import { CommentCard } from './CommentCard';
import { CommentForm } from './CommentForm';

interface CommentSectionProps {
    articleId: string;
    currentUser: CommunityUser | null;
    onLoginClick: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ articleId, currentUser, onLoginClick }) => {
    const [comments, setComments] = useState<NewsComment[]>([]);
    const [authors, setAuthors] = useState<Record<string, CommunityUser>>({});
    const [isLoading, setIsLoading] = useState(true);

    const refreshComments = useCallback(() => {
        setIsLoading(true);
        const articleComments = commentService.getCommentsForArticle(articleId);
        
        const authorIds = new Set(articleComments.map(c => c.authorId));
        const fetchedAuthors = communityService.getUsersByIds(Array.from(authorIds));
        
        setAuthors(fetchedAuthors.reduce((acc, user) => ({ ...acc, [user.id]: user }), {}));
        setComments(articleComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        
        setIsLoading(false);
    }, [articleId]);

    useEffect(() => {
        refreshComments();
    }, [refreshComments]);

    const handleAddComment = (content: string) => {
        if (!currentUser) return;
        commentService.addComment(articleId, currentUser.id, content, null);
        refreshComments();
    };

    const topLevelComments = comments.filter(comment => comment.parentId === null);

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3">
                মন্তব্যসমূহ ({new Intl.NumberFormat('bn-BD').format(comments.length)})
            </h3>

            {currentUser ? (
                <CommentForm
                    onSubmit={handleAddComment}
                    currentUser={currentUser}
                    placeholder="আপনার মন্তব্য যোগ করুন..."
                    buttonText="মন্তব্য পোস্ট করুন"
                />
            ) : (
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                    <p className="mb-2 text-gray-700 dark:text-gray-300">আলোচনায় অংশ নিতে, অনুগ্রহ করে লগইন করুন।</p>
                    <button onClick={onLoginClick} className="font-bold text-red-600 hover:underline">
                        লগইন / রেজিস্টার করুন
                    </button>
                </div>
            )}
            
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <div className="space-y-6">
                    {topLevelComments.length > 0 ? (
                        topLevelComments.map(comment => (
                            <CommentCard
                                key={comment.id}
                                comment={comment}
                                allComments={comments}
                                authors={authors}
                                currentUser={currentUser}
                                onDataChange={refreshComments}
                                onLoginClick={onLoginClick}
                            />
                        ))
                    ) : (
                         <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p>এখনও কোনো মন্তব্য করা হয়নি। প্রথম মন্তব্যটি আপনিই করুন!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
