export type Category = string;

export interface Article {
    id: string; // Unique identifier for each article
    headline: string;
    summary: string;
    fullStory: string;
    category: Category;
    imageUrl: string;
    publishedDate: string;
    imageKeyword: string;
}

export interface CategoryStructure {
    name: Category;
    subcategories?: Category[];
}

export type PolicyKey = 'aboutUs' | 'editorialPolicy' | 'contact' | 'privacyPolicy' | 'terms';

export interface Policy {
    title: string;
    content: string;
}

export interface SiteSettings {
    siteName: string;
    socialLinks: {
        facebook: string;
        twitter: string;
        youtube: string;
        instagram: string;
    };
}

// Community Feature Types
export interface CommunityUser {
    id: string;
    username: string;
    passwordHash: string; // This would be a real hash in a real app
    profilePicture: string;
    createdAt: string; // ISO date string of user creation
    bio?: string;
    coverPhoto?: string;
    friendIds: string[];
}

export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    content: string;
    timestamp: string;
}

export interface Post {
    id: string;
    groupId: string;
    authorId: string;
    content: string;
    imageUrl?: string; // Optional field for an attached image
    timestamp: string;
    comments: Comment[];
    likeUserIds: string[];
    sharedArticleId?: string; // ID of a shared news article
}

export interface Group {
    id: string;
    name: string;
    description: string;
    creatorId: string;
    memberIds: string[];
}

export interface FriendRequest {
    id: string;
    fromUserId: string;
    toUserId: string;
    status: 'pending' | 'accepted' | 'declined';
    timestamp: string;
}

export interface ChatMessage {
    id: string;
    groupId: string;
    authorId: string;
    content: string;
    timestamp: string;
}

// Notification Feature Types
export type NotificationType = 'like' | 'comment' | 'new_post' | 'friend_request' | 'friend_accept';

export interface Notification {
    id: string; // Unique identifier
    userId: string; // ID of the user who should receive this notification
    actorId: string; // ID of the user who performed the action
    type: NotificationType;
    entityId: string; // ID of the relevant entity (e.g., Post ID, User ID)
    timestamp: string; // ISO date string
    isRead: boolean;
}

// News Comment Feature Types
export interface NewsComment {
    id: string;
    articleId: string;
    authorId: string;
    content: string;
    timestamp: string;
    parentId: string | null; // For threaded replies
    likeUserIds: string[];
}