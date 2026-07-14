"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
    Wallet, Banknote, History, ArrowUpRight,
    ArrowDownLeft, AlertCircle, Plus, Loader2,
    CheckCircle2, XCircle, Clock, ShieldAlert,
    TrendingUp, Receipt, Info, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WalletPage() {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [paymentData, setPaymentData] = useState({ amount: '', transaction_id: '', screenshot: null });
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null);

    useEffect(() => { fetchWalletData(); }, []);

    const fetchWalletData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const [walletRes, subsRes] = await Promise.all([
                api.get('financials/wallet/'),
                api.get('financials/payments/')
            ]);
            const walletData = walletRes.data.results?.[0] || walletRes.data[0] || walletRes.data;
            setWallet(walletData);
            setSubmissions(subsRes.data.results || subsRes.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching wallet data:', err);
            setError("Unable to load wallet information. Please refresh.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);
        const formData = new FormData();
        formData.append('amount', paymentData.amount);
        formData.append('transaction_id', paymentData.transaction_id);
        if (paymentData.screenshot) formData.append('screenshot', paymentData.screenshot);
        try {
            await api.post('financials/payments/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPaymentData({ amount: '', transaction_id: '', screenshot: null });
            setSubmitSuccess(true);
            setTimeout(() => {
                setSubmitSuccess(false);
                setShowSubmitModal(false);
                fetchWalletData();
            }, 2000);
        } catch (err) {
            console.error('Payment submission error:', err);
            const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to submit. Please check your details.';
            setFormError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Loading Wallet...</p>
            </div>
        );
    }

    const isRestricted = wallet?.account_status?.includes('Restricted');
    const commissionDue = parseFloat(wallet?.commission_balance || 0);
    const isNegative = commissionDue < 0;

    const statCards = [
        {
            label: 'Total Earnings (Gross)',
            value: `PKR ${parseFloat(wallet?.total_earning || 0).toLocaleString()}`,
            icon: TrendingUp,
            bg: 'bg-green-50',
            iconColor: 'text-green-600',
            desc: 'Sum of all completed orders'
        },
        {
            label: 'Total Commission (15%)',
            value: `PKR ${parseFloat(wallet?.total_commission || 0).toLocaleString()}`,
            icon: Receipt,
            bg: 'bg-orange-50',
            iconColor: 'text-orange-600',
            desc: 'Marketplace platform fee'
        },
        {
            label: 'Net Earnings',
            value: `PKR ${parseFloat(wallet?.net_earnings || 0).toLocaleString()}`,
            icon: ArrowUpRight,
            bg: 'bg-purple-50',
            iconColor: 'text-purple-600',
            desc: 'Earnings after commission'
        },
        {
            label: 'Remaining Credit Limit',
            value: `PKR ${parseFloat(wallet?.remaining_credit_limit || 0).toLocaleString()}`,
            icon: CheckCircle2,
            bg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            desc: 'Buffer before restriction (-10,000)'
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <Wallet className="w-9 h-9 text-blue-600" />
                            My Wallet
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium">
                            Track your earnings, cash collected, commissions, and payment submissions.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchWalletData(true)}
                            disabled={refreshing}
                            className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowSubmitModal(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2 active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            Submit Payment Proof
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="font-bold text-sm">{error}</p>
                    </div>
                )}

                {/* Restriction Alert */}
                {isRestricted && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-6 bg-red-600 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl shadow-red-100"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500 rounded-2xl">
                                <ShieldAlert className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black uppercase tracking-tight">Account Restricted</h2>
                                <p className="text-red-100 text-sm font-medium mt-0.5">
                                    Your outstanding balance of <strong>PKR {Math.abs(commissionDue).toLocaleString()}</strong> exceeds the threshold.
                                    You cannot accept new bookings until this is cleared.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSubmitModal(true)}
                            className="bg-white text-red-600 px-6 py-3 rounded-2xl font-black hover:bg-red-50 transition-all shadow-md shrink-0 active:scale-95"
                        >
                            Clear Commission Now →
                        </button>
                    </motion.div>
                )}

                {/* No Wallet State */}
                {!wallet && !error && (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center mb-10">
                        <Wallet className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-gray-800">No Wallet Yet</h3>
                        <p className="text-gray-500 mt-2 font-medium max-w-sm mx-auto">
                            Your wallet is created automatically once you complete your first booking. Keep accepting jobs!
                        </p>
                    </div>
                )}

                {wallet && (
                    <>
                        {/* Main Balance Card + Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                            {/* Main Balance */}
                            <div className={`lg:col-span-1 p-8 rounded-[2rem] shadow-xl flex flex-col justify-between ${isRestricted ? 'bg-gradient-to-br from-red-600 to-red-700' : 'bg-gradient-to-br from-blue-600 to-indigo-700'} text-white`}>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70 mb-2">Commission Due</p>
                                    <h2 className={`text-5xl font-black tabular-nums tracking-tighter ${isNegative ? '' : ''}`}>
                                        PKR {Math.abs(commissionDue).toLocaleString()}
                                    </h2>
                                    <p className="text-white/60 text-xs mt-3 font-medium">
                                        {isNegative
                                            ? '↑ You owe this commission to the platform.'
                                            : '↓ You have a credit balance.'}
                                    </p>
                                </div>
                                <div className={`mt-8 flex items-center gap-2 px-4 py-2.5 rounded-xl w-fit ${isRestricted ? 'bg-red-500/50' : 'bg-white/20'}`}>
                                    <div className={`w-2 h-2 rounded-full ${isRestricted ? 'bg-red-200' : 'bg-green-300'}`}></div>
                                    <span className="text-xs font-black uppercase tracking-widest">
                                        {wallet?.account_status}
                                    </span>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {statCards.map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.07 }}
                                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                                            <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                                        <p className="text-[11px] text-gray-400 font-medium mt-1">{stat.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* How it works info banner */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3 mb-10">
                            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-700 font-medium">
                                <span className="font-black">How it works: </span>
                                When you complete a job, you collect cash from the customer directly.
                                The platform charges a commission. You must transfer the commission amount to the platform
                                via JazzCash/EasyPaisa/bank and submit proof here for admin approval. Your balance reflects what you owe (negative) or are owed (positive).
                            </div>
                        </div>

                        {/* Ledger + Submissions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Transaction Ledger */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-7 border-b border-gray-50 flex items-center justify-between">
                                    <h2 className="text-xl font-black flex items-center gap-2">
                                        <History className="w-5 h-5 text-blue-600" />
                                        Transaction Ledger
                                    </h2>
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                        {wallet?.ledger_entries?.length || 0} entries
                                    </span>
                                </div>
                                <div className="overflow-y-auto max-h-[500px]">
                                    {wallet?.ledger_entries?.length > 0 ? (
                                        <div className="divide-y divide-gray-50">
                                            {wallet.ledger_entries.map((entry) => (
                                                <div key={entry.id} className="px-7 py-5 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4">
                                                    <div className="flex-grow min-w-0">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1">
                                                            {new Date(entry.timestamp).toLocaleDateString()} · {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                        <p className="text-sm font-black text-gray-900 truncate">{entry.description}</p>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mt-1.5 inline-block ${entry.transaction_type === 'ORDER_COMPLETED' ? 'bg-green-50 text-green-600' :
                                                            entry.transaction_type === 'CASH_COLLECTED' ? 'bg-purple-50 text-purple-600' :
                                                                entry.transaction_type === 'MANUAL_PAYMENT' ? 'bg-blue-50 text-blue-600' :
                                                                    'bg-orange-50 text-orange-600'
                                                            }`}>
                                                            {entry.transaction_type?.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        {parseFloat(entry.credit) > 0 ? (
                                                            <span className="text-green-600 font-black text-base tabular-nums">+{parseFloat(entry.credit).toLocaleString()}</span>
                                                        ) : (
                                                            <span className="text-red-500 font-black text-base tabular-nums">-{parseFloat(entry.debit).toLocaleString()}</span>
                                                        )}
                                                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">Bal: {parseFloat(entry.running_balance).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-16 text-center text-gray-400 flex flex-col items-center">
                                            <Clock className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="font-bold text-sm">No transactions yet.</p>
                                            <p className="text-xs mt-1">Transactions appear after you complete bookings.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Submissions */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-7 border-b border-gray-50 flex items-center justify-between">
                                    <h2 className="text-xl font-black flex items-center gap-2">
                                        <Banknote className="w-5 h-5 text-indigo-600" />
                                        Payment Proofs
                                    </h2>
                                    <button
                                        onClick={() => setShowSubmitModal(true)}
                                        className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> New
                                    </button>
                                </div>
                                <div className="overflow-y-auto max-h-[500px]">
                                    {submissions.length > 0 ? (
                                        <div className="divide-y divide-gray-50">
                                            {submissions.map((sub) => (
                                                <div key={sub.id} className="px-7 py-5 hover:bg-gray-50/50 transition-colors flex items-center gap-4">
                                                    {/* Screenshot thumbnail */}
                                                    {sub.screenshot && (
                                                        <a href={sub.screenshot} target="_blank" rel="noreferrer" className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm block hover:opacity-80 transition-opacity">
                                                            <img src={sub.screenshot} alt="Proof" className="w-full h-full object-cover" />
                                                        </a>
                                                    )}
                                                    <div className="flex-grow min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-lg font-black text-gray-900 tabular-nums">PKR {parseFloat(sub.amount).toLocaleString()}</span>
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${sub.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                sub.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    'bg-orange-50 text-orange-700 border-orange-200'
                                                                }`}>
                                                                {sub.status === 'APPROVED' ? '✓ ' : sub.status === 'REJECTED' ? '✗ ' : '⏳ '}{sub.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs font-bold text-gray-500 mt-1">TID: {sub.transaction_id}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium mt-0.5 uppercase tracking-tighter">
                                                            {new Date(sub.created_at).toLocaleString()}
                                                        </p>
                                                        {sub.admin_notes && (
                                                            <p className="text-xs italic text-gray-600 mt-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                                                                <span className="font-black not-italic text-gray-400 text-[9px] block mb-1 uppercase">Admin Note</span>
                                                                {sub.admin_notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-16 text-center text-gray-400 flex flex-col items-center">
                                            <Banknote className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="font-bold text-sm">No payment submissions yet.</p>
                                            <p className="text-xs mt-1 max-w-xs mx-auto">Submit a payment proof to clear your outstanding balance.</p>
                                            <button
                                                onClick={() => setShowSubmitModal(true)}
                                                className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-blue-700 transition-all active:scale-95"
                                            >
                                                Submit First Payment →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Submit Payment Modal */}
            <AnimatePresence>
                {showSubmitModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowSubmitModal(false); setFormError(null); setSubmitSuccess(false); }}
                            className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                        >
                            {submitSuccess ? (
                                <div className="p-14 text-center flex flex-col items-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", damping: 12 }}
                                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5"
                                    >
                                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                                    </motion.div>
                                    <h3 className="text-2xl font-black text-gray-900">Payment Submitted!</h3>
                                    <p className="text-gray-500 font-medium mt-2">Admin will review and approve shortly.</p>
                                </div>
                            ) : (
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-7">
                                        <div>
                                            <h2 className="text-2xl font-black tracking-tight">Submit Payment Proof</h2>
                                            <p className="text-gray-500 text-sm font-medium mt-0.5">Transfer via JazzCash/EasyPaisa/Bank, then submit proof here.</p>
                                        </div>
                                        <button
                                            onClick={() => { setShowSubmitModal(false); setFormError(null); }}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <XCircle className="w-7 h-7 text-gray-400" />
                                        </button>
                                    </div>

                                    {/* Outstanding balance reminder */}
                                    {isNegative && (
                                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                                            <p className="text-sm font-bold text-orange-700">
                                                Outstanding commission: <span className="font-black">PKR {Math.abs(commissionDue).toLocaleString()}</span>
                                            </p>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmitPayment} className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Amount Transferred (PKR) *</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={paymentData.amount}
                                                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-black text-xl focus:border-blue-600 focus:bg-white transition-all outline-none"
                                                placeholder="e.g. 5000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Transaction ID *</label>
                                            <input
                                                type="text"
                                                required
                                                value={paymentData.transaction_id}
                                                onChange={(e) => setPaymentData({ ...paymentData, transaction_id: e.target.value })}
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-black focus:border-blue-600 focus:bg-white transition-all outline-none"
                                                placeholder="JazzCash / EasyPaisa / Bank TID"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Payment Screenshot</label>
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setPaymentData({ ...paymentData, screenshot: e.target.files[0] })}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className={`border-3 border-dashed rounded-2xl p-6 text-center transition-all ${paymentData.screenshot ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 group-hover:border-blue-400 group-hover:bg-blue-50/50'}`}>
                                                    {paymentData.screenshot ? (
                                                        <div className="flex flex-col items-center">
                                                            <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                                                            <p className="font-black text-green-800 text-sm">{paymentData.screenshot.name}</p>
                                                            <p className="text-[10px] text-green-600 font-bold uppercase mt-1">Ready to upload</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                                            <ArrowUpRight className="w-8 h-8 mb-2" />
                                                            <p className="font-black text-sm">Click to upload screenshot</p>
                                                            <p className="text-[10px] font-bold uppercase mt-1">JPG, PNG supported</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {formError && (
                                            <p className="text-red-500 text-sm font-bold bg-red-50 p-3.5 rounded-xl border border-red-100 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 shrink-0" />{formError}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-base hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98] disabled:bg-gray-300 disabled:scale-100 flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                                            ) : (
                                                'Submit Payment for Review'
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}
