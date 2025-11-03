import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { Article } from '../../types';

interface ArticleListProps {
    onEditArticle: (id: string) => void;
    onAddArticle: () => void;
    onContentUpdate: () => void;
}

const ARTICLES_PER_PAGE = 10;

export const ArticleList: React.FC<ArticleListProps> = ({ onEditArticle, onAddArticle, onContentUpdate }) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setArticles(contentService.getArticles());
    }, []);

    const handleDelete = (id: string) => {
        if (window.confirm('আপনি কি নিশ্চিত যে এই খবরটি ডিলিট করতে চান?')) {
            contentService.deleteArticle(id);
            const updatedArticles = contentService.getArticles();
            setArticles(updatedArticles);

            // Adjust current page if it becomes empty after deletion
            const newTotalPages = Math.ceil(updatedArticles.length / ARTICLES_PER_PAGE);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            } else if (newTotalPages === 0) {
                setCurrentPage(1); // Reset to page 1 if all articles are deleted
            }

            onContentUpdate(); // Notify main app
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const paginatedArticles = articles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">খবরের তালিকা</h2>
                <button
                    onClick={onAddArticle}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    নতুন খবর যোগ করুন
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">শিরোনাম</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">বিভাগ</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">প্রকাশের তারিখ</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {paginatedArticles.map(article => (
                            <tr key={article.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-4 max-w-sm truncate" title={article.headline}>{article.headline}</td>
                                <td className="py-3 px-4">{article.category}</td>
                                <td className="py-3 px-4">{article.publishedDate}</td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                    <button
                                        onClick={() => onEditArticle(article.id)}
                                        className="text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded mr-2"
                                    >
                                        এডিট
                                    </button>
                                    <button
                                        onClick={() => handleDelete(article.id)}
                                        className="text-sm bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
                                    >
                                        ডিলিট
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {articles.length === 0 && (
                    <p className="text-center text-gray-500 py-8">কোনো খবর পাওয়া যায়নি। নতুন খবর যোগ করুন।</p>
                )}
            </div>
            {totalPages > 1 && (
                 <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        পূর্ববর্তী
                    </button>
                    <span className="text-sm text-gray-700">
                        পৃষ্ঠা {new Intl.NumberFormat('bn-BD').format(currentPage)} / {new Intl.NumberFormat('bn-BD').format(totalPages)}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        পরবর্তী
                    </button>
                </div>
            )}
        </div>
    );
};