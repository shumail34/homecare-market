"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
    Calendar, CheckCircle2, Clock, Briefcase,
    ChevronRight, TrendingUp, Star, Loader2,
    Settings, User, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CustomerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        pending: 0,
        accepted: 0,
        completed: 0
    });
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [bookingsRes, recsRes] = await Promise.all([
                    api.get('bookings/customer/'),
                    api.post('ai/recommendations/', { limit: 3 })
                ]);

                const bookings = bookingsRes.data.results || bookingsRes.data;
                const counts = {
                    pending: bookings.filter(b => b.status === 'PENDING').length,
                    accepted: bookings.filter(b => b.status === 'ACCEPTED').length,
                    completed: bookings.filter(b => b.status === 'COMPLETED').length,
                };
                setStats(counts);
                setRecommendations(recsRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" suppressHydrationWarning>
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full" suppressHydrationWarning>
                {/* Welcome Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-3xl font-extrabold text-gray-900">Welcome back, {user?.full_name}! 👋</h1>
                        <p className="text-gray-800 mt-1">Hero's your current home maintenance status.</p>
                    </motion.div>

                    <Link
                        href="/services"
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center active:scale-95"
                    >
                        Book a New Service
                        <ChevronRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                    {[
                        { label: 'Pending Requests', value: stats.pending, icon: Clock, color: 'orange' },
                        { label: 'Upcoming Jobs', value: stats.accepted, icon: Calendar, color: 'blue' },
                        { label: 'Completed Services', value: stats.completed, icon: CheckCircle2, color: 'green' }
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-5"
                        >
                            <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                                <stat.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-black text-blue-600">{stat.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main: AI Recommendations */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                                AI-Recommended for You
                            </h2>
                            <Link href="/services" className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
                        </div>

                        <div className="space-y-6">
                            {recommendations.map((rec, idx) => (
                                <motion.div
                                    key={rec.service.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-all group"
                                >
                                    <div className="w-full sm:w-48 h-32 rounded-2xl overflow-hidden shadow-inner bg-gray-100 shrink-0">
                                        {(() => {
                                            const backendUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/', '') : 'http://127.0.0.1:8000';
                                            const sep = (backendUrl.endsWith('/') || (rec.service.image && rec.service.image.startsWith('/'))) ? '' : '/';
                                            const imageUrl = rec.service.image
                                                ? (rec.service.image.startsWith('http') ? rec.service.image : `${backendUrl}${sep}${rec.service.image}`)
                                                : "https://images.unsplash.com/photo-1581578731548-c64695cc6954?auto=format&fit=crop&w=400&q=60";
                                            return (
                                                <img
                                                    src={imageUrl}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    alt={rec.service.title}
                                                />
                                            );
                                        })()}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{rec.service.category_name}</span>
                                                <h3 className="text-xl font-bold text-gray-900 mt-1">{rec.service.title}</h3>
                                            </div>
                                            <div className="bg-green-50 px-3 py-1 rounded-lg text-green-600 text-xs font-bold">
                                                AI Match: {Math.round(rec.score * 100)}%
                                            </div>
                                        </div>
                                        <div className="flex items-center mt-3 text-sm text-gray-900 space-x-4 font-bold">
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                                                {rec.service.average_rating || '5.0'}
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                                                Karachi
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <p className="text-lg font-extrabold text-blue-600">Rs. {rec.service.price_per_hour}/hr</p>
                                            <Link
                                                href={`/services/${rec.service.id}`}
                                                className="text-gray-900 border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all active:scale-95"
                                            >
                                                Book Now
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Quick Actions & Profile */}
                    <div className="space-y-10">
                        <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Briefcase className="w-24 h-24" />
                            </div>
                            <h3 className="text-xl font-bold mb-6">Quick Links</h3>
                            <div className="space-y-4">
                                <Link href="/customer/bookings" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group">
                                    <div className="flex items-center">
                                        <Calendar className="w-5 h-5 mr-3" />
                                        <span className="font-medium">My Bookings</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/customer/profile" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group">
                                    <div className="flex items-center">
                                        <User className="w-5 h-5 mr-3" />
                                        <span className="font-medium">Account Settings</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/services" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group">
                                    <div className="flex items-center">
                                        <TrendingUp className="w-5 h-5 mr-3" />
                                        <span className="font-medium">Featured Experts</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        <div className="bg-blue-600 p-8 rounded-3xl shadow-2xl text-white">
                            <h3 className="text-xl font-bold mb-2">Need Help?</h3>
                            <p className="text-blue-100 text-sm mb-6">Our AI Chatbot and support team are available 24/7 to assist you.</p>
                            <button className="bg-white text-blue-600 w-full py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-50 transition-all active:scale-95">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
