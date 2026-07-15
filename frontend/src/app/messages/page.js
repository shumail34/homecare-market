"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import {
    MessageSquare, Search, Loader2, ChevronRight,
    Calendar, User, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import ChatModal from '@/components/chat/ChatModal';

export default function MessagesPage() {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const fetchChats = async () => {
        try {
            const res = await api.get('chat/my-chats/');
            setChats(res.data.results || res.data);
        } catch (e) {
            console.error('Fetch chats error:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    const filteredChats = chats.filter(chat =>
        chat.partner_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getImageUrl = (url) => {
        if (!url) return null;
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');
        return url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50" suppressHydrationWarning>
            <Navbar />
            <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full" suppressHydrationWarning>
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4" suppressHydrationWarning>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Messages</h1>
                        <p className="text-gray-600 mt-1">Communicate with your service providers and clients.</p>
                    </div>

                    <div className="relative max-w-md w-full" suppressHydrationWarning>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24" suppressHydrationWarning>
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                ) : filteredChats.length > 0 ? (
                    <div className="grid gap-4" suppressHydrationWarning>
                        {filteredChats.map((chat, index) => (
                            <motion.div
                                key={chat.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => {
                                    setSelectedChat(chat);
                                    setIsChatOpen(true);
                                }}
                                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer flex items-center gap-5 group"
                            >
                                <div className="relative flex-shrink-0" suppressHydrationWarning>
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-gray-100">
                                        {chat.partner_picture_url ? (
                                            <img
                                                src={getImageUrl(chat.partner_picture_url)}
                                                alt={chat.partner_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-8 h-8 text-blue-300" />
                                        )}
                                    </div>
                                    {chat.unread_count > 0 && (
                                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                            {chat.unread_count}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-grow min-w-0" suppressHydrationWarning>
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-extrabold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                            {chat.partner_name}
                                        </h3>
                                        {chat.last_message && (
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {new Date(chat.last_message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate font-medium">
                                        {chat.last_message ? chat.last_message.content : 'Start a conversation...'}
                                    </p>
                                    <div className="flex items-center mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 w-fit px-2 py-1 rounded-lg border border-gray-100">
                                        <Calendar className="w-3 h-3 mr-1.5 text-blue-400" />
                                        Booking #{chat.booking}
                                    </div>
                                </div>

                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200" suppressHydrationWarning>
                        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <MessageSquare className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">No conversations found</h3>
                        <p className="mt-2 text-gray-600 font-medium">Your chats for active bookings will appear here.</p>
                    </div>
                )}

                {selectedChat && (
                    <ChatModal
                        isOpen={isChatOpen}
                        onClose={() => {
                            setIsChatOpen(false);
                            fetchChats(); // Refresh unread counts
                        }}
                        bookingId={selectedChat.booking}
                        recipientName={selectedChat.partner_name}
                    />
                )}
            </main>
            <Footer />
        </div>
    );
}
