import React, { useState, useEffect } from 'react';
import { communityService } from '../../services/communityService';
import { CommunityUser } from '../../types';

interface UserAuthModalProps {
    onClose: () => void;
    onLoginSuccess: (user: CommunityUser) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({ onClose, onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let user: CommunityUser | null = null;
            if (isLoginView) {
                user = communityService.login(username, password);
                if (!user) {
                    setError('ভুল ব্যবহারকারীর নাম বা পাসওয়ার্ড।');
                }
            } else {
                user = communityService.register(username, password);
                 if (!user) {
                    setError('এই ব্যবহারকারীর নাম ইতিমধ্যে ব্যবহৃত হয়েছে।');
                } else {
                    // Automatically log in after successful registration
                    user = communityService.login(username, password);
                }
            }

            if (user) {
                onLoginSuccess(user);
            }
        } catch (err) {
            setError('একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।');
        } finally {
            setIsLoading(false);
        }
    };
    
    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError('');
        setUsername('');
        setPassword('');
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md animate-fade-in-up">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button onClick={toggleView} disabled={isLoginView} className={`flex-1 p-4 font-semibold text-center ${isLoginView ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 dark:text-gray-400'}`}>
                        লগইন
                    </button>
                    <button onClick={toggleView} disabled={!isLoginView} className={`flex-1 p-4 font-semibold text-center ${!isLoginView ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 dark:text-gray-400'}`}>
                        রেজিস্টার
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">{isLoginView ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'একটি নতুন অ্যাকাউন্ট তৈরি করুন'}</h2>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="username">
                            ব্যবহারকারীর নাম
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                            পাসওয়ার্ড
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                         {!isLoginView && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ন্যূনতম ৬ অক্ষর।</p>}
                    </div>

                    {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}
                    
                    {isLoginView && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300 p-3 text-sm rounded-r-lg mb-4">
                            <p className="font-bold">ডেমো লগইন তথ্য:</p>
                            <p><strong>ব্যবহারকারীর নাম:</strong> প্রথম ব্যবহারকারী</p>
                            <p><strong>পাসওয়ার্ড:</strong> pass123</p>
                        </div>
                    )}


                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition duration-300 disabled:bg-red-400"
                    >
                        {isLoading ? 'লোড হচ্ছে...' : (isLoginView ? 'লগইন করুন' : 'রেজিস্টার করুন')}
                    </button>
                </form>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 text-right">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300">
                        বন্ধ করুন
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
