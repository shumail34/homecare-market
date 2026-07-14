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
    Banknote, List, Bell, Users, User, ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProviderDashboard() {
    const { user, wallet, refreshWallet } = useAuth();
    const [stats, setStats] = useState({
        pending: 0,
        accepted: 0,
        completed: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await api.get('bookings/provider/');
                const bookings = response.data.results || response.data || [];

                const counts = {
                    pending: bookings.filter(b => b.status === 'PENDING').length,
                    accepted: bookings.filter(b => b.status === 'ACCEPTED').length,
                    completed: bookings.filter(b => b.status === 'COMPLETED').length
                };
                setStats(counts);
                setRecentBookings(bookings.slice(0, 5));
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoadingBookings(false);
            }
        };

        fetchBookings();
        // Background refresh wallet balance in case some orders finished
        refreshWallet();
    }, []);

    // Helper to format values derived from wallet
    const walletBalance = wallet ? parseFloat(wallet.commission_balance) : 0;
    const totalEarnings = wallet ? parseFloat(wallet.total_earning) : 0;
    const accountStatus = wallet ? wallet.account_status : 'Active';

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                {/* Welcome Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Partner Portal: {user?.full_name}</h1>
                        <p className="text-gray-600 mt-1 font-medium">Manage your business operations and track performance.</p>
                    </motion.div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/provider/services"
                            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center active:scale-95"
                        >
                            <List className="mr-2 w-5 h-5" />
                            My Services
                        </Link>
                    </div>
                </div>

                {/* Restriction Alert */}
                {accountStatus?.includes('Restricted') && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-6 bg-red-50 border border-red-100 text-red-700 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-2xl">
                                <ShieldAlert className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Account Restricted</h2>
                                <p className="text-sm opacity-80">Outstanding balance is too high. Please settle to resume bookings.</p>
                            </div>
                        </div>
                        <Link href="/provider/wallet" className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md active:scale-95 whitespace-nowrap text-sm">
                            Settle Balance
                        </Link>
                    </motion.div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        {
                            label: walletBalance < 0 ? 'Outstanding Balance' : 'Wallet Balance',
                            value: `PKR ${parseFloat(walletBalance || 0).toLocaleString()}`,
                            icon: Banknote,
                            color: walletBalance < 0 ? 'red' : 'blue'
                        },
                        { label: 'Total Earnings', value: `PKR ${parseFloat(totalEarnings || 0).toLocaleString()}`, icon: TrendingUp, color: 'green' },
                        { label: 'Active Jobs', value: stats.accepted, icon: Clock, color: 'indigo' },
                        { label: 'Jobs Done', value: stats.completed, icon: CheckCircle2, color: 'orange' }
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-6 rounded-3xl shadow-sm border flex items-center space-x-5 ${stat.color === 'red' ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}
                        >
                            <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>{stat.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main: Recent Bookings */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Recent Service Requests</h2>
                                <Link href="/provider/bookings" className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">Customer</th>
                                            <th className="px-6 py-4 font-bold">Service</th>
                                            <th className="px-6 py-4 font-bold">Date</th>
                                            <th className="px-6 py-4 font-bold">Status</th>
                                            <th className="px-6 py-4 font-bold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {recentBookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mr-3">
                                                            {(booking.customer?.full_name || 'U')[0]}
                                                        </div>
                                                        <span className="text-gray-900 text-sm font-bold">{booking.customer?.full_name || 'Anonymous'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-800 text-sm font-medium">{booking.service?.title}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-900 text-xs font-bold">{new Date(booking.scheduled_date).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${booking.status === 'PENDING' ? 'bg-orange-50 text-orange-600' :
                                                        booking.status === 'ACCEPTED' ? 'bg-blue-50 text-blue-600' :
                                                            booking.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                                                                'bg-red-50 text-red-600'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href="/provider/bookings" className="text-blue-600 hover:text-blue-700">
                                                        <ChevronRight className="w-5 h-5 ml-auto" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {recentBookings.length === 0 && (
                                <div className="p-12 text-center text-gray-800">
                                    <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p>No service requests yet. Make sure your services are visible!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Quick Actions & Profile */}
                    <div className="space-y-10">
                        <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Briefcase className="w-24 h-24" />
                            </div>
                            <h3 className="text-xl font-bold mb-6 tracking-tight flex items-center">
                                <List className="w-5 h-5 mr-3 text-blue-500" />
                                Business Menu
                            </h3>
                            <div className="space-y-4">
                                <Link href="/provider/bookings" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group">
                                    <div className="flex items-center">
                                        <Calendar className="w-5 h-5 mr-3" />
                                        <span className="font-bold">Job Requests</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/provider/services" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group">
                                    <div className="flex items-center">
                                        <List className="w-5 h-5 mr-3" />
                                        <span className="font-bold">My Services</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/provider/wallet" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group">
                                    <div className="flex items-center">
                                        <Banknote className="w-5 h-5 mr-3" />
                                        <span className="font-bold">Earnings & Wallet</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/provider/profile" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group">
                                    <div className="flex items-center">
                                        <User className="w-5 h-5 mr-3" />
                                        <span className="font-bold">Profile Info</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold mb-6 flex items-center">
                                <Users className="w-6 h-6 mr-2 text-blue-600" />
                                Partner Insights
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between font-bold">
                                    <p className="text-sm text-gray-900 opacity-60">Profile Visibility</p>
                                    <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-lg">High</span>
                                </div>
                                <div className="flex items-center justify-between font-bold">
                                    <p className="text-sm text-gray-900 opacity-60">Average Rating</p>
                                    <div className="flex items-center text-yellow-500">
                                        <Star className="w-4 h-4 fill-current mr-1" />
                                        {user?.average_rating || '5.0'}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between font-bold">
                                    <p className="text-sm text-gray-900 opacity-60">Response Rate</p>
                                    <span className="text-gray-900">98%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-2xl text-white">
                            <h3 className="text-xl font-bold mb-2 italic">Grow Your Business</h3>
                            <p className="text-blue-100 text-sm mb-6 font-bold opacity-80">Create more service listings to reach more customers and increase your earnings.</p>
                            <Link
                                href="/provider/services"
                                className="bg-white text-blue-600 w-full py-4 rounded-2xl font-black shadow-lg hover:bg-blue-50 transition-all flex items-center justify-center active:scale-95 text-sm uppercase"
                            >
                                Add New Service Listing
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
