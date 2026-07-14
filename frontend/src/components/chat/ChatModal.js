"use client";

import React from 'react';
import { X } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { motion, AnimatePresence } from 'framer-motion';

const ChatModal = ({ isOpen, onClose, bookingId, recipientName }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg z-10"
                    >
                        <button
                            onClick={onClose}
                            className="absolute -top-12 right-0 text-white hover:text-gray-200 transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <ChatWindow
                            bookingId={bookingId}
                            recipientName={recipientName}
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ChatModal;
