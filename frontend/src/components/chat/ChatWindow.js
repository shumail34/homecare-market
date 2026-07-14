"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Loader2, Circle } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const ChatWindow = ({ bookingId, recipientName }) => {
    const { user } = useAuth();
    const { messages, setMessages, isConnected, sendMessage, sendTyping, isTyping, typingUser } = useChat(bookingId);
    const [inputValue, setInputValue] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        // Load chat history
        const fetchHistory = async () => {
            try {
                const response = await api.get(`chat/history/${bookingId}/`);
                setMessages(response.data.messages);
            } catch (error) {
                console.error("Failed to load chat history", error);
            } finally {
                setLoadingHistory(false);
            }
        };

        if (bookingId) fetchHistory();
    }, [bookingId, setMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            sendMessage(inputValue.trim());
            setInputValue('');
            sendTyping(false);
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        if (e.target.value.length > 0) {
            sendTyping(true);
        } else {
            sendTyping(false);
        }
    };

    if (loadingHistory) {
        return (
            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-3xl border border-gray-100 h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden h-[600px]">
            {/* Header */}
            <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-wide">{recipientName || 'Chat'}</h3>
                        <div className="flex items-center text-[10px] opacity-80 uppercase tracking-tighter">
                            <Circle className={`w-2 h-2 mr-1 fill-current ${isConnected ? 'text-green-400' : 'text-gray-400'}`} />
                            {isConnected ? 'Online' : 'Reconnecting...'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/50"
            >
                {messages.map((msg, idx) => {
                    const isMe = String(msg.sender) === String(user?.id);
                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}>
                                <p className="leading-relaxed">{msg.content}</p>
                                <div className={`flex items-center justify-end text-[10px] mt-1 space-x-1 ${isMe ? 'text-blue-50' : 'text-gray-400'}`}>
                                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {isMe && (
                                        <span className={`font-bold ${msg.is_read ? 'text-sky-300' : 'opacity-60'}`}>
                                            {msg.is_read || msg.is_delivered ? '✓✓' : '✓'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {isTyping && typingUser && (
                    <div className="flex justify-start">
                        <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-2xl text-[11px] text-gray-500 italic shadow-sm border border-gray-50 animate-pulse">
                            {typingUser} is typing...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={() => sendTyping(false)}
                        placeholder="Type your message..."
                        className="flex-grow px-5 py-3 bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 rounded-2xl text-sm transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || !isConnected}
                        className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-100"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
