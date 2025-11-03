
import { GoogleGenAI, Type } from "@google/genai";
import { Article, Category } from '../types';

// IMPORTANT: The API key is now sourced from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const allCategories = "জাতীয় (রাজনীতি, প্রশাসন, নির্বাচন, আইন ও আদালত, দুর্নীতি ও অপরাধ), আন্তর্জাতিক (বিশ্ব রাজনীতি, দক্ষিণ এশিয়া, মধ্যপ্রাচ্য, ইউরোপ, আমেরিকা, আফ্রিকা), অর্থনীতি (ব্যাংক ও বীমা, শেয়ারবাজার, শিল্প ও বাণিজ্য, কৃষি, চাকরি-বাজার, বৈদেশিক বাণিজ্য), খেলা (ক্রিকেট, ফুটবল, হকি, টেনিস), বিনোদন (চলচ্চিত্র, নাটক, সঙ্গীত, টেলিভিশন, বলিউড/হলিউড, সেলিব্রেটি), জীবনযাপন (স্বাস্থ্য, ফ্যাশন ও সৌন্দর্য, খাদ্য ও ভ্রমণ, পরিবার ও সম্পর্ক), প্রযুক্তি (গ্যাজেট, মোবাইল, সোশ্যাল মিডিয়া, সফটওয়্যার ও অ্যাপস, কৃত্রিম বুদ্ধিমত্তা), মতামত (সম্পাদকীয়, কলাম), শিক্ষা (ভর্তি সংবাদ, পরীক্ষার আপডেট, বৃত্তি, ক্যারিয়ার), বিজ্ঞান (গবেষণা, পরিবেশ, মহাকাশ), ধর্ম, জেলা সংবাদ, ফিচার, ছবি ও ভিডিও, অটোমোবাইল";

export const generateNews = async (count: number, category: Category = 'সব খবর'): Promise<Omit<Article, 'id'>[]> => {
    try {
        const prompt = category === 'সব খবর'
            ? `Generate ${count} diverse, realistic, and engaging Bangla news articles from today. Cover a wide range of categories from the following list: ${allCategories}. For each article, provide a headline, a short summary (2-3 sentences), a full story (3-4 paragraphs), a relevant category from the list, a published date (e.g., 'জুলাই ২৬, ২০২৪'), and a relevant English keyword for generating an image. Ensure the content is high quality and sounds like it's from a professional news source.`
            : `Generate ${count} realistic and engaging Bangla news articles specifically for the '${category}' category. The articles should be current as of today. For each article, provide a headline, a short summary (2-3 sentences), a full story (3-4 paragraphs), the category ('${category}'), a published date (e.g., 'জুলাই ২৬, ২০২৪'), and a relevant English keyword for an image. Ensure high-quality, professional-sounding content.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        articles: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    headline: { type: Type.STRING, description: "The Bengali headline of the news article." },
                                    summary: { type: Type.STRING, description: "A short summary in Bengali." },
                                    fullStory: { type: Type.STRING, description: "The full news story in Bengali, multiple paragraphs." },
                                    category: { type: Type.STRING, description: "The category of the news in Bengali." },
                                    publishedDate: { type: Type.STRING, description: "The publication date in Bengali format." },
                                    imageKeyword: { type: Type.STRING, description: "A single, relevant English keyword for a stock photo (e.g., 'technology', 'cricket', 'politics')." }
                                },
                                required: ["headline", "summary", "fullStory", "category", "publishedDate", "imageKeyword"]
                            }
                        }
                    },
                    required: ["articles"]
                }
            }
        });

        const jsonString = response.text.trim();
        const parsedResponse = JSON.parse(jsonString);

        if (!parsedResponse.articles) {
            return [];
        }
        
        const articlesWithImages: Omit<Article, 'id'>[] = parsedResponse.articles.map((article: any) => ({
            ...article,
            imageUrl: `https://source.unsplash.com/800x600/?${article.imageKeyword}&sig=${Math.random()}`
        }));

        return articlesWithImages;

    } catch (error) {
        console.error("Error generating news from Gemini API:", error);
        throw new Error("Failed to generate news articles.");
    }
};
