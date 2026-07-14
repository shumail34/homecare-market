"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Phone, Lock, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setLoading(true);

        const res = await login(email, password);
        if (!res.success) {
            if (res.errors) {
                setFieldErrors(res.errors);
            }
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100"
                >
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-800">
                            Login with your email and password to continue
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center text-sm animate-shake">
                            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                            {message}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setFieldErrors({ ...fieldErrors, email: null });
                                        }}
                                        className={`appearance-none relative block w-full px-4 py-3 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-700 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                        placeholder="name@example.com"
                                    />
                                    {fieldErrors.email && (
                                        <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{fieldErrors.email[0]}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" title="Enter your password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-700" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setFieldErrors({ ...fieldErrors, password: null });
                                        }}
                                        className={`appearance-none relative block w-full pl-12 pr-4 py-3 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-700 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                        placeholder="••••••••"
                                    />
                                    {fieldErrors.password && (
                                        <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{fieldErrors.password[0]}</p>
                                    )}
                                </div>
                                <div className="flex justify-end mt-2">
                                    <Link href="/forgot-password" title="Click to reset password" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Login
                                        <ChevronRight className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <span className="text-sm text-gray-700">Don't have an account? </span>
                            <Link href="/register" className="text-sm font-bold text-blue-600 hover:text-blue-500">
                                Register New
                            </Link>
                        </div>
                    </form>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
