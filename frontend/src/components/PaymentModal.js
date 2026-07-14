"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Wallet, Landmark, ShieldCheck, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

const PaymentModal = ({ booking, isOpen, onClose, onSuccess }) => {
    const [method, setMethod] = useState('CARD');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePayment = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('payments/', {
                booking: booking.id,
                amount: booking.total_amount,
                payment_method: method
            });
            onSuccess();
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.response?.data?.amount?.[0] || 'Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gray-900 p-6 text-white text-center">
                        <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold">Secure Payment</h3>
                        <p className="text-gray-100 text-sm mt-1">Order #{booking.id}</p>
                    </div>

                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                            <span className="text-gray-950 font-bold">Service Total</span>
                            <span className="text-3xl font-extrabold text-blue-600">Rs. {booking.total_amount}</span>
                        </div>

                        <div className="space-y-4 mb-8">
                            <p className="text-sm font-bold text-gray-700">Select Payment Method</p>

                            {[
                                { id: 'CARD', name: 'Credit / Debit Card', icon: CreditCard },
                                { id: 'WALLET', name: 'Digital Wallet', icon: Wallet },
                                { id: 'BANK', name: 'Bank Transfer', icon: Landmark },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setMethod(item.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${method === item.id
                                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                                        : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <item.icon className="w-5 h-5 mr-3" />
                                        <span className="font-bold">{item.name}</span>
                                    </div>
                                    {method === item.id && <CheckCircle2 className="w-5 h-5" />}
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                            ) : (
                                `Pay Rs. ${booking.total_amount}`
                            )}
                        </button>

                        <div className="mt-6 flex items-center justify-center text-xs text-gray-950 font-black">
                            <ShieldCheck className="w-4 h-4 mr-1 text-green-500" />
                            End-to-end encrypted transaction
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6 text-white/70 hover:text-white transition-colors" />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PaymentModal;
