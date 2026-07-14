"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import {
    BarChart3, Users, Clock, CheckCircle2,
    XCircle, Eye, MessageSquare, ShieldAlert,
    TrendingUp, ArrowDownRight, ArrowUpRight,
    Search, Filter, Loader2, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminFinancialDashboard() {
    const [stats, setStats] = useState({
        totalCommission: 0,
        pendingApprovals: 0,
        restrictedProviders: 0,
        totalTransfers: 0
    });
    const [submissions, setSubmissions] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [walletsRes, subsRes] = await Promise.all([
                api.get('financials/wallet/'),
                api.get('financials/payments/')
            ]);

            const walletData = walletsRes.data.results || walletsRes.data;
            const subData = subsRes.data.results || subsRes.data;

            setWallets(walletData);
            setSubmissions(subData);

            // Calculate stats
            setStats({
                totalCommission: walletData.reduce((acc, w) => acc + parseFloat(w.platform_commission), 0),
                pendingApprovals: subData.filter(s => s.status === 'PENDING').length,
                restrictedProviders: walletData.filter(w => w.status === 'Restricted').length,
                totalTransfers: walletData.reduce((acc, w) => acc + parseFloat(w.amount_transferred_to_platform), 0)
            });
        } catch (err) {
            console.error('Error fetching admin data:', err);
            setError("Failed to load financial records.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        setProcessing(true);
        try {
            await api.post(`financials/payments/${id}/${action}/`, { admin_notes: adminNotes });
            setSelectedSubmission(null);
            setAdminNotes('');
            fetchAdminData();
        } catch (err) {
            console.error(`Error ${action}ing payment:`, err);
            alert(`Failed to ${action} payment.`);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">

                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <BarChart3 className="w-10 h-10 text-indigo-600" />
                            Financial Command Center
                        </h1>
                        <p className="text-gray-900 mt-2 font-bold opacity-70 italic">Oversee transactions, manage commissions, and approve provider payments.</p>
                    </div>
                </div>

                {/* Admin Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: 'Platform Commission', value: `PKR ${stats.totalCommission}`, icon: TrendingUp, color: 'green', desc: 'Total revenue from deals' },
                        { label: 'Pending Reviews', value: stats.pendingApprovals, icon: Clock, color: 'orange', desc: 'Awaiting your approval' },
                        { label: 'Restricted Partners', value: stats.restrictedProviders, icon: ShieldAlert, color: 'red', desc: 'Over credit limit' },
                        { label: 'Provider Transfers', value: `PKR ${stats.totalTransfers}`, icon: ArrowUpRight, color: 'blue', desc: 'Cash collected by platform' }
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100"
                        >
                            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-2 font-medium">{stat.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Submissions to Review */}
                    <div className="lg:col-span-2">
                        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <h2 className="text-2xl font-black italic flex items-center gap-2">
                                    <Clock className="w-6 h-6 text-orange-500" />
                                    Pending Payment Approvals
                                </h2>
                                <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                                    Action Required
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <tr>
                                            <th className="px-8 py-5">Provider</th>
                                            <th className="px-8 py-5">Amount (PKR)</th>
                                            <th className="px-8 py-5">TID</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {submissions.filter(s => s.status === 'PENDING').map((sub) => (
                                            <tr key={sub.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                                                            {sub.provider?.full_name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-900">{sub.provider?.full_name}</p>
                                                            <p className="text-[10px] text-gray-500 font-bold">{sub.provider?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 font-black text-lg">
                                                    {sub.amount}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-gray-700">
                                                        {sub.transaction_id}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => setSelectedSubmission(sub)}
                                                        className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-black text-xs uppercase hover:bg-gray-800 transition-all active:scale-95"
                                                    >
                                                        Review Proof
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {submissions.filter(s => s.status === 'PENDING').length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-20 text-center text-gray-400">
                                                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                                    <p className="font-bold">All clear! No pending payments to review.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Restricted Providers List */}
                        <section className="mt-12 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-red-50/30">
                                <h2 className="text-2xl font-black italic flex items-center gap-2 text-red-900">
                                    <ShieldAlert className="w-6 h-6 text-red-600" />
                                    Restricted Partners
                                </h2>
                                <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Balance Threshold Exceeded</span>
                            </div>
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <tr>
                                            <th className="px-8 py-4">Provider</th>
                                            <th className="px-8 py-4">Debt (PKR)</th>
                                            <th className="px-8 py-4">Cash Collected</th>
                                            <th className="px-8 py-4 text-right">Orders</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {wallets.filter(w => w.status === 'Restricted').map((wallet) => (
                                            <tr key={wallet.id}>
                                                <td className="px-8 py-5 font-black text-gray-900">{wallet.provider?.full_name}</td>
                                                <td className="px-8 py-5 text-red-600 font-black italic tracking-tighter">{wallet.current_balance}</td>
                                                <td className="px-8 py-5 font-bold text-gray-700">{wallet.cash_collected_from_customers}</td>
                                                <td className="px-8 py-5 text-right font-bold">{wallet.total_completed_orders_amount} (sum)</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Performance & Settings */}
                    <div className="space-y-12">
                        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black mb-8 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-gray-400" />
                                Settlement Policy
                            </h3>
                            <div className="space-y-6">
                                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Fee</p>
                                        <span className="text-blue-600 text-sm font-black">15%</span>
                                    </div>
                                    <p className="text-xs text-gray-600 font-medium">Standard commission deducted on job completion.</p>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Restriction Limit</p>
                                        <span className="text-red-600 text-sm font-black">-PKR 10,000</span>
                                    </div>
                                    <p className="text-xs text-gray-600 font-medium">Providers are blocked after exceeding this amount.</p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-indigo-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black italic mb-2 tracking-tighter">Marketplace Growth</h3>
                                <p className="text-indigo-200 text-sm font-bold opacity-80 mb-8">Weekly settlement reports will be generated every Sunday midnight automatically.</p>
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-white/10 rounded-2xl flex-grow">
                                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Next Settlement</p>
                                        <p className="text-lg font-black italic">Sunday, 12:00 AM</p>
                                    </div>
                                    <button className="p-4 bg-indigo-600 rounded-2xl group-hover:bg-indigo-500 transition-all h-full">
                                        <Clock className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <TrendingUp className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                        </section>
                    </div>
                </div>
            </main>

            {/* Proof Review Modal */}
            <AnimatePresence>
                {selectedSubmission && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedSubmission(null)}
                            className="absolute inset-0 bg-gray-900/90 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, rotateX: 20 }}
                            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                            exit={{ scale: 0.9, opacity: 0, rotateX: 20 }}
                            className="relative bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/20"
                        >
                            <div className="md:w-1/2 bg-black flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 to-black">
                                <img
                                    src={selectedSubmission.screenshot}
                                    className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl border-4 border-white/10"
                                    alt="Payment Screenshot"
                                />
                            </div>
                            <div className="md:w-1/2 p-12 flex flex-col">
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <h2 className="text-3xl font-black italic tracking-tighter">Review Submission</h2>
                                        <p className="text-indigo-600 font-bold text-sm tracking-tight">{selectedSubmission.provider?.full_name}</p>
                                    </div>
                                    <button onClick={() => setSelectedSubmission(null)} className="p-3 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-all active:scale-95">
                                        <XCircle className="w-6 h-6 text-gray-400" />
                                    </button>
                                </div>

                                <div className="space-y-8 flex-grow">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Transferred Amount</p>
                                            <p className="text-3xl font-black tracking-tighter italic">PKR {selectedSubmission.amount}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Transaction ID</p>
                                            <p className="text-xl font-black tabular-nums font-mono text-indigo-700">{selectedSubmission.transaction_id}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Admin Notes / Reason</label>
                                        <textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 font-bold text-gray-900 focus:border-indigo-600 outline-none transition-all placeholder:text-gray-200"
                                            rows="4"
                                            placeholder="Add comments for the provider (optional or required for rejection)..."
                                        />
                                    </div>
                                </div>

                                <div className="mt-12 flex gap-4">
                                    <button
                                        onClick={() => handleAction(selectedSubmission.id, 'reject')}
                                        disabled={processing}
                                        className="flex-grow bg-red-50 text-red-600 py-5 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] border-2 border-red-100 hover:bg-red-100 transition-all disabled:opacity-50"
                                    >
                                        Reject Payment
                                    </button>
                                    <button
                                        onClick={() => handleAction(selectedSubmission.id, 'approve')}
                                        disabled={processing}
                                        className="flex-grow bg-indigo-600 text-white py-5 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                        Approve & Update Wallet
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}
