import { GoogleGenAI } from "@google/genai";
import { CommunityUser, Group, Post, Comment, FriendRequest, ChatMessage } from '../types';
import { notificationService } from './notificationService';

// Initialize Gemini API for AI chat responses
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Mock password hashing for demo. In a real app, use a library like bcrypt.
const simpleHash = (s: string) => `hashed_${s}`;

const USERS_KEY = 'communityUsers';
const GROUPS_KEY = 'communityGroups';
const POSTS_KEY = 'communityPosts';
const FRIEND_REQUESTS_KEY = 'communityFriendRequests';
const CHAT_MESSAGES_KEY = 'communityChatMessages';
const CURRENT_USER_KEY = 'currentCommunityUser';

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


// Initialize with some default data if storage is empty
const initDefaultData = () => {
    let users = getFromStorage<CommunityUser[]>(USERS_KEY, []);
    if (users.length === 0) {
        // Create a default user
        const defaultUser: CommunityUser = {
            id: 'user_1',
            username: 'প্রথম ব্যবহারকারী',
            passwordHash: simpleHash('pass123'),
            profilePicture: 'https://i.pravatar.cc/150?u=user_1',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
            bio: 'সর্বশেষ খবর এবং গঠনমূলক আলোচনায় আগ্রহী। বাংলা সংবাদ কমিউনিটির একজন সক্রিয় সদস্য।',
            coverPhoto: 'https://source.unsplash.com/1600x900/?bangladesh,landscape',
            friendIds: ['user_2'],
            bookmarkedArticleIds: [],
        };
         const anotherUser: CommunityUser = {
            id: 'user_2',
            username: 'দ্বিতীয় ব্যবহারকারী',
            passwordHash: simpleHash('pass456'),
            profilePicture: 'https://i.pravatar.cc/150?u=user_2',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
            bio: 'খেলাধুলা এবং প্রযুক্তি আমার আগ্রহের বিষয়। নতুন মানুষের সাথে পরিচিত হতে ভালোবাসি।',
            coverPhoto: 'https://source.unsplash.com/1600x900/?tech,abstract',
            friendIds: ['user_1'],
            bookmarkedArticleIds: [],
        };
        const thirdUser: CommunityUser = {
            id: 'user_3',
            username: 'তৃতীয় ব্যবহারকারী',
            passwordHash: simpleHash('pass789'),
            profilePicture: 'https://i.pravatar.cc/150?u=user_3',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
            bio: 'আন্তর্জাতিক রাজনীতি এবং অর্থনীতি নিয়ে আলোচনা করতে পছন্দ করি।',
            coverPhoto: 'https://source.unsplash.com/1600x900/?city,night',
            friendIds: [],
            bookmarkedArticleIds: [],
        };
        const aiUser: CommunityUser = {
            id: 'user_ai',
            username: 'AI সহকারী', // AI Assistant
            passwordHash: simpleHash(`ai_${Date.now()}`), // Not login-able
            profilePicture: 'https://i.ibb.co/7j2m1g4/ai-bot-icon.png',
            createdAt: new Date().toISOString(),
            bio: 'আমি একটি বন্ধুত্বপূর্ণ এআই সহকারী, এখানে সাহায্য করার জন্য আছি!',
            coverPhoto: 'https://source.unsplash.com/1600x900/?abstract,network',
            friendIds: [],
            bookmarkedArticleIds: [],
        };
        users = [defaultUser, anotherUser, thirdUser, aiUser];
        saveToStorage(USERS_KEY, users);

        const groups = getFromStorage<Group[]>(GROUPS_KEY, []);
        if (groups.length === 0) {
            // Create default groups, ensuring AI is a member of all
            const defaultGroups: Group[] = [
                { id: 'group_1', name: 'সাধারণ আলোচনা', description: 'সবকিছু নিয়ে আলোচনার জন্য একটি জায়গা।', creatorId: 'user_1', memberIds: ['user_1', 'user_2', 'user_3', 'user_ai'] },
                { id: 'group_2', name: 'খেলাধুলা কর্নার', description: 'ক্রিকেট, ফুটবল এবং অন্যান্য খেলা নিয়ে আড্ডা।', creatorId: 'user_1', memberIds: ['user_1', 'user_3', 'user_ai'] },
                { id: 'group_3', name: 'প্রযুক্তি জগৎ', description: 'সর্বশেষ গ্যাজেট, সফটওয়্যার এবং কৃত্রিম বুদ্ধিমত্তা নিয়ে আলোচনা করুন।', creatorId: 'user_2', memberIds: ['user_1', 'user_2', 'user_ai'] },
                { id: 'group_4', name: 'বিনোদন জংশন', description: 'চলচ্চিত্র, সঙ্গীত, এবং তারকাদের জগতের সব খবর ও আড্ডা।', creatorId: 'user_1', memberIds: ['user_1', 'user_2', 'user_ai'] },
                { id: 'group_5', name: 'অর্থনীতি ও ব্যবসা', description: 'শেয়ারবাজার, ব্যাংকিং এবং বাণিজ্য জগতের বিশ্লেষণ ও মতামত।', creatorId: 'user_3', memberIds: ['user_1', 'user_3', 'user_ai'] },
                { id: 'group_6', name: 'স্বাস্থ্য ও জীবনযাপন', description: 'স্বাস্থ্যকর জীবন, ভ্রমণ এবং ফ্যাশন নিয়ে টিপস ও আলোচনা।', creatorId: 'user_2', memberIds: ['user_1', 'user_2', 'user_ai'] }
            ];
            saveToStorage(GROUPS_KEY, defaultGroups);

            const posts = getFromStorage<Post[]>(POSTS_KEY, []);
            if (posts.length === 0) {
                // Create default posts
                const defaultPosts: Post[] = [
                    { id: 'post_1', groupId: 'group_1', authorId: 'user_1', content: 'এই নতুন কমিউনিটি ফিচারে আপনাদের সবাইকে স্বাগতম! আশা করি আপনাদের ভালো লাগবে।', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), comments: [
                        { id: `comment_${Date.now() - 1000 * 60 * 2}`, postId: 'post_1', authorId: 'user_2', content: 'দারুণ উদ্যোগ! কমিউনিটি আরো সক্রিয় হবে আশা করি।', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() }
                    ], likeUserIds: ['user_2', 'user_3'] },
                    { id: 'post_2', groupId: 'group_2', authorId: 'user_3', content: 'আজকের খেলা কে দেখেছে? অসাধারণ একটি ম্যাচ ছিল!', timestamp: new Date().toISOString(), comments: [], likeUserIds: [] }
                ];
                saveToStorage(POSTS_KEY, defaultPosts);
            }

            const chatMessages = getFromStorage<ChatMessage[]>(CHAT_MESSAGES_KEY, []);
            if(chatMessages.length === 0) {
                 const defaultMessages: ChatMessage[] = [
                    { id: `chat_${Date.now()-2000}`, groupId: 'group_1', authorId: 'user_1', content: 'হ্যালো সবাই, চ্যাট ফিচারটি পরীক্ষা করার জন্য এটি প্রথম বার্তা।', timestamp: new Date(Date.now() - 2000).toISOString() },
                    { id: `chat_${Date.now()-1000}`, groupId: 'group_1', authorId: 'user_2', content: 'দারুণ! এখন আমরা এখানে লাইভ কথা বলতে পারব।', timestamp: new Date(Date.now() - 1000).toISOString() },
                    { id: `chat_${Date.now()}`, groupId: 'group_1', authorId: 'user_ai', content: 'অবশ্যই! আমি সাহায্য করার জন্য এখানে আছি। শুধু আমাকে @AI সহকারী লিখে প্রশ্ন করুন।', timestamp: new Date().toISOString() },
                ];
                saveToStorage(CHAT_MESSAGES_KEY, defaultMessages);
            }
        }
    } else {
        // Migration for existing users who might not have the new properties
        const migratedUsers = users.map(u => ({ 
            ...u, 
            friendIds: u.friendIds || [],
            bookmarkedArticleIds: u.bookmarkedArticleIds || [],
        }));
        saveToStorage(USERS_KEY, migratedUsers);

        // --- Migration to add AI to all existing groups ---
        const allGroups = getFromStorage<Group[]>(GROUPS_KEY, []);
        if (allGroups.length > 0 && users.some(u => u.id === 'user_ai')) {
            const migratedGroups = allGroups.map(group => {
                if (!group.memberIds.includes('user_ai')) {
                    group.memberIds.push('user_ai');
                }
                return group;
            });
            saveToStorage(GROUPS_KEY, migratedGroups);
        }
    }
};

