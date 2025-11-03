
import React from 'react';

interface ErrorDisplayProps {
    message: string;
    onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
    return (
        <div className="text-center py-20 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-6 rounded-lg" role="alert">
            <p className="font-bold text-xl mb-2">একটি ত্রুটি ঘটেছে</p>
            <p className="mb-4">{message}</p>
            <button
                onClick={onRetry}
                className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300"
            >
                আবার চেষ্টা করুন
            </button>
        </div>
    );
};
