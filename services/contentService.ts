
import { Article, SiteSettings } from '../types';

const ARTICLES_KEY = 'newsArticles';
const SETTINGS_KEY = 'siteSettings';

const DEFAULT_SETTINGS: SiteSettings = {
    siteName: 'বাংলা সংবাদ',
    socialLinks: {
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        youtube: 'https://youtube.com',
        instagram: 'https://instagram.com',
    },
};

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

export const contentService = {
    // Settings
    getSettings(): SiteSettings {
        return getFromStorage<SiteSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
    },
    saveSettings(settings: SiteSettings): void {
        saveToStorage<SiteSettings>(SETTINGS_KEY, settings);
    },

    // Articles
    getArticles(): Article[] {
        const articles = getFromStorage<Article[]>(ARTICLES_KEY, []);
        // Sort by creation date (newest first) assuming id is timestamp
        return articles.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    },
    getArticle(id: string): Article | undefined {
        const articles = this.getArticles();
        return articles.find(article => article.id === id);
    },
    saveArticle(article: Omit<Article, 'id'> & { id?: string }): Article {
        const articles = this.getArticles();
        if (article.id) {
            // Update existing article
            const index = articles.findIndex(a => a.id === article.id);
            if (index > -1) {
                articles[index] = article as Article;
            }
        } else {
            // Create new article
            const newArticle: Article = {
                ...article,
                id: Date.now().toString(), // Simple unique ID
            };
            articles.unshift(newArticle); // Add to the beginning
        }
        saveToStorage(ARTICLES_KEY, articles);
        return article as Article;
    },
    deleteArticle(id: string): void {
        let articles = this.getArticles();
        articles = articles.filter(article => article.id !== id);
        saveToStorage(ARTICLES_KEY, articles);
    },
};
