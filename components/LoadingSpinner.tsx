
import React from 'react';

export const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">খবর লোড হচ্ছে...</p>
        </div>
    );
};
