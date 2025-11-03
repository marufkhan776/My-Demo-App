import { NewsComment } from '../types';
import { contentService } from './contentService';
import { communityService } from './communityService';

const COMMENTS_KEY = 'newsComments';

const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const saveToStorage = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};

const seedInitialComments = (articleId: string) => {
    const allComments = getFromStorage<NewsComment[]>(COMMENTS_KEY, []);
    const commentsForThisArticle = allComments.filter(c => c.articleId === articleId);

    if (commentsForThisArticle.length === 0) {
        const defaultUser = communityService.getUserById('user_1');
        const anotherUser = communityService.getUserById('user_2');

        if (defaultUser && anotherUser) {
            const initialComment: NewsComment = {
                id: `nc_${Date.now()}`,
                articleId: articleId,
                authorId: defaultUser.id,
                content: 'খুবই তথ্যবহুল একটি প্রতিবেদন। লেখকের বিশ্লেষণধর্মী লেখার ধরণ আমার ভালো লেগেছে।',
                timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
                parentId: null,
                likeUserIds: [anotherUser.id],
            };

            const replyComment: NewsComment = {
                id: `nc_${Date.now() + 1}`,
                articleId: articleId,
                authorId: anotherUser.id,
                content: 'আমি আপনার সাথে একমত। বিশেষ করে শেষ প্যারাগ্রাফটি খুবই গুরুত্বপূর্ণ।',
                timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
                parentId: initialComment.id,
                likeUserIds: [],
            };
            
            allComments.push(initialComment, replyComment);
            saveToStorage(COMMENTS_KEY, allComments);
        }
    }
}


export const commentService = {
    getCommentsForArticle(articleId: string): NewsComment[] {
        // Seed comments for the first article if none exist, for demo purposes.
        const allArticles = contentService.getArticles();
        if (allArticles.length > 0 && articleId === allArticles[0].id) {
            seedInitialComments(articleId);
        }
        
        const allComments = getFromStorage<NewsComment[]>(COMMENTS_KEY, []);
        return allComments.filter(c => c.articleId === articleId);
    },

    addComment(articleId: string, authorId: string, content: string, parentId: string | null = null): NewsComment {
        const allComments = this.getCommentsForArticle(articleId);
        const newComment: NewsComment = {
            id: `nc_${Date.now()}`,
            articleId,
            authorId,
            content,
            parentId,
            timestamp: new Date().toISOString(),
            likeUserIds: [],
        };
        const allStoredComments = getFromStorage<NewsComment[]>(COMMENTS_KEY, []);
        allStoredComments.push(newComment);
        saveToStorage(COMMENTS_KEY, allStoredComments);
        return newComment;
    },

    updateComment(commentId: string, newContent: string): void {
        const allComments = getFromStorage<NewsComment[]>(COMMENTS_KEY, []);
        const comment = allComments.find(c => c.id === commentId);
        if (comment) {
            comment.content = newContent;
            saveToStorage(COMMENTS_KEY, allComments);
        }
    },

    deleteComment(commentId: string): void {
        let allComments = getFromStorage<NewsComment[]>(COMMENTS_KEY, []);
        
        // Find all child comments recursively to delete them as well
        const commentsToDelete = new Set<string>([commentId]);
        let searchQueue = [commentId];

        while (searchQueue.length > 0) {
            const parentId = searchQueue.shift();
            const children = allComments.filter(c => c.parentId === parentId);
            for (const child of children) {
                commentsToDelete.add(child.id);
                searchQueue.push(child.id);
            }
        }
        
        const remainingComments = allComments.filter(c => !commentsToDelete.has(c.id));
        saveToStorage(COMMENTS_KEY, remainingComments);
    },

    toggleLike(commentId: string, userId: string): void {
        const allComments = getFromStorage<NewsComment[]>(COMMENTS_KEY, []);
        const comment = allComments.find(c => c.id === commentId);
        if (comment) {
            const likeIndex = comment.likeUserIds.indexOf(userId);
            if (likeIndex > -1) {
                comment.likeUserIds.splice(likeIndex, 1);
            } else {
                comment.likeUserIds.push(userId);
            }
            saveToStorage(COMMENTS_KEY, allComments);
        }
    },
};
