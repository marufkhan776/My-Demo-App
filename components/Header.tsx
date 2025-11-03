
import React, { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { CommunityUser } from '../types';

interface HeaderProps {
    siteName: string;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    isMobileMenuOpen: boolean;
    onMobileMenuToggle: () => void;
    onSearch: (query: string) => void;
    onGoHome: () => void;
    currentUser: CommunityUser | null;
    onLoginClick: () => void;
    onLogout: () => void;
    onNavigate: (path: string) => void;
    unreadNotificationCount: number;
    onToggleNotificationPanel: () => void;
    unreadFriendRequestCount: number;
    onToggleFriendRequestPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    siteName, theme, toggleTheme, isMobileMenuOpen, onMobileMenuToggle, 
    onSearch, onGoHome, currentUser, onLoginClick, onLogout, onNavigate,
    unreadNotificationCount, onToggleNotificationPanel,
    unreadFriendRequestCount, onToggleFriendRequestPanel
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearch(searchQuery.trim());
            setIsSearchOpen(false);
        }
    };
    
    const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setSearchQuery(''); 
        onGoHome();
    };
    
    const toggleSearch = () => {
        setIsSearchOpen(prev => !prev);
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };

        if (isSearchOpen) {
            document.addEventListener('keydown', handleKeyDown);
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSearchOpen]);

    const SearchForm = ({ inOverlay }: { inOverlay?: boolean }) => (
        <form onSubmit={handleSearchSubmit} className={`relative w-full ${inOverlay ? 'max-w-3xl mx-auto' : ''}`}>
            <input
                ref={inOverlay ? searchInputRef : null}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="খবর খুঁজুন..."
                className="w-full pl-5 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                aria-label="Search for news"
            />
            <button
                type="submit"
                aria-label="Submit search"
                className="absolute right-0 top-0 h-full px-4 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-r-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
        </form>
    );

    return (
        <header className="border-b border-gray-200 dark:border-gray-700 relative">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    
                    {/* Left section: Logo */}
                    <div className="flex-shrink-0">
                        <a href="#/" onClick={handleLogoClick} className="flex items-center space-x-3" aria-label="Homepage">
                             <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                স
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-gray-100 hidden sm:block">{siteName}</h1>
                        </a>
                    </div>

                    {/* Right section: Controls */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleSearch}
                            className="hidden md:flex w-10 h-10 items-center justify-center rounded-full p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-red-500"
                            aria-label="Open search bar"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        
                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

                        {currentUser && (
                            <>
                            <div className="relative">
                                <button
                                    onClick={onToggleFriendRequestPanel}
                                    className="w-10 h-10 rounded-full p-2 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-red-500"
                                    aria-label={`View friend requests (${unreadFriendRequestCount} pending)`}
                                >
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                                </button>
                                {unreadFriendRequestCount > 0 && (
                                    <span className="absolute top-0 right-0 block h-5 w-5 min-w-[20px] rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center transform translate-x-1/4 -translate-y-1/4 ring-2 ring-white dark:ring-gray-800">
                                        {unreadFriendRequestCount}
                                    </span>
                                )}
                            </div>
                             <div className="relative">
                                <button
                                    onClick={onToggleNotificationPanel}
                                    className="w-10 h-10 rounded-full p-2 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-red-500"
                                    aria-label={`View notifications (${unreadNotificationCount} unread)`}
                                >
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                </button>
                                {unreadNotificationCount > 0 && (
                                    <span className="absolute top-0 right-0 block h-5 w-5 min-w-[20px] rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center transform translate-x-1/4 -translate-y-1/4 ring-2 ring-white dark:ring-gray-800">
                                        {unreadNotificationCount}
                                    </span>
                                )}
                            </div>
                            </>
                        )}

                        {/* User Auth Section */}
                        <div className="border-l border-gray-200 dark:border-gray-700 pl-2 ml-2">
                            {currentUser ? (
                                <div className="relative" ref={profileMenuRef}>
                                    <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center space-x-2">
                                        <img src={currentUser.profilePicture} alt={currentUser.username} className="w-9 h-9 rounded-full object-cover" />
                                        <span className="hidden lg:inline font-semibold text-sm">{currentUser.username}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hidden lg:inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                    {isProfileMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                                            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">স্বাগতম, <strong>{currentUser.username}</strong></div>
                                            <div className="border-t border-gray-200 dark:border-gray-700"></div>
                                            <button onClick={() => { onNavigate(`#/profile/${currentUser.id}`); setIsProfileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">আমার প্রোফাইল</button>
                                            <button onClick={() => { onNavigate('#/read-later'); setIsProfileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">পড়া তালিকা</button>
                                            <div className="border-t border-gray-200 dark:border-gray-700"></div>
                                            <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">লগআউট</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button onClick={onLoginClick} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300 text-sm">
                                    লগইন / রেজিস্টার
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Icon */}
                        <div className="md:hidden">
                            <button 
                                className="p-2 rounded-md text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                                onClick={onMobileMenuToggle}
                                aria-label="Toggle categories menu"
                                aria-expanded={isMobileMenuOpen}
                            >
                                <div className="w-6 h-6 flex flex-col justify-around items-center">
                                    <span className={`block w-6 h-0.5 bg-current transform transition duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-[5px]' : ''}`}></span>
                                    <span className={`block w-6 h-0.5 bg-current transition duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                                    <span className={`block w-6 h-0.5 bg-current transform transition duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`}></span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Search Overlay */}
            <div 
                className={`absolute top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out md:flex hidden items-center ${isSearchOpen ? 'translate-y-0' : '-translate-y-full'}`}
                aria-hidden={!isSearchOpen}
            >
                <div className="container mx-auto px-4 py-3 flex items-center gap-4">
                    <div className="flex-grow">
                        <SearchForm inOverlay={true} />
                    </div>
                    <button onClick={toggleSearch} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" aria-label="Close search bar">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                         </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};