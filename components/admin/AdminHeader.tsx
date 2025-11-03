
import React from 'react';

interface AdminHeaderProps {
    currentView: string;
    onLogout: () => void;
}

const viewTitles: Record<string, string> = {
    dashboard: 'ড্যাশবোর্ড',
    articles: 'খবর ম্যানেজ করুন',
    'new-article': 'নতুন খবর যোগ করুন',
    'edit-article': 'খবর এডিট করুন',
    settings: 'সাইট সেটিংস',
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({ currentView, onLogout }) => {
    const title = viewTitles[currentView] || 'Admin Panel';

    return (
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
            <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
            >
                লগআউট
            </button>
        </header>
    );
};
