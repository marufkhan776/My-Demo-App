
import React, { useState } from 'react';
import { contentService } from '../../services/contentService';
import { SiteSettings } from '../../types';

interface SettingsProps {
    onSave: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onSave }) => {
    const [settings, setSettings] = useState<SiteSettings>(contentService.getSettings());
    const [isSaved, setIsSaved] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [section, key] = name.split('.');

        if (section === 'socialLinks') {
            setSettings(prev => ({
                ...prev,
                socialLinks: {
                    ...prev.socialLinks,
                    [key]: value
                }
            }));
        } else {
            setSettings(prev => ({ ...prev, [name]: value }));
        }
        setIsSaved(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        contentService.saveSettings(settings);
        setIsSaved(true);
        onSave(); // Notify App component to refresh content
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto space-y-6">
             <h2 className="text-xl font-bold text-gray-800 border-b pb-4">সাইট সেটিংস</h2>
            
            <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">সাইটের নাম</label>
                <input 
                    type="text" 
                    name="siteName" 
                    id="siteName" 
                    value={settings.siteName} 
                    onChange={handleChange} 
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" 
                    required 
                />
            </div>
            
             <div>
                <h3 className="text-lg font-medium text-gray-800">সামাজিক যোগাযোগ লিঙ্ক</h3>
                 <div className="space-y-4 mt-2">
                     <div>
                        <label htmlFor="socialLinks.facebook" className="block text-sm font-medium text-gray-700">Facebook</label>
                        <input type="url" name="socialLinks.facebook" id="socialLinks.facebook" value={settings.socialLinks.facebook} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                    </div>
                     <div>
                        <label htmlFor="socialLinks.twitter" className="block text-sm font-medium text-gray-700">Twitter (X)</label>
                        <input type="url" name="socialLinks.twitter" id="socialLinks.twitter" value={settings.socialLinks.twitter} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                    </div>
                     <div>
                        <label htmlFor="socialLinks.youtube" className="block text-sm font-medium text-gray-700">YouTube</label>
                        <input type="url" name="socialLinks.youtube" id="socialLinks.youtube" value={settings.socialLinks.youtube} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                    </div>
                     <div>
                        <label htmlFor="socialLinks.instagram" className="block text-sm font-medium text-gray-700">Instagram</label>
                        <input type="url" name="socialLinks.instagram" id="socialLinks.instagram" value={settings.socialLinks.instagram} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end items-center space-x-4">
                {isSaved && <p className="text-green-600 text-sm">সফলভাবে সেভ করা হয়েছে!</p>}
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded">
                    সেভ করুন
                </button>
            </div>
        </form>
    );
};
