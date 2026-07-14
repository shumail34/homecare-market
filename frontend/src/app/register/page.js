"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Phone, Briefcase, Lock, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
    const { register, login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        phone: '',
        password: '',
        role: 'CUSTOMER',
    });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: details, 2: otp
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await register(formData);
        if (res.success) {
            setStep(2);
            setMessage(res.message);
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const verifyRes = await verifyOTP(formData.email, otp);
        if (verifyRes.success) {
            const loginRes = await login(formData.email, formData.password);
            if (!loginRes.success) {
                setError(loginRes.message);
                setLoading(false);
            }
        } else {
            setError(verifyRes.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100"
                >
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            {step === 1 ? 'Create Account' : 'Final Step'}
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-800">
                            {step === 1
                                ? 'Join Home-Care Market today'
                                : `Enter verification code for ${formData.email}`
                            }
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center text-sm animate-shake">
                            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center text-sm text-center">
                            {message}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={step === 1 ? handleRegister : handleVerifyOTP}>
                        {step === 1 ? (
                            <div className="space-y-4">

                                <div>
                                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-700" />
                                        </div>
                                        <input
                                            id="full_name"
                                            name="full_name"
                                            type="text"
                                            required
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="appearance-none relative block w-full pl-12 pr-4 py-3 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number (Optional)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-700" />
                                        </div>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="appearance-none relative block w-full pl-12 pr-4 py-3 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="+92 300 1234567"
                                        />
                                    </div>
                                </div>

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
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" title="Password must be at least 6 characters" className="block text-sm font-medium text-gray-700 mb-2">
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
                                            minLength="6"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="appearance-none relative block w-full pl-12 pr-4 py-3 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Code
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-700" />
                                    </div>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        maxLength="6"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="appearance-none relative block w-full pl-12 pr-4 py-3 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all tracking-[0.5em] text-center font-bold"
                                        placeholder="000000"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="mt-4 text-sm text-blue-600 hover:text-blue-500 font-medium"
                                >
                                    Edit details?
                                </button>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {step === 1 ? 'Join the Community' : 'Verify & Continue'}
                                        <ChevronRight className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <span className="text-sm text-gray-700">Already have an account? </span>
                            <Link href="/login" className="text-sm font-bold text-blue-600 hover:text-blue-500">
                                Log In
                            </Link>
                        </div>
                    </form>
                </motion.div>
            </main >
            <Footer />
        </div >
    );
}
