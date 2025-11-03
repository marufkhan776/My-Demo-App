
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { AdminHeader } from './AdminHeader';
import { Dashboard } from './Dashboard';
import { ArticleList } from './ArticleList';
import { ArticleEditor } from './ArticleEditor';
import { Settings } from './Settings';

interface AdminPanelProps {
    onLogout: () => void;
    onContentUpdate: () => void;
}

type AdminView = 'dashboard' | 'articles' | 'new-article' | 'edit-article' | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onContentUpdate }) => {
    const [currentView, setCurrentView] = useState<AdminView>('dashboard');
    const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

    const navigateTo = (view: AdminView) => {
        setCurrentView(view);
        setEditingArticleId(null);
    };

    const handleEditArticle = (id: string) => {
        setEditingArticleId(id);
        setCurrentView('edit-article');
    };

    const handleSave = () => {
        onContentUpdate(); // Refresh content on the main site
        navigateTo('articles');
    };

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard />;
            case 'articles':
                return <ArticleList onEditArticle={handleEditArticle} onAddArticle={() => navigateTo('new-article')} onContentUpdate={onContentUpdate} />;
            case 'new-article':
                return <ArticleEditor onSave={handleSave} onCancel={() => navigateTo('articles')} />;
            case 'edit-article':
                return <ArticleEditor articleId={editingArticleId} onSave={handleSave} onCancel={() => navigateTo('articles')} />;
            case 'settings':
                return <Settings onSave={onContentUpdate} />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Sidebar currentView={currentView} onNavigate={navigateTo} />
            <div className="flex-1 flex flex-col">
                <AdminHeader currentView={currentView} onLogout={onLogout} />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};
