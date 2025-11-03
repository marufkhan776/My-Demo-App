
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Article, CommunityUser } from '../types';
import { CommentSection } from './comments/CommentSection';
import { ShareToFeedModal } from './community/ShareToFeedModal';

interface ArticleModalProps {
    article: Article;
    allArticles: Article[];
    onClose: () => void;
    onSelectArticle: (article: Article) => void;
    currentUser: CommunityUser | null;
    onLoginClick: () => void;
    onToggleBookmark: (articleId: string) => void;
}

const SocialShareButton: React.FC<{ onClick: () => void; 'aria-label': string; children: React.ReactNode }> = ({ onClick, 'aria-label': ariaLabel, children }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-transform duration-200 hover:scale-110"
    >
        {children}
    </button>
);

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, allArticles, onClose, onSelectArticle, currentUser, onLoginClick, onToggleBookmark }) => {
    const [copied, setCopied] = useState(false);
    const [isShareToFeedModalOpen, setIsShareToFeedModalOpen] = useState(false);
    const modalContentRef = useRef<HTMLDivElement>(null);
    const isBookmarked = currentUser?.bookmarkedArticleIds?.includes(article.id) ?? false;
    const [scrollProgress, setScrollProgress] = useState(0);

    const handleScroll = useCallback(() => {
        if (modalContentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = modalContentRef.current;
            const scrollableHeight = scrollHeight - clientHeight;
            if (scrollableHeight > 0) {
                const progress = (scrollTop / scrollableHeight) * 100;
                setScrollProgress(progress);
            } else {
                setScrollProgress(100); // Content is not scrollable, show as 100%
            }
        }
    }, []);

    useEffect(() => {
        const currentModalContent = modalContentRef.current;
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'hidden';
        currentModalContent?.addEventListener('scroll', handleScroll);
        
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'auto';
            currentModalContent?.removeEventListener('scroll', handleScroll);
        };
    }, [onClose, handleScroll]);

    useEffect(() => {
        // Scroll to top and reset progress when article changes
        if (modalContentRef.current) {
            modalContentRef.current.scrollTop = 0;
            setScrollProgress(0);
            // Recalculate progress for new content after DOM update
            setTimeout(handleScroll, 50); 
        }
    }, [article, handleScroll]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleShare = (platform: 'facebook' | 'twitter' | 'linkedin') => {
        const pageUrl = window.location.origin;
        const shareTextEncoded = encodeURIComponent(article.headline);
        const pageUrlEncoded = encodeURIComponent(pageUrl);
        let url = '';

        if (platform === 'facebook') {
            url = `https://www.facebook.com/sharer/sharer.php?u=${pageUrlEncoded}&quote=${shareTextEncoded}`;
        } else if (platform === 'twitter') {
            url = `https://twitter.com/intent/tweet?url=${pageUrlEncoded}&text=${shareTextEncoded}`;
        } else if (platform === 'linkedin') {
            const summaryEncoded = encodeURIComponent(article.summary);
            url = `https://www.linkedin.com/shareArticle?mini=true&url=${pageUrlEncoded}&title=${shareTextEncoded}&summary=${summaryEncoded}`;
        }
        
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.origin).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    const relatedArticles = allArticles
        .filter(a => a.id !== article.id && a.category === article.category)
        .slice(0, 3);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up transition-colors duration-300">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{article.headline}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-200 transition text-3xl">&times;</button>
                </div>
                
                {/* Reading Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 flex-shrink-0">
                    <div 
                        className="bg-red-600 h-1 transition-all duration-100 ease-linear" 
                        style={{ width: `${scrollProgress}%` }}
                        role="progressbar"
                        aria-label="Reading progress"
                        aria-valuenow={Math.round(scrollProgress)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    ></div>
                </div>

                <div className="p-6 overflow-y-auto" ref={modalContentRef}>
                    <div className="w-full h-96 rounded-lg overflow-hidden mb-6">
                         <img src={article.imageUrl} alt={article.headline} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                         <div className="flex items-center space-x-4">
                            <span className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 px-3 py-1 rounded-full font-semibold">{article.category}</span>
                            <span>{article.publishedDate}</span>
                        </div>
                         <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            {currentUser && (
                                <button
                                    onClick={() => onToggleBookmark(article.id)}
                                    aria-label={isBookmarked ? "Saved for later" : "Save for later"}
                                    className={`flex items-center gap-2 font-semibold transition-colors duration-200 ${isBookmarked ? 'text-red-600' : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'}`}
                                >
                                    {isBookmarked ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.125L5 18V4z" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                    )}
                                    <span>{isBookmarked ? 'সংরক্ষিত' : 'পরে পড়ুন'}</span>
                                </button>
                            )}
                            <span className="font-semibold text-gray-600 dark:text-gray-300 border-l border-gray-300 dark:border-gray-600 pl-4">শেয়ার করুন:</span>
                            <div className="flex items-center space-x-4">
                                <SocialShareButton onClick={() => handleShare('facebook')} aria-label="Share on Facebook">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                                </SocialShareButton>
                                 <SocialShareButton onClick={() => handleShare('twitter')} aria-label="Share on Twitter">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                </SocialShareButton>
                                <SocialShareButton onClick={() => handleShare('linkedin')} aria-label="Share on LinkedIn">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" /></svg>
                                </SocialShareButton>
                                <SocialShareButton onClick={handleCopyLink} aria-label="Copy link">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </SocialShareButton>
                                {copied && <span className="text-sm text-green-500 animate-fade-out">লিঙ্ক কপি হয়েছে!</span>}
                            </div>
                            {currentUser && (
                                <div className="border-l border-gray-300 dark:border-gray-600 pl-4">
                                    <button
                                        onClick={() => setIsShareToFeedModalOpen(true)}
                                        aria-label="Share to Community Feed"
                                        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 font-semibold"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                                        <span>ফিডে শেয়ার করুন</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {article.fullStory.split('\\n').map((paragraph, index) => (
                           <p key={index}>{paragraph}</p>
                        ))}
                    </div>

                    {relatedArticles.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">আরও পড়ুন</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {relatedArticles.map(related => (
                                    <div 
                                        key={related.id}
                                        className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
                                        onClick={() => onSelectArticle(related)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectArticle(related); }}
                                        aria-label={`Read more about ${related.headline}`}
                                    >
                                        <div className="w-full h-40">
                                            <img src={related.imageUrl} alt={related.headline} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-4 flex flex-col flex-grow">
                                            <h4 className="text-md font-bold text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300 line-clamp-3">{related.headline}</h4>
                                            <div className="mt-auto pt-2 text-xs text-gray-500 dark:text-gray-400">
                                                <span>{related.publishedDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <CommentSection 
                            articleId={article.id}
                            currentUser={currentUser}
                            onLoginClick={onLoginClick}
                        />
                    </div>
                </div>
                 <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 text-right">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300">
                        বন্ধ করুন
                    </button>
                </div>
            </div>
            {isShareToFeedModalOpen && currentUser && (
                <ShareToFeedModal
                    article={article}
                    currentUser={currentUser}
                    onClose={() => setIsShareToFeedModalOpen(false)}
                    onPostCreated={() => {
                        setIsShareToFeedModalOpen(false);
                    }}
                />
            )}
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
                @keyframes fade-out {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                .animate-fade-out {
                    animation: fade-out 2s 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
