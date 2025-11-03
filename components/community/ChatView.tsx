import React, { useState, useEffect, useRef, useCallback } from 'react';
import { communityService } from '../../services/communityService';
import { ChatMessage, CommunityUser } from '../../types';

interface ChatViewProps {
    groupId: string;
    currentUser: CommunityUser | null;
}

const renderMessageContent = (content: string) => {
    // Regex to find markdown-style links: [text](url) and bold text: **text**
    const regex = /(\*\*.*?\*\*)|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
        // Push text before the match
        if (match.index > lastIndex) {
            parts.push(content.substring(lastIndex, match.index));
        }

        const [fullMatch, boldText, linkText, url] = match;
        
        if (boldText) {
             // Handle bold text
             parts.push(<strong>{boldText.substring(2, boldText.length - 2)}</strong>);
        } else if (linkText && url) {
            // Handle links
            parts.push(
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">
                    {linkText}
                </a>
            );
        }
        
        lastIndex = regex.lastIndex;
    }

    // Push remaining text
    if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
    }

    return parts.map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>);
};

const ChatMessageItem: React.FC<{ message: ChatMessage; isCurrentUser: boolean; author?: CommunityUser }> = ({ message, isCurrentUser, author }) => {
    
    const postDate = new Date(message.timestamp);
    const timeString = postDate.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' });

    const messageClasses = isCurrentUser 
        ? "bg-red-600 text-white rounded-l-xl rounded-br-xl" 
        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-r-xl rounded-bl-xl";
    
    const containerClasses = isCurrentUser ? "justify-end" : "justify-start";
    
    return (
        <div className={`flex items-end gap-2 ${containerClasses}`}>
            {!isCurrentUser && (
                <img src={author?.profilePicture} alt={author?.username} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            )}
            <div className={`max-w-xs md:max-w-md p-3 ${messageClasses}`}>
                {!isCurrentUser && <p className="font-bold text-sm mb-1 text-red-600 dark:text-red-400">{author?.username}</p>}
                <div className="text-sm whitespace-pre-wrap">{renderMessageContent(message.content)}</div>
                <p className={`text-xs mt-1 ${isCurrentUser ? 'text-red-200' : 'text-gray-500 dark:text-gray-400'} text-right`}>{timeString}</p>
            </div>
        </div>
    );
};


export const ChatView: React.FC<ChatViewProps> = ({ groupId, currentUser }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [authors, setAuthors] = useState<Record<string, CommunityUser>>({});
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const fetchMessages = useCallback(() => {
        const groupMessages = communityService.getChatMessagesForGroup(groupId);
        // Only update if there are new messages to avoid re-renders
        if (groupMessages.length !== messages.length || (groupMessages.length > 0 && messages.length > 0 && groupMessages[groupMessages.length-1].id !== messages[messages.length-1].id)) {
            setMessages(groupMessages);

            const authorIds = new Set(groupMessages.map(m => m.authorId));
            const fetchedAuthors = communityService.getUsersByIds(Array.from(authorIds));
            setAuthors(prev => {
                const newAuthors = { ...prev };
                fetchedAuthors.forEach(author => {
                    newAuthors[author.id] = author;
                });
                return newAuthors;
            });
        }
    }, [groupId, messages]);

    useEffect(() => {
        // Initial fetch
        fetchMessages();
        
        // Poll for new messages every 2 seconds to simulate real-time
        const interval = setInterval(fetchMessages, 2000);

        return () => clearInterval(interval);
    }, [fetchMessages]);

    useEffect(() => {
        // Auto-scroll to bottom
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;
        
        communityService.sendChatMessage(groupId, currentUser.id, newMessage.trim());
        setNewMessage('');
        // Immediately fetch to show the new message and trigger AI response logic
        setTimeout(() => fetchMessages(), 100);
    };

    if (!currentUser) {
        return <div className="text-center p-10">চ্যাট দেখতে লগইন করুন।</div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow max-w-3xl mx-auto flex flex-col h-[70vh]">
            <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map(msg => (
                    <ChatMessageItem
                        key={msg.id}
                        message={msg}
                        isCurrentUser={msg.authorId === currentUser.id}
                        author={authors[msg.authorId]}
                    />
                ))}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <textarea
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        placeholder="একটি বার্তা লিখুন..."
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                        rows={1}
                    />
                    <button type="submit" className="bg-red-600 text-white rounded-full p-2.5 hover:bg-red-700 transition-colors flex-shrink-0" aria-label="Send Message">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};
