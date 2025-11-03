
import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { generateNews } from '../../services/newsService';
import { Article, Category } from '../../types';
import { CATEGORIES_STRUCTURED } from '../../constants';

interface ArticleEditorProps {
    articleId?: string | null;
    onSave: () => void;
    onCancel: () => void;
}

const allCategories = CATEGORIES_STRUCTURED.flatMap(c => c.subcategories ? [c.name, ...c.subcategories] : [c.name]);
const uniqueCategories = [...new Set(allCategories)];


export const ArticleEditor: React.FC<ArticleEditorProps> = ({ articleId, onSave, onCancel }) => {
    const [article, setArticle] = useState<Partial<Article>>({
        headline: '',
        summary: '',
        fullStory: '',
        category: 'জাতীয়',
        publishedDate: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
        imageKeyword: '',
        imageUrl: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (articleId) {
            const existingArticle = contentService.getArticle(articleId);
            if (existingArticle) {
                setArticle(existingArticle);
            }
        }
    }, [articleId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setArticle(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        contentService.saveArticle(article as Omit<Article, 'id'> & { id?: string });
        onSave();
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const generated = await generateNews(1, article.category as Category);
            if (generated.length > 0) {
                setArticle(prev => ({
                    ...prev,
                    headline: generated[0].headline,
                    summary: generated[0].summary,
                    fullStory: generated[0].fullStory,
                    imageKeyword: generated[0].imageKeyword,
                    imageUrl: generated[0].imageUrl
                }));
            }
        } catch (error) {
            console.error("Failed to generate article", error);
            alert("AI দ্বারা খবর তৈরি করা সম্ভব হয়নি।");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
            <div>
                 <button 
                    type="button" 
                    onClick={handleGenerate} 
                    disabled={isGenerating}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors w-full disabled:bg-green-400"
                >
                    {isGenerating ? 'তৈরি হচ্ছে...' : 'AI দিয়ে খবর তৈরি করুন'}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">AI ব্যবহার করে শিরোনাম, সারসংক্ষেপ এবং মূল খবর তৈরি করতে পারেন। বিভাগ নির্বাচন করে বাটনে ক্লিক করুন।</p>
            </div>
            
            <hr/>

            <div>
                <label htmlFor="headline" className="block text-sm font-medium text-gray-700">শিরোনাম</label>
                <input type="text" name="headline" id="headline" value={article.headline} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
            </div>

            <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700">সারসংক্ষেপ</label>
                <textarea name="summary" id="summary" value={article.summary} onChange={handleChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
            </div>

            <div>
                <label htmlFor="fullStory" className="block text-sm font-medium text-gray-700">সম্পূর্ণ খবর</label>
                <textarea name="fullStory" id="fullStory" value={article.fullStory} onChange={handleChange} rows={10} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">বিভাগ</label>
                    <select name="category" id="category" value={article.category} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required>
                       {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="publishedDate" className="block text-sm font-medium text-gray-700">প্রকাশের তারিখ</label>
                    <input type="text" name="publishedDate" id="publishedDate" value={article.publishedDate} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="imageKeyword" className="block text-sm font-medium text-gray-700">ছবির কীওয়ার্ড (ইংরেজি)</label>
                    <input type="text" name="imageKeyword" id="imageKeyword" value={article.imageKeyword} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="e.g., politics, cricket" />
                </div>
                 <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">ছবির URL (ঐচ্ছিক)</label>
                    <input type="text" name="imageUrl" id="imageUrl" value={article.imageUrl} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="https://..."/>
                    <p className="text-xs text-gray-500 mt-1">কীওয়ার্ড দিলে এটি স্বয়ংক্রিয়ভাবে তৈরি হবে। নির্দিষ্ট ছবি চাইলে URL দিন।</p>
                </div>
            </div>


            <div className="flex justify-end space-x-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">বাতিল করুন</button>
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">সেভ করুন</button>
            </div>
        </form>
    );
};
