import React, { useState, useEffect, useRef } from 'react';
import { communityService } from '../../services/communityService';
import { Group, CommunityUser } from '../../types';

interface CreatePostModalProps {
    currentUser: CommunityUser;
    userGroups: Group[];
    onClose: () => void;
    onPostCreated: () => void;
    defaultGroupId?: string;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ currentUser, userGroups, onClose, onPostCreated, defaultGroupId }) => {
    const [content, setContent] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState<string>(defaultGroupId || userGroups[0]?.id || '');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!content.trim()) {
            setError('পোস্ট খালি হতে পারে না।');
            return;
        }
        if (!selectedGroupId) {
            setError('পোস্ট করার জন্য একটি গ্রুপ নির্বাচন করুন।');
            return;
        }
        setIsLoading(true);
        communityService.createPost(selectedGroupId, currentUser.id, content, imagePreview || undefined);
        onPostCreated();
        setIsLoading(false);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg animate-fade-in-up flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">পোস্ট তৈরি করুন</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-200 transition text-3xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                    <div className="p-6 overflow-y-auto">
                        <div className="flex items-center space-x-3 mb-4">
                            <img src={currentUser.profilePicture} alt={currentUser.username} className="w-10 h-10 rounded-full object-cover"/>
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-100">{currentUser.username}</p>
                                <select
                                    id="group-select"
                                    value={selectedGroupId}
                                    onChange={(e) => setSelectedGroupId(e.target.value)}
                                    disabled={!!defaultGroupId}
                                    className="text-sm p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-70"
                                >
                                    {userGroups.map(group => (
                                        <option key={group.id} value={group.id}>{group.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={`আপনার মনে কী চলছে, ${currentUser.username}?`}
                            className="w-full p-2 text-lg border-none bg-transparent focus:outline-none focus:ring-0 resize-none"
                            rows={5}
                            autoFocus
                        />
                        {imagePreview && (
                            <div className="mt-4 relative border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                                <img src={imagePreview} alt="Post preview" className="rounded-lg max-h-80 w-full object-contain" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 leading-none hover:bg-opacity-80 transition-opacity"
                                    aria-label="Remove image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        )}
                         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                     <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/png, image/jpeg, image/gif"
                            className="hidden"
                        />
                         <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-green-500" aria-label="Add photo">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         </button>
                     </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <button type="submit" disabled={isLoading} className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition duration-300 disabled:bg-red-400">
                            {isLoading ? 'পোস্ট হচ্ছে...' : 'পোস্ট করুন'}
                        </button>
                    </div>
                </form>
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
