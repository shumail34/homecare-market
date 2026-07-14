"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

import Image from 'next/image';

const ChatbotWidget = React.memo(() => {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);

    // Simplified core questions for better UX
    const SUGGESTIONS = [
        { label: '📅 How to book a service?', text: 'How do I book a service?' },
        { label: '💰 Payment methods', text: 'What payment methods do you accept?' },
        { label: '🧹 Find cleaning services', text: 'Show me cleaning services near me' },
        { label: '👨‍🔧 Hire a plumber', text: 'I need a plumber' },
        { label: '📞 Contact Support', text: 'How do I contact customer support?' },
        { label: '⭐ Leave a review', text: 'How do I rate a provider?' },
    ];

    useEffect(() => {
        // Initial welcome message
        if (messages.length === 0) {
            setMessages([
                { id: 1, text: "Hello! I'm your HomeCare AI, powered by Google Gemini. How can I help you today?", sender: 'bot' }
            ]);
        }
    }, [messages.length]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [searchResults, setSearchResults] = useState({}); // botMessageId -> [services]
    const scrollRef = useRef(null);

    const fetchAIResults = async (intent, botMsgId) => {
        try {
            const params = { limit: 3 };
            if (intent.category && intent.category !== 'General') {
                const catRes = await api.get('services/categories/');
                const cats = catRes.data.results || catRes.data;
                const found = cats.find(c => c.name.toLowerCase().includes(intent.category.toLowerCase()));
                if (found) params.category = found.id;
            }
            if (intent.location) params.city__icontains = intent.location;
            if (intent.max_budget) params.price_per_hour__lte = intent.max_budget;

            const res = await api.get('services/', { params });
            const services = res.data.results || res.data;
            if (services.length > 0) {
                setSearchResults(prev => ({ ...prev, [botMsgId]: services }));
            }
        } catch (e) {
            console.error("AI Result fetch error:", e);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);
        await performRequest(input);
    };

    const handleSuggestionClick = (text) => {
        const userMessage = { id: Date.now(), text, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);
        performRequest(text);
    };

    const performRequest = async (textToSubmit) => {
        try {
            // Get regular chatbot response
            const response = await api.post('ai/chat/', { message: textToSubmit });
            const botMessageText = response.data.reply || response.data.response || "I'm here to help! Could you rephrase that?";
            const botMsgId = Date.now() + 1;
            const botMessage = { id: botMsgId, text: botMessageText, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);

            // Also get structured intent for real-time UI updates
            const smartResponse = await api.post('ai/smart-search/', { message: textToSubmit });
            if (smartResponse.data && smartResponse.data.category !== 'General') {
                const intentData = smartResponse.data;

                // Update the bot message with intent for visual feedback
                setMessages(prev => {
                    const newMessages = [...prev];
                    const target = newMessages.find(m => m.id === botMsgId);
                    if (target) {
                        target.intent = intentData.category;
                    }
                    return [...newMessages];
                });

                // Fetch real results for global usage
                fetchAIResults(intentData, botMsgId);

                // Dispatch event to update the UI elsewhere (e.g., Services Page)
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('smart-intent-discovered', {
                        detail: smartResponse.data
                    }));
                }

                // AUTO-REDIRECT: If not on services page, move there to show results instantly
                if (pathname !== '/services' && (intentData.category !== 'General' || intentData.location)) {
                    let query = '/services?';

                    if (intentData.category && intentData.category !== 'General') {
                        // We need the ID for the URL, let's fetch it or use the name if backend supports it
                        const catRes = await api.get('services/categories/');
                        const cats = catRes.data.results || catRes.data;
                        const found = cats.find(c => c.name.toLowerCase().includes(intentData.category.toLowerCase().split(' ')[0]));
                        if (found) query += `category=${found.id}&`;
                    }

                    if (intentData.location) query += `city=${intentData.location}&`;
                    if (intentData.max_budget) query += `max_price=${intentData.max_budget}&`;

                    router.push(query);
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = { id: Date.now() + 2, text: "Sorry, I'm having trouble connecting. Please try again later.", sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };


    return (
        <div className="fixed bottom-6 right-6 z-[60]" suppressHydrationWarning>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-80 sm:w-96 flex flex-col mb-4 h-[450px]"
                        suppressHydrationWarning
                    >
                        {/* Header */}
                        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold">HomeCare Helper</h3>
                                    <p className="text-xs text-blue-100 flex items-center">
                                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-blue-700/50 p-1 rounded-full transition-colors"
                                aria-label="Close chat"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-grow p-4 overflow-y-auto bg-gray-50/50 flex flex-col space-y-4 scroll-smooth"
                        >
                            {/* Welcome Suggestions (only shown at start or top) */}
                            {messages.length <= 1 && (
                                <div className="space-y-3 mb-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[2rem] p-6 text-center shadow-inner">
                                        <div className="text-4xl mb-4 animate-bounce">🤖</div>
                                        <h4 className="text-lg font-black text-blue-900 mb-2">Hello, I'm HomeCare AI</h4>
                                        <p className="text-sm text-blue-700/80 font-medium">I can help you find services, manage bookings, and more. Try a suggestion below!</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 pt-2">
                                        {SUGGESTIONS.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSuggestionClick(s.text)}
                                                className="bg-white border border-gray-100 hover:border-blue-500 hover:bg-blue-50 text-[12px] font-bold text-gray-700 px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 text-left flex items-center justify-between group"
                                            >
                                                <span>{s.label}</span>
                                                <span className="text-gray-300 group-hover:text-blue-500 transition-colors">→</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                        {msg.intent && (
                                            <div className="mt-2.5 pt-2.5 border-t border-gray-100 text-[9px] font-black uppercase tracking-widest flex items-center">
                                                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full transform -skew-x-12">
                                                    AI Discovery: {msg.intent}
                                                </span>
                                            </div>
                                        )}

                                        {/* Inline Results for Global Availability */}
                                        {searchResults[msg.id] && (
                                            <div className="mt-4 space-y-2.5">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-tight">Best Matches found</p>
                                                </div>
                                                {searchResults[msg.id].map(service => (
                                                    <Link
                                                        key={service.id}
                                                        href={`/services/${service.id}`}
                                                        className="block bg-gray-50 p-2.5 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-white transition-all group/res hover:shadow-md"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="relative w-12 h-12 rounded-lg bg-white flex-shrink-0 border border-gray-100 overflow-hidden group-hover/res:scale-105 transition-transform">
                                                                <Image
                                                                    src={service.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6954?auto=format&fit=crop&w=100&q=60'}
                                                                    alt=""
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-grow overflow-hidden">
                                                                <h4 className="text-[12px] font-bold text-gray-900 truncate group-hover/res:text-blue-600 transition-colors">
                                                                    {service.title}
                                                                </h4>
                                                                <p className="text-[11px] font-black text-blue-600 mt-0.5">
                                                                    Rs. {service.price_per_hour}/hr
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                                <Link
                                                    href="/services"
                                                    className="inline-flex items-center justify-center w-full py-2 bg-blue-50 text-[10px] font-black text-blue-700 rounded-lg hover:bg-blue-100 transition-colors mt-1"
                                                >
                                                    View detail listing →
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 rounded-tl-none flex space-x-1.5 items-center">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                        <span className="text-[10px] text-gray-400 font-bold ml-1">AI is thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={handleSend}
                            className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2 shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)]"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask HomeCare AI..."
                                className="flex-grow bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium placeholder:text-gray-400"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 transition-all active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9, rotate: -5 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`${isOpen ? 'bg-gray-900' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    } text-white p-5 rounded-full shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)] transition-all relative border-2 border-white/20`}
                aria-label="Toggle chat"
            >
                {isOpen ? <X className="w-8 h-8" /> : <Bot className="w-8 h-8" />}
                {!isOpen && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full border-[3px] border-white shadow-lg animate-pulse"></span>
                )}
            </motion.button>
        </div>
    );
});

ChatbotWidget.displayName = 'ChatbotWidget';

export default ChatbotWidget;
