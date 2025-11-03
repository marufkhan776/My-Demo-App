
import React, { useState } from 'react';
import { authService } from '../../services/authService';

interface LoginProps {
    onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (authService.login(password)) {
            onLogin();
        } else {
            setError('Incorrect password. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center justify-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        স
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">অ্যাডমিন লগইন</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            পাসওয়ার্ড
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="************"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                     <p className="text-gray-500 text-xs italic mb-4">Demo password: admin123</p>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        >
                            লগইন করুন
                        </button>
                    </div>
                </form>
            </div>
             <a href="#/" className="mt-6 text-sm text-gray-600 hover:text-red-600 transition-colors">
                &larr; মূল সাইটে ফিরে যান
            </a>
        </div>
    );
};
