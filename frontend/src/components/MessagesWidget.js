"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Inbox, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { usePathname } from 'next/navigation';

const MessagesWidget = () => {
    const { isAuthenticated, user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await api.get('chat/unread-count/');
                setUnreadCount(res.data.unread || 0);
            } catch (e) {
                console.error('Fetch unread error:', e);
            }
        };

        if (isAuthenticated && pathname !== '/messages') {
            fetchUnread();

            // Listen for Real-time message counts
            const handleNotification = (event) => {
                if (event.detail.type === 'NEW_MESSAGE') {
                    console.log("Real-time Message Count Refresh...");
                    fetchUnread();
                }
            };

            window.addEventListener('app-notification', handleNotification);
            return () => window.removeEventListener('app-notification', handleNotification);
        }
    }, [isAuthenticated, pathname]);

    // Don't render on the messages page itself or if not logged in
    if (!isAuthenticated || pathname === '/messages') return null;

    return (
        <div className="fixed bottom-24 right-6 z-[60]" suppressHydrationWarning>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Link
                    href="/messages"
                    className="bg-white text-blue-600 p-4 rounded-full shadow-2xl border border-blue-50 flex items-center justify-center relative group transition-all hover:bg-blue-50"
                >
                    <Inbox className="w-7 h-7" />

                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </motion.span>
                        )}
                    </AnimatePresence>

                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 px-3 py-1.5 bg-gray-900 border-gray-100 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                        View Inbox
                        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                </Link>
            </motion.div>
        </div>
    );
};

export default MessagesWidget;
