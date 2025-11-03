import React, { useState, useEffect } from 'react';
import { Post, Group, CommunityUser } from '../../types';

interface SharePostModalProps {
    post: Post;
    group: Group;
    author: CommunityUser;
    onClose: () => void;
}

const socialPlatforms = [
    { name: 'Facebook', icon: <svg fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>, getUrl: (url: string, text: string) => `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}` },
    { name: 'Twitter', icon: <svg fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>, getUrl: (url: string, text: string) => `https://twitter.com/intent/tweet?url=${url}&text=${text}` },
    { name: 'LinkedIn', icon: <svg fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" /></svg>, getUrl: (url: string, text: string, title: string) => `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${text}` },
    { name: 'WhatsApp', icon: <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 20.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.83-1.26-4.38 0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42 1.56 1.56 2.42 3.62 2.42 5.82-1.04 4.55-4.74 8.24-9.24 8.24zm4.52-6.13c-.24-.13-1.44-.71-1.67-.79-.22-.08-.39-.13-.55.13-.16.26-.63.79-.77.95-.14.16-.28.18-.52.05-.24-.13-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.48.11-.11.24-.28.37-.42.12-.14.16-.24.25-.41.08-.17.04-.31-.02-.44s-.55-1.32-.75-1.81c-.2-.48-.41-.42-.55-.42h-.48c-.16 0-.41.05-.63.26-.22.21-.83.81-.83 1.97 0 1.16.85 2.28.97 2.44.12.16 1.67 2.55 4.04 3.56.57.24 1.02.38 1.37.48.57.17 1.09.15 1.5.09.46-.06 1.44-.59 1.64-1.15.2-.56.2-.95.14-1.05-.06-.11-.22-.17-.46-.29z"></path></svg>, getUrl: (url: string, text: string) => `https://api.whatsapp.com/send?text=${text} ${url}` },
    { name: 'Telegram', icon: <svg fill="currentColor" viewBox="0 0 24 24"><path d="M21.8,3.22a1.3,1.3,0,0,0-1.09-.53,1.42,1.42,0,0,0-.6.13L3,10.19a1.39,1.39,0,0,0-.49,2.32l4.23,2.06,2.06,4.23a1.39,1.39,0,0,0,2.32-.49L22.2,4.91A1.4,1.4,0,0,0,21.8,3.22Zm-4.52,2.8-6.7,6.79-3-1.45ZM9.67,17.15,8.22,14.1l6.7-6.79Z"/></svg>, getUrl: (url: string, text: string) => `https://t.me/share/url?url=${url}&text=${text}` }
];


export const SharePostModal: React.FC<SharePostModalProps> = ({ post, group, author, onClose }) => {
    const [activeTab, setActiveTab] = useState<'share' | 'embed' | 'qr'>('share');
    const [isLinkCopied, setIsLinkCopied] = useState(false);
    const [isEmbedCopied, setIsEmbedCopied] = useState(false);
    
    const postUrl = `${window.location.origin}#${`/community/group/${group.id}`}`;
    const shareText = encodeURIComponent(post.content.substring(0, 150) + (post.content.length > 150 ? '...' : ''));
    const shareTitle = encodeURIComponent(`${author.username} থেকে একটি পোস্ট`);

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };
    
    const handleSocialShare = (platform: typeof socialPlatforms[0]) => {
        const url = platform.getUrl(encodeURIComponent(postUrl), shareText, shareTitle);
        window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    };

    const handleCopy = (text: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }).catch(err => console.error('Failed to copy text: ', err));
    };
    
    const embedCode = `<iframe src="${postUrl}" width="100%" height="600" style="border:1px solid #ccc; border-radius: 8px;" title="${author.username}'s post in ${group.name}" allowfullscreen></iframe>`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(postUrl)}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={handleBackdropClick}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg animate-fade-in-up flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">পোস্ট শেয়ার করুন</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-200 transition text-3xl">&times;</button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2"><strong>{author.username}:</strong> {post.content}</p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 text-center mb-6">
                        {socialPlatforms.map(p => (
                            <button key={p.name} onClick={() => handleSocialShare(p)} className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors group">
                                <span className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                                    {p.icon}
                                </span>
                                <span className="text-xs font-semibold">{p.name}</span>
                            </button>
                        ))}
                    </div>
                    
                    <div className="relative mb-6">
                        <label htmlFor="post-link" className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 block">অথবা লিঙ্ক কপি করুন</label>
                        <input id="post-link" type="text" readOnly value={postUrl} className="w-full pl-3 pr-24 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm"/>
                        <button onClick={() => handleCopy(postUrl, setIsLinkCopied)} className={`absolute right-1 top-1/2 -translate-y-1/2 mt-3 h-8 px-4 font-semibold rounded-md text-sm transition-colors ${isLinkCopied ? 'bg-green-600 text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                            {isLinkCopied ? 'কপি হয়েছে!' : 'কপি'}
                        </button>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                            <button onClick={() => setActiveTab('embed')} className={`px-4 py-2 font-semibold ${activeTab === 'embed' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}>এম্বেড</button>
                            <button onClick={() => setActiveTab('qr')} className={`px-4 py-2 font-semibold ${activeTab === 'qr' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}>QR কোড</button>
                        </div>
                        {activeTab === 'embed' && (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">এই পোস্টটি আপনার ওয়েবসাইটে দেখাতে নিচের কোডটি কপি করুন।</p>
                                <div className="relative">
                                    <textarea readOnly value={embedCode} rows={4} className="w-full text-xs p-2 border rounded-lg bg-gray-100 dark:bg-gray-900/50 dark:border-gray-600 font-mono resize-none"></textarea>
                                    <button onClick={() => handleCopy(embedCode, setIsEmbedCopied)} className={`absolute right-2 top-2 h-8 px-3 font-semibold rounded-md text-sm transition-colors ${isEmbedCopied ? 'bg-green-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-700'}`}>
                                        {isEmbedCopied ? 'কপি হয়েছে!' : 'কপি'}
                                    </button>
                                </div>
                            </div>
                        )}
                        {activeTab === 'qr' && (
                            <div className="text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">মোবাইল দিয়ে লিঙ্কটি খুলতে এই QR কোডটি স্ক্যান করুন।</p>
                                <div className="inline-block p-2 bg-white rounded-md">
                                    <img src={qrCodeUrl} alt="Post QR Code" width="200" height="200"/>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
