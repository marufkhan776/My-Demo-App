
import React from 'react';

interface SidebarProps {
    currentView: string;
    onNavigate: (view: any) => void;
}

const NavLink: React.FC<{
    label: string;
    view: string;
    currentView: string;
    onNavigate: (view: any) => void;
    icon: React.ReactNode;
}> = ({ label, view, currentView, onNavigate, icon }) => {
    const isActive = currentView.includes(view);
    return (
        <button
            onClick={() => onNavigate(view)}
            className={`flex items-center w-full px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors ${
                isActive
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
        >
            <span className="mr-3">{icon}</span>
            {label}
        </button>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
    return (
        <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:block">
            <div className="p-4 border-b">
                 <a href="#/" className="flex items-center space-x-3">
                     <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        স
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">অ্যাডমিন প্যানেল</h1>
                </a>
            </div>
            <nav className="p-4 space-y-2">
                <NavLink
                    label="ড্যাশবোর্ড"
                    view="dashboard"
                    currentView={currentView}
                    onNavigate={onNavigate}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                />
                 <NavLink
                    label="খবর ম্যানেজ করুন"
                    view="articles"
                    currentView={currentView}
                    onNavigate={onNavigate}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3h2m-4 3H9m-4 6h12m-4 4h4m-4 4H9m-4-4h.01M17 17h.01" /></svg>}
                />
                 <NavLink
                    label="সেটিংস"
                    view="settings"
                    currentView={currentView}
                    onNavigate={onNavigate}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                />
            </nav>
        </aside>
    );
};