initDefaultData();

export const communityService = {
    // --- User Management ---
    register(username: string, password: string): CommunityUser | null {
        const users = getFromStorage<CommunityUser[]>(USERS_KEY, []);
        if (users.find(u => u.username === username)) {
            return null; // Username already exists
        }
        const newUser: CommunityUser = {
            id: `user_${Date.now()}`,
            username,
            passwordHash: simpleHash(password),
            profilePicture: `https://i.pravatar.cc/150?u=${`user_${Date.now()}`}`,
            createdAt: new Date().toISOString(),
            friendIds: [],
            bookmarkedArticleIds: [],
        };
        users.push(newUser);
        saveToStorage(USERS_KEY, users);
        return newUser;
    },

    login(username: string, password: string): CommunityUser | null {
        const users = getFromStorage<CommunityUser[]>(USERS_KEY, []);
        const user = users.find(u => u.username === username && u.passwordHash === simpleHash(password));
        if (user) {
            saveToStorage(CURRENT_USER_KEY, user);
            return user;
        }
        return null;
    },

    logout(): void {
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    getCurrentUser(): CommunityUser | null {
        return getFromStorage<CommunityUser | null>(CURRENT_USER_KEY, null);
    },

    getUserById(userId: string): CommunityUser | undefined {
        const users = getFromStorage<CommunityUser[]>(USERS_KEY, []);
        return users.find(u => u.id === userId);
    },
    
    getAllUsers(): CommunityUser[] {
        return getFromStorage<CommunityUser[]>(USERS_KEY, []);
    },

    updateUserProfile(userId: string, updates: Partial<Pick<CommunityUser, 'username' | 'profilePicture' | 'bio' | 'coverPhoto'>>): CommunityUser {
        const users = getFromStorage<CommunityUser[]>(USERS_KEY, []);
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            // Check for username uniqueness if it's being changed
            if (updates.username && users.some(u => u.username === updates.username && u.id !== userId)) {
                throw new Error("এই ব্যবহারকারীর নাম ইতিমধ্যে ব্যবহৃত হয়েছে।");
            }

            const updatedUser = { ...users[userIndex], ...updates };
            users[userIndex] = updatedUser;
            saveToStorage(USERS_KEY, users);

            // If the updated user is the current user, update their session storage too
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                saveToStorage(CURRENT_USER_KEY, updatedUser);
            }
            return updatedUser;
        }
        throw new Error("User not found.");
    },
    
    getUserStats(userId: string): { totalLikes: number; totalComments: number } {
        const allPosts = getFromStorage<Post[]>(POSTS_KEY, []);
        let totalLikes = 0;
        let totalComments = 0;

        allPosts.forEach(post => {
            if (post.authorId === userId) {
                totalLikes += post.likeUserIds.length;
                totalComments += post.comments.length;
            }
        });

        return { totalLikes, totalComments };
    },

    // --- Bookmark Management ---
    toggleBookmark(userId: string, articleId: string): CommunityUser | null {
        const users = getFromStorage<CommunityUser[]>(USERS_KEY, []);
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) return null;

        const user = users[userIndex];
        user.bookmarkedArticleIds = user.bookmarkedArticleIds || [];

        const articleIndex = user.bookmarkedArticleIds.indexOf(articleId);
        if (articleIndex > -1) {
            user.bookmarkedArticleIds.splice(articleIndex, 1); // Remove if exists
        } else {
            user.bookmarkedArticleIds.push(articleId); // Add if not
        }

        users[userIndex] = user;
        saveToStorage(USERS_KEY, users);

        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            saveToStorage(CURRENT_USER_KEY, user);
        }
        return user;
    },

    // --- Friend Management ---
    sendFriendRequest(fromUserId: string, toUserId: string): void {
        const requests = getFromStorage<FriendRequest[]>(FRIEND_REQUESTS_KEY, []);
        const existingRequest = requests.find(r =>
            (r.fromUserId === fromUserId && r.toUserId === toUserId) ||
            (r.fromUserId === toUserId && r.toUserId === fromUserId)
        );
        if (existingRequest && existingRequest.status !== 'declined') {
            return; // Request already exists or is pending/accepted
        }
        
        // If a declined request exists, reuse it, otherwise create new
        if (existingRequest && existingRequest.status === 'declined') {
             existingRequest.status = 'pending';
             existingRequest.fromUserId = fromUserId;
             existingRequest.toUserId = toUserId;
             existingRequest.timestamp = new Date().toISOString();
        } else {
             const newRequest: FriendRequest = {
                id: `fr_${Date.now()}`,
                fromUserId,
                toUserId,
                status: 'pending',
                timestamp: new Date().toISOString(),
            };
            requests.push(newRequest);
        }

        saveToStorage(FRIEND_REQUESTS_KEY, requests);
        notificationService.create({ userId: toUserId, actorId: fromUserId, type: 'friend_request', entityId: fromUserId });
    },
    
    getPendingFriendRequestsForUser(userId: string): FriendRequest[] {
        const requests = getFromStorage<FriendRequest[]>(FRIEND_REQUESTS_KEY, []);
        return requests.filter(r => r.toUserId === userId && r.status === 'pending')
                       .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    respondToFriendRequest(requestId: string, response: 'accepted' | 'declined'): void {
        const requests = getFromStorage<FriendRequest[]>(FRIEND_REQUESTS_KEY, []);
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        request.status = response;

        if (response === 'accepted') {
            const users = getFromStorage<CommunityUser[]>(USERS_KEY, []);
            const fromUser = users.find(u => u.id === request.fromUserId);
            const toUser = users.find(u => u.id === request.toUserId);

            if (fromUser && toUser) {
                if (!fromUser.friendIds.includes(toUser.id)) fromUser.friendIds.push(toUser.id);
                if (!toUser.friendIds.includes(fromUser.id)) toUser.friendIds.push(fromUser.id);
                saveToStorage(USERS_KEY, users);
                notificationService.create({ userId: fromUser.id, actorId: toUser.id, type: 'friend_accept', entityId: toUser.id });
            }
        }
        
        saveToStorage(FRIEND_REQUESTS_KEY, requests);
    },
    
    getFriendshipStatus(currentUserId: string, profileUserId: string): 'friends' | 'request_sent' | 'request_received' | 'not_friends' {
        const currentUser = this.getUserById(currentUserId);
        if (currentUser?.friendIds.includes(profileUserId)) {
            return 'friends';
        }

        const requests = getFromStorage<FriendRequest[]>(FRIEND_REQUESTS_KEY, []);
        const pendingRequest = requests.find(r => r.status === 'pending' && 
            ((r.fromUserId === currentUserId && r.toUserId === profileUserId) || 
             (r.fromUserId === profileUserId && r.toUserId === currentUserId))
        );

        if (pendingRequest) {
            return pendingRequest.fromUserId === currentUserId ? 'request_sent' : 'request_received';
        }

        return 'not_friends';
    },

    removeFriend(userId1: string, userId2: string): void {
        const users = getFromStorage<CommunityUser[]>(USERS_KEY, []);
        const user1 = users.find(u => u.id === userId1);
        const user2 = users.find(u => u.id === userId2);

        if (user1 && user2) {
            user1.friendIds = user1.friendIds.filter(id => id !== userId2);
            user2.friendIds = user2.friendIds.filter(id => id !== userId1);
            saveToStorage(USERS_KEY, users);
        }

        // Optional: Update the request status to declined or remove it
        const requests = getFromStorage<FriendRequest[]>(FRIEND_REQUESTS_KEY, []);
        const request = requests.find(r => (r.fromUserId === userId1 && r.toUserId === userId2) || (r.fromUserId === userId2 && r.toUserId === userId1));
        if (request) {
            request.status = 'declined'; // So they can re-add later
            saveToStorage(FRIEND_REQUESTS_KEY, requests);
        }
    },

    getFriendsForUser(userId: string): CommunityUser[] {
        const user = this.getUserById(userId);
        if (!user) return [];
        return this.getUsersByIds(user.friendIds);
    },

    // --- Group Management ---
    createGroup(name: string, description: string, creator: CommunityUser): Group {
        const groups = getFromStorage<Group[]>(GROUPS_KEY, []);
        const newGroup: Group = {
            id: `group_${Date.now()}`,
            name,
            description,
            creatorId: creator.id,
            // Automatically add the creator and the AI assistant to the new group
            memberIds: [...new Set([creator.id, 'user_ai'])]
        };
        groups.push(newGroup);
        saveToStorage(GROUPS_KEY, groups);
        return newGroup;
    },

    getGroups(): Group[] {
        return getFromStorage<Group[]>(GROUPS_KEY, []);
    },

    getGroupById(groupId: string): Group | undefined {
        const groups = getFromStorage<Group[]>(GROUPS_KEY, []);
        return groups.find(g => g.id === groupId);
    },
    
    getGroupsForUser(userId: string): Group[] {
        const allGroups = this.getGroups();
        return allGroups.filter(g => g.memberIds.includes(userId));
    },

    joinGroup(groupId: string, userId: string): void {
        const groups = getFromStorage<Group[]>(GROUPS_KEY, []);
        const group = groups.find(g => g.id === groupId);
        if (group && !group.memberIds.includes(userId)) {
            group.memberIds.push(userId);
            saveToStorage(GROUPS_KEY, groups);
        }
    },
    
    // --- Post Management ---
    getPostsForGroup(groupId: string): Post[] {
        const allPosts = getFromStorage<Post[]>(POSTS_KEY, []);
        return allPosts.filter(p => p.groupId === groupId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    
    getFeedForUser(userId: string): Post[] {
        const userGroups = this.getGroupsForUser(userId).map(g => g.id);
        if (userGroups.length === 0) return [];
        
        const allPosts = getFromStorage<Post[]>(POSTS_KEY, []);
        return allPosts
            .filter(p => userGroups.includes(p.groupId))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    createPost(
        groupId: string,
        authorId: string,
        content: string,
        options?: { imageUrl?: string; sharedArticleId?: string }
    ): Post {
        const posts = getFromStorage<Post[]>(POSTS_KEY, []);
        const newPost: Post = {
            id: `post_${Date.now()}`,
            groupId,
            authorId,
            content,
            imageUrl: options?.imageUrl,
            sharedArticleId: options?.sharedArticleId,
            timestamp: new Date().toISOString(),
            comments: [],
            likeUserIds: []
        };
        posts.unshift(newPost); // Add to beginning for chronological order
        saveToStorage(POSTS_KEY, posts);

        // Create notifications for other group members
        const group = this.getGroupById(groupId);
        if (group) {
            group.memberIds.forEach(memberId => {
                if (memberId !== authorId) { // Don't notify the author
                    notificationService.create({
                        userId: memberId,
                        actorId: authorId,
                        type: 'new_post',
                        entityId: newPost.id,
                    });
                }
            });
        }

        return newPost;
    },

    updatePost(postId: string, newContent: string): void {
        const posts = getFromStorage<Post[]>(POSTS_KEY, []);
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.content = newContent;
            saveToStorage(POSTS_KEY, posts);
        }
    },

    deletePost(postId: string): void {
        let posts = getFromStorage<Post[]>(POSTS_KEY, []);
        posts = posts.filter(p => p.id !== postId);
        saveToStorage(POSTS_KEY, posts);
    },

    addCommentToPost(postId: string, authorId: string, content: string): void {
        const posts = getFromStorage<Post[]>(POSTS_KEY, []);
        const post = posts.find(p => p.id === postId);
        if (post) {
            const newComment: Comment = {
                id: `comment_${Date.now()}`,
                postId,
                authorId,
                content,
                timestamp: new Date().toISOString()
            };
            post.comments.push(newComment);
            saveToStorage(POSTS_KEY, posts);

            // Create notification for the post author
            if (post.authorId !== authorId) {
                notificationService.create({
                    userId: post.authorId,
                    actorId: authorId,
                    type: 'comment',
                    entityId: post.id,
                });
            }
        }
    },

    updateCommentOnPost(postId: string, commentId: string, newContent: string): void {
        const posts = getFromStorage<Post[]>(POSTS_KEY, []);
        const post = posts.find(p => p.id === postId);
        if (post) {
            const comment = post.comments.find(c => c.id === commentId);
            if (comment) {
                comment.content = newContent;
                saveToStorage(POSTS_KEY, posts);
            }
        }
    },

    deleteCommentOnPost(postId: string, commentId: string): void {
        const posts = getFromStorage<Post[]>(POSTS_KEY, []);
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.comments = post.comments.filter(c => c.id !== commentId);
            saveToStorage(POSTS_KEY, posts);
        }
    },
    
    getPostsByAuthor(authorId: string): Post[] {
        const allPosts = getFromStorage<Post[]>(POSTS_KEY, []);
        return allPosts
            .filter(p => p.authorId === authorId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    getUsersByIds(userIds: string[]): CommunityUser[] {
        const allUsers = this.getAllUsers();
        return userIds.map(id => allUsers.find(u => u.id === id)).filter((u): u is CommunityUser => !!u);
    },
    
    getPostById(postId: string): Post | undefined {
        const allPosts = getFromStorage<Post[]>(POSTS_KEY, []);
        return allPosts.find(p => p.id === postId);
    },

    toggleLikePost(postId: string, userId: string): void {
        const posts = getFromStorage<Post[]>(POSTS_KEY, []);
        const post = posts.find(p => p.id === postId);
        if (post) {
            const likeIndex = post.likeUserIds.indexOf(userId);
            if (likeIndex > -1) {
                // User has liked, so unlike
                post.likeUserIds.splice(likeIndex, 1);
            } else {
                // User has not liked, so like
                post.likeUserIds.push(userId);
                // Create notification for the post author, but not if they like their own post
                if (post.authorId !== userId) {
                    notificationService.create({
                        userId: post.authorId,
                        actorId: userId,
                        type: 'like',
                        entityId: post.id,
                    });
                }
            }
            saveToStorage(POSTS_KEY, posts);
        }
    },

    // --- Chat Management ---
    getChatMessagesForGroup(groupId: string): ChatMessage[] {
        const allMessages = getFromStorage<ChatMessage[]>(CHAT_MESSAGES_KEY, []);
        return allMessages
            .filter(m => m.groupId === groupId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    },

    sendChatMessage(groupId: string, authorId: string, content: string): ChatMessage {
        const messages = getFromStorage<ChatMessage[]>(CHAT_MESSAGES_KEY, []);
        const newMessage: ChatMessage = {
            id: `chat_${Date.now()}`,
            groupId,
            authorId,
            content,
            timestamp: new Date().toISOString(),
        };
        messages.push(newMessage);
        saveToStorage(CHAT_MESSAGES_KEY, messages);

        // --- AI Response Logic ---
        if (authorId !== 'user_ai' && content.includes('@AI সহকারী')) {
            setTimeout(async () => {
                try {
                    const userPrompt = content.replace('@AI সহকারী', '').trim();

                    const systemInstruction = `You are "AI সহকারী", a helpful and intelligent AI assistant in a Bangla news portal's group chat. Your primary function is to provide real-time news summaries using Google Search.
- When a user asks for news or information on a topic, use your search tool to find relevant, recent articles.
- Provide a concise summary of the findings in conversational Bengali.
- **Crucially, you MUST cite your sources.** After the summary, list the source URLs in a clear format under a heading like '**সূত্র:**' (Sources:). Format each source as a Markdown link: [Article Title](URL).
- If a user provides a URL and asks for a summary, you MUST explain that you cannot access external links for security reasons. Politely ask them to paste the text of the article for you to summarize instead. Do not attempt to search for the content of the URL.
- For general conversation, be friendly and helpful.`;
                    
                    const response = await ai.models.generateContent({
                        model: "gemini-2.5-flash",
                        contents: userPrompt,
                        config: {
                            systemInstruction: systemInstruction,
                            tools: [{googleSearch: {}}],
                        },
                    });

                    let aiResponseText = response.text;
                    
                    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
                    if (groundingChunks && groundingChunks.length > 0) {
                        const sources = groundingChunks
                            .map(chunk => chunk.web)
                            .filter(web => web && web.uri && web.uri.trim())
                            .map(web => `[${web.title || web.uri}](${web.uri})`);
                        
                        if (sources.length > 0) {
                            aiResponseText += `\n\n**সূত্র:**\n` + sources.join('\n');
                        }
                    }

                    if (aiResponseText) {
                        communityService.sendChatMessage(groupId, 'user_ai', aiResponseText);
                    }
                } catch (error) {
                    console.error("Error generating AI chat response:", error);
                    communityService.sendChatMessage(groupId, 'user_ai', 'দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না। একটি সমস্যা হয়েছে।');
                }
            }, 2000 + Math.random() * 2000); // Respond in 2-4 seconds
        }
        // --- End of AI Response Logic ---

        return newMessage;
    },
};