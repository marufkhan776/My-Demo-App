
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { NewsCard } from './components/NewsCard';
import { ArticleModal } from './components/ArticleModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Article, Category, PolicyKey, SiteSettings, CommunityUser } from './types';
import { NavigationBar } from './components/NavigationBar';
import { CATEGORIES_STRUCTURED } from './constants';
import { PolicyModal } from './components/PolicyModal';
import { POLICY_CONTENT } from './constants/policyContent';
import { Login } from './components/admin/Login';
import { AdminPanel } from './components/admin/AdminPanel';
import { authService } from './services/authService';
import { contentService } from './services/contentService';
import { generateNews } from './services/newsService';
import { communityService } from './services/communityService';
import { notificationService } from './services/notificationService';
import { UserAuthModal } from './components/community/UserAuthModal';
import { GroupsView } from './components/community/GroupsView';
import { GroupDetailView } from './components/community/GroupDetailView';
import { FeedView } from './components/community/FeedView';
import { ProfileView } from './components/community/ProfileView';
import { NotificationPanel } from './components/notifications/NotificationPanel';
import { FriendRequestPanel } from './components/community/FriendRequestPanel';
import { ReadLaterView } from './components/community/ReadLaterView';

const App: React.FC = () => {
    // Admin State
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(authService.isLoggedIn());
    
    // App State
    const [route, setRoute] = useState(window.location.hash || '#/');
    const [settings, setSettings] = useState<SiteSettings>(contentService.getSettings());
    const [articles, setArticles] = useState<Article[]>([]);
    const [isInitializing, setIsInitializing] = useState(true);
    const [initError, setInitError] = useState<string | null>(null);

    // Navigation and View State
    const navigateTo = (path: string) => {
        // window.location.hash = path; // This line causes a security error in some environments.
        setRoute(path); // We manage routing via state instead.
        window.scrollTo(0, 0);
    };
    
    useEffect(() => {
        const handleHashChange = () => {
            setRoute(window.location.hash || '#/');
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Public Site State
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<Category>('সব খবর');
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const [selectedPolicy, setSelectedPolicy] = useState<PolicyKey | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Community State
    const [currentUser, setCurrentUser] = useState<CommunityUser | null>(communityService.getCurrentUser());
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    // Notification & Friend Request State
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const [isFriendRequestPanelOpen, setIsFriendRequestPanelOpen] = useState(false);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const [unreadFriendRequestCount, setUnreadFriendRequestCount] = useState(0);
    const panelsRef = useRef<HTMLDivElement>(null);

    // Theme State
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined' && localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            return 'dark';
        }
        return 'light';
    });

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };
    
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);
    
    const handleGoHome = useCallback(() => {
        setSearchQuery('');
        setActiveCategory('সব খবর');
        navigateTo('#/');
    }, []);

    const handleSelectCategory = (category: Category) => {
        setSearchQuery('');
        setActiveCategory(category);
        navigateTo('#/');
    };
    
    const handleOpenPolicy = (policyKey: PolicyKey) => setSelectedPolicy(policyKey);
    const handleClosePolicy = () => setSelectedPolicy(null);

    const handleUserLogin = (user: CommunityUser) => {
        setCurrentUser(user);
        setIsAuthModalOpen(false);
    };

    const handleUserLogout = () => {
        communityService.logout();
        setCurrentUser(null);
        navigateTo('#/');
    };

    const handleLoadMore = async () => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);
        setError(null);
        try {
            const newArticles = await generateNews(6, activeCategory);
            if (newArticles && newArticles.length > 0) {
                newArticles.forEach(article => contentService.saveArticle(article));
                setArticles(contentService.getArticles());
            } else {
                setHasMore(false);
            }
        } catch (e) {
            console.error("Failed to load more articles:", e);
            setError(' আরও খবর লোড করতে ব্যর্থ হয়েছে।');
            setHasMore(false);
        } finally {
            setIsLoadingMore(false);
        }
    };
    
    const handleSelectArticle = (article: Article) => setSelectedArticle(article);
    const handleCloseArticleModal = () => setSelectedArticle(null);

    const refreshContent = () => {
        setSettings(contentService.getSettings());
        setArticles(contentService.getArticles());
    };

    const initializeApp = useCallback(async () => {
        setIsInitializing(true);
        setInitError(null);
        try {
            let currentArticles = contentService.getArticles();
            if (currentArticles.length === 0) {
                const initialArticles = await generateNews(25, 'সব খবর');
                if (!initialArticles || initialArticles.length === 0) {
                    throw new Error("AI মডেল কোনো খবর তৈরি করতে পারেনি। অনুগ্রহ করে আবার চেষ্টা করুন।");
                }
                initialArticles.forEach(article => contentService.saveArticle(article));
                currentArticles = contentService.getArticles();
            }
            setArticles(currentArticles);
        } catch (e: any) {
            console.error("Failed to seed initial articles:", e);
            setInitError(`প্রাথমিক খবর লোড করতে ব্যর্থ হয়েছে। এটি একটি অবৈধ API কী বা নেটওয়ার্ক সমস্যার কারণে হতে পারে। বিস্তারিত: ${String(e)}`);
        } finally {
            setIsInitializing(false);
        }
    }, []);

    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    const handleAdminLogin = () => {
        setIsAdminLoggedIn(true);
        navigateTo('#/admin');
    };

    const handleAdminLogout = () => {
        authService.logout();
        setIsAdminLoggedIn(false);
        navigateTo('#/');
    };

    // --- Read Later / Bookmark Logic ---
    const handleToggleBookmark = (articleId: string) => {
        if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
        }
        const updatedUser = communityService.toggleBookmark(currentUser.id, articleId);
        if (updatedUser) {
            setCurrentUser(updatedUser);
        }
    };

    // --- Notification & Friend Request Logic ---
    const refreshUnreadCounts = useCallback(() => {
        if (currentUser) {
            setUnreadNotificationCount(notificationService.getUnreadCountForUser(currentUser.id));
            setUnreadFriendRequestCount(communityService.getPendingFriendRequestsForUser(currentUser.id).length);
        } else {
            setUnreadNotificationCount(0);
            setUnreadFriendRequestCount(0);
        }
    }, [currentUser]);

    useEffect(() => {
        refreshUnreadCounts();
    }, [currentUser, route, refreshUnreadCounts]);

    const handleToggleNotificationPanel = () => {
        setIsFriendRequestPanelOpen(false); // Close other panel
        setIsNotificationPanelOpen(prev => !prev);
    };

    const handleToggleFriendRequestPanel = () => {
        setIsNotificationPanelOpen(false); // Close other panel
        setIsFriendRequestPanelOpen(prev => !prev);
    };

    const closeAllPanels = () => {
        setIsNotificationPanelOpen(false);
        setIsFriendRequestPanelOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelsRef.current && !panelsRef.current.contains(event.target as Node)) {
                closeAllPanels();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isInitializing) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"><LoadingSpinner /></div>;
    }

    if (initError && articles.length === 0) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4"><ErrorDisplay message={initError} onRetry={initializeApp} /></div>;
    }
    
    const renderView = () => {
        if (route.startsWith('#/admin')) {
            if (!isAdminLoggedIn) return <Login onLogin={handleAdminLogin} />;
            return <AdminPanel onLogout={handleAdminLogout} onContentUpdate={refreshContent} />;
        }
        
        if (route.startsWith('#/community/group/')) {
            const groupId = route.split('/')[3];
            return <GroupDetailView groupId={groupId} currentUser={currentUser} onNavigate={navigateTo} onSelectArticle={handleSelectArticle} />;
        }

        if (route.startsWith('#/profile/')) {
            const userId = route.split('/')[2];
            return <ProfileView userId={userId} currentUser={currentUser} onNavigate={navigateTo} onDataChange={refreshUnreadCounts} onSelectArticle={handleSelectArticle} />;
        }
        
        if (route.startsWith('#/feed')) {
            return <FeedView currentUser={currentUser} onLoginClick={() => setIsAuthModalOpen(true)} onNavigate={navigateTo} onSelectArticle={handleSelectArticle} />;
        }
        
        if (route.startsWith('#/read-later')) {
            return <ReadLaterView currentUser={currentUser} onLoginClick={() => setIsAuthModalOpen(true)} onSelectArticle={handleSelectArticle} onToggleBookmark={handleToggleBookmark} />;
        }

        if (route.startsWith('#/community')) {
            return <GroupsView currentUser={currentUser} onLoginClick={() => setIsAuthModalOpen(true)} onNavigate={navigateTo} />;
        }

        // Default view: News Portal
        const articlesToDisplay = searchQuery
            ? articles.filter(a =>
                a.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.fullStory.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : activeCategory === 'সব খবর'
                ? articles
                : articles.filter(a => a.category === activeCategory || CATEGORIES_STRUCTURED.find(c => c.name === activeCategory)?.subcategories?.includes(a.category));

        const topStory = articlesToDisplay.length > 0 ? articlesToDisplay[0] : null;
        const remainingStories = articlesToDisplay.slice(1);

        return (
            <main className="flex-grow container mx-auto px-4 py-8">
                {searchQuery && (
                    <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">'{searchQuery}' এর জন্য ফলাফল</h2>
                        <button onClick={() => setSearchQuery('')} className="mt-2 text-red-600 hover:underline font-semibold">অনুসন্ধান মুছুন</button>
                    </div>
                )}
                {error && <ErrorDisplay message={error} onRetry={handleLoadMore} />}
                {articlesToDisplay.length > 0 ? (
                    <>
                        {topStory && <HeroSection article={topStory} onReadMore={() => handleSelectArticle(topStory)} onToggleBookmark={handleToggleBookmark} currentUser={currentUser} />}
                        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {remainingStories.map((article) => (
                                <NewsCard key={article.id} article={article} onSelectArticle={() => handleSelectArticle(article)} onToggleBookmark={handleToggleBookmark} currentUser={currentUser}/>
                            ))}
                        </div>
                        {hasMore && !searchQuery && (
                            <div className="mt-12 text-center">
                                <button onClick={handleLoadMore} disabled={isLoadingMore} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition duration-300 disabled:bg-red-400 disabled:cursor-not-allowed">
                                    {isLoadingMore ? 'লোড হচ্ছে...' : 'আরও খবর লোড করুন'}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        <h2 className="text-2xl font-semibold">কোনো খবর পাওয়া যায়নি।</h2>
                        <p className="mt-2">{searchQuery ? 'আপনার অনুসন্ধানের সাথে মেলে এমন কোনো ফলাফল নেই।' : 'অন্য একটি বিভাগ চেষ্টা করুন।'}</p>
                    </div>
                )}
            </main>
        );
    };

    // Hide header/footer for admin login page
    if (route.startsWith('#/admin') && !isAdminLoggedIn) {
        return renderView();
    }
    
    return (
        <div className={`flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200`}>
            {!route.startsWith('#/admin') && (
                <>
                    <Header
                        siteName={settings.siteName}
                        theme={theme}
                        toggleTheme={toggleTheme}
                        isMobileMenuOpen={isMobileMenuOpen}
                        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        onSearch={(q) => { setSearchQuery(q); navigateTo('#/'); }}
                        onGoHome={handleGoHome}
                        currentUser={currentUser}
                        onLoginClick={() => setIsAuthModalOpen(true)}
                        onLogout={handleUserLogout}
                        onNavigate={navigateTo}
                        unreadNotificationCount={unreadNotificationCount}
                        onToggleNotificationPanel={handleToggleNotificationPanel}
                        unreadFriendRequestCount={unreadFriendRequestCount}
                        onToggleFriendRequestPanel={handleToggleFriendRequestPanel}
                    />
                    <NavigationBar
                        categories={CATEGORIES_STRUCTURED}
                        activeCategory={activeCategory}
                        onSelectCategory={handleSelectCategory}
                        isMobileMenuOpen={isMobileMenuOpen}
                        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
                        onSearch={(q) => { setSearchQuery(q); navigateTo('#/'); }}
                        onNavigate={navigateTo}
                        theme={theme}
                        toggleTheme={toggleTheme}
                        socialLinks={settings.socialLinks}
                    />
                </>
            )}

            <div className="flex-grow relative">
                <div ref={panelsRef} className="absolute top-0 right-0 z-40 p-4 w-full max-w-sm sm:w-96">
                    {isNotificationPanelOpen && currentUser && (
                        <NotificationPanel currentUser={currentUser} onClose={closeAllPanels} onNavigate={navigateTo} onDataChange={refreshUnreadCounts} />
                    )}
                    {isFriendRequestPanelOpen && currentUser && (
                        <FriendRequestPanel currentUser={currentUser} onClose={closeAllPanels} onNavigate={navigateTo} onDataChange={refreshUnreadCounts} />
                    )}
                </div>
                {renderView()}
            </div>
            
            {!route.startsWith('#/admin') && (
                 <Footer
                    onSelectCategory={handleSelectCategory}
                    onOpenPolicy={handleOpenPolicy}
                    socialLinks={settings.socialLinks}
                />
            )}

            {/* Global Modals */}
            {selectedArticle && <ArticleModal 
                article={selectedArticle} 
                allArticles={articles} 
                onClose={handleCloseArticleModal} 
                onSelectArticle={handleSelectArticle}
                currentUser={currentUser}
                onLoginClick={() => setIsAuthModalOpen(true)}
                onToggleBookmark={handleToggleBookmark}
            />}
            {selectedPolicy && <PolicyModal policy={POLICY_CONTENT[selectedPolicy]} onClose={handleClosePolicy} />}
            {isAuthModalOpen && <UserAuthModal onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={handleUserLogin} />}
        </div>
    );
};

export default App;