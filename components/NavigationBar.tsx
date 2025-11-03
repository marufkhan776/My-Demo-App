
import React, { useState } from 'react';
import { Category, CategoryStructure, SiteSettings } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface NavigationBarProps {
    categories: CategoryStructure[];
    activeCategory: Category;
    onSelectCategory: (category: Category) => void;
    isMobileMenuOpen: boolean;
    onCloseMobileMenu: () => void;
    onSearch: (query: string) => void;
    onNavigate: (path: string) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    socialLinks: SiteSettings['socialLinks'];
}

const SocialIcon: React.FC<{ href: string; children: React.ReactNode; label: string }> = ({ href, children, label }) => (
    <a href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300">
        {children}
    </a>
);


const MobileSearchForm: React.FC<{ onSearch: (query: string) => void; onCloseMenu: () => void; }> = ({ onSearch, onCloseMenu }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery) {
            onSearch(trimmedQuery);
            onCloseMenu();
        }
    };

    return (
        <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="খবর খুঁজুন..."
                className="w-full pl-5 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-full bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
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
};

export const NavigationBar: React.FC<NavigationBarProps> = ({ categories, activeCategory, onSelectCategory, isMobileMenuOpen, onCloseMobileMenu, onSearch, onNavigate, theme, toggleTheme, socialLinks }) => {
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const handleCategoryClick = (category: Category) => {
        onSelectCategory(category);
        onCloseMobileMenu();
    };
    
    const toggleAccordion = (categoryName: string) => {
        setOpenAccordion(openAccordion === categoryName ? null : categoryName);
    };

    const navItems = categories.slice(0, 8); // Make space for community links
    
    const NavButton: React.FC<{ path: string; label: string; }> = ({ path, label }) => (
         <button
            onClick={() => onNavigate(path)}
            className="px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-300 outline-none text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 border-b-2 border-transparent"
        >
            {label}
        </button>
    );

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:block border-t border-gray-200 dark:border-gray-700">
                <div className="container mx-auto flex justify-center">
                    {navItems.map((cat) => (
                        <div key={cat.name} className="relative group">
                            <button
                                onClick={() => handleCategoryClick(cat.name)}
                                className={`px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-300 outline-none text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400
                                ${activeCategory === cat.name ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600' : 'border-b-2 border-transparent'}`}
                            >
                                {cat.name}
                            </button>
                            {cat.subcategories && (
                                <div className="absolute left-0 mt-0 w-56 bg-white dark:bg-gray-800 rounded-b-md shadow-xl z-50 hidden group-hover:block animate-fade-in-down ring-1 ring-black ring-opacity-5">
                                    {cat.subcategories.map(subCat => (
                                        <button
                                            key={subCat}
                                            onClick={() => handleCategoryClick(subCat)}
                                            className={`block w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-colors duration-200
                                            ${activeCategory === subCat ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 font-bold' : ''}`}
                                        >
                                            {subCat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    <NavButton path="#/feed" label="ফিড" />
                    <NavButton path="#/community" label="গ্রুপসমূহ" />
                </div>
            </nav>
            
            {/* New Full-Screen Mobile Menu Panel */}
            <div 
                className={`fixed inset-0 z-50 md:hidden bg-white dark:bg-gray-900 transition-opacity duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                {/* Menu Header */}
                <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">স</div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100">সব বিভাগ</h2>
                    </div>
                    <button onClick={onCloseMobileMenu} className="text-3xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">&times;</button>
                </div>
                 {/* Search Bar */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <MobileSearchForm onSearch={onSearch} onCloseMenu={onCloseMobileMenu} />
                </div>
                {/* Categories List (Scrollable) */}
                <div className="flex-grow overflow-y-auto">
                    {/* Community Links */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                         <button
                            onClick={() => { onNavigate('#/feed'); onCloseMobileMenu(); }}
                            className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 font-bold"
                        >
                            ফিড
                        </button>
                    </div>
                     <div className="border-b border-gray-200 dark:border-gray-700">
                         <button
                            onClick={() => { onNavigate('#/community'); onCloseMobileMenu(); }}
                            className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 font-bold"
                        >
                            গ্রুপসমূহ
                        </button>
                    </div>
                    {categories.map(cat => (
                        <div key={cat.name} className="border-b border-gray-200 dark:border-gray-700">
                            <div 
                                className={`flex justify-between items-center px-4 py-3 text-gray-700 dark:text-gray-200 ${activeCategory === cat.name ? 'text-red-600 dark:text-red-400' : ''}`}
                            >
                                <button
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className="font-bold flex-grow text-left"
                                >
                                    {cat.name}
                                </button>
                                {cat.subcategories && (
                                     <button onClick={() => toggleAccordion(cat.name)} className="p-2 -mr-2" aria-expanded={openAccordion === cat.name}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${openAccordion === cat.name ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            {cat.subcategories && (
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === cat.name ? 'max-h-96' : 'max-h-0'}`}>
                                    <div className="pl-6 border-l-2 border-gray-200 dark:border-gray-600 ml-4 py-2">
                                        {cat.subcategories.map(subCat => (
                                             <button
                                                key={subCat}
                                                onClick={() => handleCategoryClick(subCat)}
                                                className={`block w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 rounded-md ${activeCategory === subCat ? 'text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                            >
                                                {subCat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                 {/* Menu Footer */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">থিম পরিবর্তন করুন</span>
                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                    </div>
                     <div className="flex space-x-4 justify-center items-center">
                        <SocialIcon href={socialLinks.facebook} label="Facebook"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg></SocialIcon>
                        <SocialIcon href={socialLinks.twitter} label="Twitter X"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></SocialIcon>
                        <SocialIcon href={socialLinks.youtube} label="YouTube"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.78 22 12 22 12s0 3.22-.42 4.814a2.506 2.506 0 0 1-1.768 1.768c-1.594.42-7.812.42-7.812.42s-6.218 0-7.812-.42a2.506 2.506 0 0 1-1.768-1.768C2 15.22 2 12 2 12s0-3.22.42-4.814a2.506 2.506 0 0 1 1.768-1.768C5.782 5 12 5 12 5s6.218 0 7.812.418ZM15.194 12 10 15.194V8.806L15.194 12Z" clipRule="evenodd" /></svg></SocialIcon>
                        <SocialIcon href={socialLinks.instagram} label="Instagram"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919 4.919 1.266-.058 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"/></svg></SocialIcon>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.2s ease-out forwards;
                }
            `}</style>
        </>
    );
};
