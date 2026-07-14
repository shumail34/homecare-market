"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, ChevronRight, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
    const { forgotPassword, resetPassword } = useAuth();
    const [step, setStep] = useState(1); // 1: Email, 2: Reset
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await forgotPassword(email);
        if (res.success) {
            setMessage('OTP sent to your email.');
            setStep(2);
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        const res = await resetPassword(email, otp, newPassword);
        if (res.success) {
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex items-center justify-center py-12 px-4 bg-gray-50">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100"
                >
                    <div className="flex flex-col items-center">
                        <Link href="/login" className="self-start flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Login
                        </Link>
                        <h2 className="text-center text-3xl font-extrabold text-gray-900">
                            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            {step === 1
                                ? "No worries! Enter your email and we'll send you an OTP."
                                : `Enter the 6-digit code sent to ${email}`}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center text-sm animate-shake">
                            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-blue-50 text-blue-600 p-4 rounded-xl flex items-center text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                            {message}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                                onSubmit={handleRequestOTP}
                            >
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset OTP'}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                                onSubmit={handleResetPassword}
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit OTP</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="000000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
