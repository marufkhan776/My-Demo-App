import React, { useState, useEffect } from 'react';
import { communityService } from '../../services/communityService';
import { CommunityUser } from '../../types';

interface EditProfileModalProps {
    user: CommunityUser;
    onClose: () => void;
    onProfileUpdate: (updatedUser: CommunityUser) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onProfileUpdate }) => {
    const [formData, setFormData] = useState({
        username: user.username,
        bio: user.bio || '',
        profilePicture: user.profilePicture,
        coverPhoto: user.coverPhoto || '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.username.trim()) {
            setError('ব্যবহারকারীর নাম খালি হতে পারে না।');
            return;
        }
        setIsLoading(true);
        try {
            const updatedUser = communityService.updateUserProfile(user.id, formData);
            onProfileUpdate(updatedUser);
        } catch (err: any) {
            setError(err.message || 'প্রোফাইল আপডেট করা যায়নি।');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={handleBackdropClick}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg animate-fade-in-up flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">প্রোফাইল সম্পাদনা করুন</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-200 transition text-3xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label htmlFor="username" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">ব্যবহারকারীর নাম</label>
                        <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">বায়ো</label>
                        <textarea name="bio" id="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="নিজের সম্পর্কে কিছু বলুন..."></textarea>
                    </div>
                    <div>
                        <label htmlFor="profilePicture" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">প্রোফাইল ছবির URL</label>
                        <input type="url" name="profilePicture" id="profilePicture" value={formData.profilePicture} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                        <label htmlFor="coverPhoto" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">কভার ছবির URL</label>
                        <input type="url" name="coverPhoto" id="coverPhoto" value={formData.coverPhoto} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div className="flex justify-end space-x-4 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300">বাতিল করুন</button>
                        <button type="submit" disabled={isLoading} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300 disabled:bg-red-400">
                            {isLoading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};
