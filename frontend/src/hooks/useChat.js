import { useState, useEffect, useRef, useCallback } from 'react';

export const useChat = (bookingId) => {
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState('');
    const socketRef = useRef(null);
    const retryTimeoutRef = useRef(null);
    const retryCountRef = useRef(0);
    const isUnmountedRef = useRef(false);

    const connect = useCallback(() => {
        if (isUnmountedRef.current) return;
        if (!bookingId) return;

        const token = localStorage.getItem('access_token');
        if (!token) {
            console.warn('[Chat] No access token found, cannot connect.');
            return;
        }

        // Close any existing socket cleanly before opening new one
        if (socketRef.current) {
            socketRef.current.onclose = null; // prevent reconnect trigger on intentional close
            socketRef.current.close();
        }

        const wsBase = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000';
        const url = `${wsBase}/ws/chat/${bookingId}/?token=${token}`;
        console.log(`[Chat] Connecting to: ${url} (attempt ${retryCountRef.current + 1})`);

        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = () => {
            if (isUnmountedRef.current) {
                socket.close();
                return;
            }
            console.log('[Chat] WebSocket connected.');
            setIsConnected(true);
            retryCountRef.current = 0; // reset retry count on success
            socket.send(JSON.stringify({ type: 'read_receipt' }));
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'chat_message') {
                    const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
                    setMessages((prev) => [...prev, {
                        id: data.message_id || Date.now(),
                        sender_name: data.sender,
                        sender: data.sender_id,
                        content: data.message,
                        timestamp: data.timestamp || new Date().toISOString(),
                        is_read: false,
                        is_delivered: false
                    }]);
                    if (String(data.sender_id) !== String(userId)) {
                        socket.send(JSON.stringify({ type: 'read_receipt' }));
                    }
                } else if (data.type === 'status_update') {
                    const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
                    setMessages(prev => prev.map(m => {
                        if (String(m.sender) === String(userId)) {
                            if (data.status === 'read') return { ...m, is_read: true, is_delivered: true };
                            if (data.status === 'delivered') return { ...m, is_delivered: true };
                        }
                        return m;
                    }));
                } else if (data.type === 'typing') {
                    setTypingUser(data.is_typing ? data.user : '');
                    setIsTyping(data.is_typing);
                }
            } catch (e) {
                console.error('[Chat] Failed to parse message:', e);
            }
        };

        socket.onclose = (event) => {
            if (isUnmountedRef.current) return;
            console.log(`[Chat] WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
            setIsConnected(false);
            setIsTyping(false);

            // Exponential backoff retry: 2s, 4s, 8s, max 16s
            const delay = Math.min(2000 * Math.pow(2, retryCountRef.current), 16000);
            retryCountRef.current += 1;
            console.log(`[Chat] Reconnecting in ${delay / 1000}s...`);
            retryTimeoutRef.current = setTimeout(connect, delay);
        };

        socket.onerror = (err) => {
            console.error('[Chat] WebSocket error:', err);
            // onclose will handle reconnect
        };
    }, [bookingId]);

    useEffect(() => {
        isUnmountedRef.current = false;
        retryCountRef.current = 0;
        connect();

        return () => {
            isUnmountedRef.current = true;
            clearTimeout(retryTimeoutRef.current);
            if (socketRef.current) {
                socketRef.current.onclose = null; // prevent reconnect on unmount
                socketRef.current.close();
            }
        };
    }, [connect]);

    const sendMessage = useCallback((content) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'chat_message',
                message: content
            }));
        } else {
            console.warn('[Chat] Cannot send: socket not open.');
        }
    }, []);

    const sendTyping = useCallback((isTypingNow) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'typing',
                is_typing: isTypingNow
            }));
        }
    }, []);

    return { messages, setMessages, isConnected, sendMessage, sendTyping, isTyping, typingUser };
};
