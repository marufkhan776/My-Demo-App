
import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { Article } from '../../types';

export const Dashboard: React.FC = () => {
    const [articleCount, setArticleCount] = useState(0);

    useEffect(() => {
        setArticleCount(contentService.getArticles().length);
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">স্বাগতম!</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-600">মোট খবর</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">{articleCount}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-600">সাইট স্ট্যাটাস</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">লাইভ</p>
                </div>
            </div>
             <div className="mt-8 bg-white p-6 rounded-lg shadow">
                 <h3 className="text-lg font-semibold text-gray-700 mb-4">দ্রুত 시작 করুন</h3>
                 <p className="text-gray-600">
                    বাম দিকের মেনু ব্যবহার করে আপনি নতুন খবর যোগ করতে, পুরোনো খবর এডিট বা ডিলিট করতে এবং সাইটের সাধারণ সেটিংস পরিবর্তন করতে পারেন।
                 </p>
            </div>
        </div>
    );
};
