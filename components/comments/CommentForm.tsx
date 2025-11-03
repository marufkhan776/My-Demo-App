import React, { useState } from 'react';
import { CommunityUser } from '../../types';

interface CommentFormProps {
    onSubmit: (content: string) => void;
    currentUser: CommunityUser;
    initialText?: string;
    onTextChange?: (text: string) => void;
    onCancel?: () => void;
    placeholder?: string;
    buttonText?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({ 
    onSubmit, 
    currentUser,
    initialText = '',
    onTextChange,
    onCancel,
    placeholder = 'আপনার মন্তব্য লিখুন...',
    buttonText = 'মন্তব্য করুন' 
}) => {
    const [content, setContent] = useState(initialText);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        if (onTextChange) {
            onTextChange(e.target.value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        
        setIsLoading(true);
        onSubmit(content.trim());
        // Parent component is responsible for clearing text if it's a submittable form
        if (!onTextChange) {
            setContent('');
        }
        setIsLoading(false);
    };

    return (
         <form onSubmit={handleSubmit} className="flex items-start space-x-3">
            <img src={currentUser.profilePicture} alt={currentUser.username} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            <div className="flex-grow">
                <textarea
                    value={content}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                    rows={2}
                    required
                    autoFocus={!!initialText}
                />
                <div className="flex justify-end items-center gap-3 mt-2">
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:underline">
                            বাতিল করুন
                        </button>
                    )}
                    <button type="submit" disabled={isLoading} className="bg-red-600 text-white font-semibold py-1.5 px-5 rounded-md hover:bg-red-700 transition duration-300 disabled:bg-red-400 text-sm">
                        {isLoading ? 'পোস্ট হচ্ছে...' : buttonText}
                    </button>
                </div>
            </div>
        </form>
    );
};
