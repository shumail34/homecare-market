"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for existing session on mount
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('auth/login/', {
                email: email,
                password: password,
            });

            const { access, refresh, user: userData } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);

            // Redirect based on role
            if (userData.role === 'CUSTOMER') {
                router.push('/customer/dashboard');
            } else {
                router.push('/provider/dashboard');
            }

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            const msg = error.response?.data?.non_field_errors?.[0] ||
                error.response?.data?.password?.[0] ||
                error.response?.data?.email?.[0] ||
                error.response?.data?.message ||
                error.response?.data?.detail ||
                'Invalid email or password';
            return {
                success: false,
                message: msg,
                errors: error.response?.data
            };
        }
    };

    const register = async (userData) => {
        try {
            await api.post('auth/register/', userData);
            return { success: true, message: 'OTP sent to your email' };
        } catch (error) {
            console.error('Registration error:', error.response?.data);
            const data = error.response?.data || {};
            const eMsg = data.email?.[0] || data.password?.[0] || data.full_name?.[0] || data.message || 'Registration failed';
            return {
                success: false,
                message: eMsg,
                errors: data
            };
        }
    };

    const sendOTP = async (email) => {
        try {
            await api.post('auth/login/', { email: email });
            return { success: true, message: 'OTP sent successfully' };
        } catch (error) {
            console.error('OTP error:', error);
            const msg = error.response?.data?.non_field_errors?.[0] || error.response?.data?.message || 'Could not send OTP';
            return {
                success: false,
                message: msg
            };
        }
    };

    const refreshUser = async () => {
        try {
            const response = await api.get('auth/profile/');
            localStorage.setItem('user', JSON.stringify(response.data));
            setUser(response.data);
            return { success: true };
        } catch (error) {
            console.error('Refresh user error:', error);
            return { success: false };
        }
    };

    const forgotPassword = async (email) => {
        try {
            await api.post('auth/forgot-password/', { email });
            return { success: true, message: 'OTP sent to your email' };
        } catch (error) {
            console.error('Forgot password error:', error);
            const msg = error.response?.data?.email?.[0] || error.response?.data?.message || 'Failed to send OTP';
            return { success: false, message: msg };
        }
    };

    const resetPassword = async (email, otpCode, newPassword) => {
        try {
            await api.post('auth/reset-password/', {
                email,
                otp_code: otpCode,
                new_password: newPassword
            });
            return { success: true, message: 'Password reset successful' };
        } catch (error) {
            console.error('Reset password error:', error);
            const msg = error.response?.data?.detail || error.response?.data?.message || 'Password reset failed';
            return { success: false, message: msg };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    const [wallet, setWallet] = useState(null);
    const [fetchingWallet, setFetchingWallet] = useState(false);

    const refreshWallet = async () => {
        if (!user || user.role !== 'SERVICE_PROVIDER') return;
        setFetchingWallet(true);
        try {
            const response = await api.get('financials/wallet/');
            const walletData = response.data.results?.[0] || response.data[0] || response.data;
            setWallet(walletData);
        } catch (error) {
            console.error('Error refreshing wallet:', error);
        } finally {
            setFetchingWallet(false);
        }
    };

    // Auto refresh wallet on mount if user is provider
    useEffect(() => {
        if (user && user.role === 'SERVICE_PROVIDER' && !wallet) {
            refreshWallet();
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{
            user, loading, login, register, sendOTP, refreshUser,
            forgotPassword, resetPassword, logout, isAuthenticated: !!user,
            wallet, refreshWallet, fetchingWallet
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
