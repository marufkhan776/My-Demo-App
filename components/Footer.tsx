
import React from 'react';
import { Category, PolicyKey, SiteSettings } from '../types';

interface FooterProps {
    onSelectCategory: (category: Category) => void;
    onOpenPolicy: (policyKey: PolicyKey) => void;
    socialLinks: SiteSettings['socialLinks'];
}

const SocialIcon: React.FC<{ href: string; children: React.ReactNode; label: string }> = ({ href, children, label }) => (
    <a href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300">
        {children}
    </a>
);

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenPolicy, socialLinks }) => {
    return (
        <footer className="bg-slate-800 dark:bg-slate-900 text-gray-300 mt-12">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 md:gap-10">
                    <div className="col-span-2 md:col-span-1 space-y-4 pr-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                স
                            </div>
                            <h2 className="text-2xl font-bold text-white">বাংলা সংবাদ</h2>
                        </div>
                        <p className="text-sm text-gray-400">
                            সারা বিশ্বের সর্বশেষ সংবাদ, বিশ্লেষণ এবং মতামতের জন্য আপনার বিশ্বস্ত উৎস।
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">দ্রুত লিঙ্ক</h3>
                        <ul className="space-y-3 text-sm">
                            <li><button onClick={() => onSelectCategory('জাতীয়')} className="hover:text-white transition-colors duration-300 text-left">জাতীয়</button></li>
                            <li><button onClick={() => onSelectCategory('আন্তর্জাতিক')} className="hover:text-white transition-colors duration-300 text-left">আন্তর্জাতিক</button></li>
                            <li><button onClick={() => onSelectCategory('অর্থনীতি')} className="hover:text-white transition-colors duration-300 text-left">অর্থনীতি</button></li>
                            <li><button onClick={() => onSelectCategory('খেলা')} className="hover:text-white transition-colors duration-300 text-left">খেলা</button></li>
                            <li><button onClick={() => onSelectCategory('বিনোদন')} className="hover:text-white transition-colors duration-300 text-left">বিনোদন</button></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">নীতিমালা ও তথ্য</h3>
                        <ul className="space-y-3 text-sm">
                            <li><button onClick={() => onOpenPolicy('aboutUs')} className="hover:text-white transition-colors duration-300 text-left">আমাদের সম্পর্কে</button></li>
                            <li><button onClick={() => onOpenPolicy('editorialPolicy')} className="hover:text-white transition-colors duration-300 text-left">সম্পাদকীয় নীতিমালা</button></li>
                            <li><button onClick={() => onOpenPolicy('contact')} className="hover:text-white transition-colors duration-300 text-left">যোগাযোগ</button></li>
                            <li><button onClick={() => onOpenPolicy('privacyPolicy')} className="hover:text-white transition-colors duration-300 text-left">গোপনীয়তা নীতি</button></li>
                            <li><button onClick={() => onOpenPolicy('terms')} className="hover:text-white transition-colors duration-300 text-left">শর্তাবলী</button></li>
                        </ul>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <h3 className="text-lg font-semibold text-white mb-4 text-center md:text-left">সামাজিক যোগাযোগ</h3>
                        <div className="flex space-x-4 justify-center md:justify-start">
                            <SocialIcon href={socialLinks.facebook} label="Facebook">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                            </SocialIcon>
                            <SocialIcon href={socialLinks.twitter} label="Twitter X">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </SocialIcon>
                            <SocialIcon href={socialLinks.youtube} label="YouTube">
                                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.78 22 12 22 12s0 3.22-.42 4.814a2.506 2.506 0 0 1-1.768 1.768c-1.594.42-7.812.42-7.812.42s-6.218 0-7.812-.42a2.506 2.506 0 0 1-1.768-1.768C2 15.22 2 12 2 12s0-3.22.42-4.814a2.506 2.506 0 0 1 1.768-1.768C5.782 5 12 5 12 5s6.218 0 7.812.418ZM15.194 12 10 15.194V8.806L15.194 12Z" clipRule="evenodd" /></svg>
                            </SocialIcon>
                             <SocialIcon href={socialLinks.instagram} label="Instagram">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919 4.919 1.266-.058 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"/></svg>
                            </SocialIcon>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-slate-900 dark:bg-black/30 border-t border-slate-700">
                <div className="container mx-auto px-4 py-4 text-center">
                    <p className="text-sm text-gray-400">
                        &copy; ২০২৪ বাংলা সংবাদ। সর্বস্বত্ব সংরক্ষিত।
                    </p>
                </div>
            </div>
        </footer>
    );
};
