"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';

const RealtimeContext = createContext();

export const RealtimeProvider = ({ children }) => {
    const { user } = useAuth();
    const [lastNotification, setLastNotification] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!user) {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
            return;
        }

        const token = localStorage.getItem('access_token');
        if (!token) return;

        // Construct WS URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL.replace('http://', '').replace('https://', '').split('/')[0]
            : '127.0.0.1:8000';

        const wsUrl = `${protocol}//${host}/ws/notifications/?token=${token}`;

        console.log("Connecting to Global Notifications Socket...");
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Real-time Notification Received:", data);
                setLastNotification({
                    ...data,
                    timestamp: Date.now()
                });

                // Global event dispatch for non-context listeners
                window.dispatchEvent(new CustomEvent('app-notification', { detail: data }));
            } catch (err) {
                console.error("WS Parse Error:", err);
            }
        };

        socket.onclose = () => {
            console.log("Global Notifications Socket Closed.");
            // Reconnect logic can be added here if needed
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [user]);

    return (
        <RealtimeContext.Provider value={{ lastNotification }}>
            {children}
        </RealtimeContext.Provider>
    );
};

export const useRealtime = () => useContext(RealtimeContext);
