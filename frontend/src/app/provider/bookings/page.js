"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import {
    Calendar, Clock, CheckCircle2, XCircle,
    User, Check, X, Loader2, AlertCircle,
    MessageSquare, Phone, Banknote, Briefcase, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatModal from '@/components/chat/ChatModal';

export default function ProviderBookings() {
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeChatBooking, setActiveChatBooking] = useState(null);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = async () => {
        try {
            const response = await api.get('bookings/provider/');
            setBookings(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();

        // High-standard sync using global real-time notifications
        const handleNotification = (event) => {
            const data = event.detail;
            if (data.type === 'NEW_BOOKING' || data.type === 'BOOKING_UPDATE') {
                console.log("Real-time Refreshing for Provider Dashboard...");
                fetchBookings();
            }
        };

        window.addEventListener('app-notification', handleNotification);
        return () => window.removeEventListener('app-notification', handleNotification);
    }, []);

    const handleUpdateStatus = async (bookingId, newStatus, otp = null) => {
        setActionLoading(bookingId);

        // Optimistic Update
        const originalBookings = [...bookings];
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));

        try {
            const payload = { status: newStatus };
            if (otp) payload.otp = otp;

            await api.patch(`bookings/${bookingId}/status/`, payload);
            await fetchBookings();
            setShowOtpModal(false);
            setOtpValue('');

            // If job completed, show success screen then redirect to wallet
            if (newStatus === 'COMPLETED') {
                setShowSuccessScreen(true);
                setTimeout(() => {
                    router.push('/provider/wallet');
                }, 3000);
            }
        } catch (error) {
            // Rollback on error
            setBookings(originalBookings);
            console.error('Error updating status:', error);
            const msg = error.response?.data?.otp?.[0] || error.response?.data?.status?.[0] || 'Update failed.';
            alert(msg);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="mb-10 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Manage Service Requests</h1>
                        <p className="text-gray-900 mt-1 font-bold">Accept, track, and complete your service orders.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                ) : bookings.length > 0 ? (
                    <div className="space-y-6">
                        {bookings.map((booking, index) => (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all"
                            >
                                {/* Status Column */}
                                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl min-w-[120px] shrink-0 border border-gray-100">
                                    <div className={`p-3 rounded-full mb-3 ${booking.status === 'PENDING' ? 'bg-orange-100 text-orange-600' :
                                        ['ACCEPTED', 'IN_PROGRESS'].includes(booking.status) ? 'bg-blue-100 text-blue-600' :
                                            booking.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                                                'bg-red-100 text-red-600'
                                        }`}>
                                        {booking.status === 'PENDING' ? <Clock className="w-6 h-6" /> :
                                            booking.status === 'ACCEPTED' ? <Check className="w-6 h-6" /> :
                                                booking.status === 'IN_PROGRESS' ? <Briefcase className="w-6 h-6" /> :
                                                    booking.status === 'COMPLETED' ? <CheckCircle2 className="w-6 h-6" /> :
                                                        <XCircle className="w-6 h-6" />}
                                    </div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest">{booking.status}</span>
                                </div>

                                {/* Main Content */}
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{booking.service?.title}</h3>
                                            <div className="flex items-center text-sm text-blue-600 font-bold mt-1">
                                                <User className="w-4 h-4 mr-2" />
                                                Customer: {booking.customer?.full_name}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-gray-900">Rs. {booking.total_amount}</p>
                                            <p className="text-[10px] text-gray-900 font-black uppercase tracking-widest">Est. Earnings</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800 mb-6 font-medium bg-blue-50/50 p-4 rounded-2xl border border-blue-50">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                                            {new Date(booking.scheduled_date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-2 text-blue-400" />
                                            {new Date(booking.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    {booking.notes && (
                                        <div className="mb-6">
                                            <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2 flex items-center">
                                                <MessageSquare className="w-3 h-3 mr-1" />
                                                Customer Notes
                                            </p>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                                                "{booking.notes}"
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                                        {booking.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'ACCEPTED')}
                                                    disabled={actionLoading === booking.id}
                                                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-100 hover:bg-green-700 active:scale-95 transition-all flex items-center"
                                                >
                                                    {actionLoading === booking.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                                    Accept Request
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setActiveChatBooking(booking);
                                                        setIsChatOpen(true);
                                                    }}
                                                    className="bg-white border border-blue-200 text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 active:scale-95 transition-all flex items-center"
                                                >
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    Chat with Customer
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                                                    disabled={actionLoading === booking.id}
                                                    className="bg-white border border-red-200 text-red-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-50 active:scale-95 transition-all flex items-center ml-auto"
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {booking.status === 'ACCEPTED' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'IN_PROGRESS')}
                                                    disabled={actionLoading === booking.id}
                                                    className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-100 hover:bg-orange-700 active:scale-95 transition-all flex items-center"
                                                >
                                                    {actionLoading === booking.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
                                                    Start Work
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setActiveChatBooking(booking);
                                                        setIsChatOpen(true);
                                                    }}
                                                    className="bg-white border border-blue-200 text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 active:scale-95 transition-all flex items-center"
                                                >
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    Chat with Customer
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                                                    disabled={actionLoading === booking.id}
                                                    className="bg-white border border-red-200 text-red-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-50 active:scale-95 transition-all flex items-center ml-auto"
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    Cancel Job
                                                </button>
                                            </>
                                        )}
                                        {booking.status === 'IN_PROGRESS' && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setShowOtpModal(true);
                                                    }}
                                                    disabled={actionLoading === booking.id}
                                                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center"
                                                >
                                                    {actionLoading === booking.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                                    Enter Completion OTP
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setActiveChatBooking(booking);
                                                        setIsChatOpen(true);
                                                    }}
                                                    className="bg-white border border-blue-200 text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 active:scale-95 transition-all flex items-center"
                                                >
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    Chat with Customer
                                                </button>
                                            </>
                                        )}
                                        {booking.status === 'COMPLETED' && (
                                            <div className="text-green-600 font-bold text-sm flex items-center py-3">
                                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                                Job Completed successfully.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-200">
                            <Briefcase className="w-12 h-12" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No active requests</h3>
                        <p className="mt-2 text-gray-800">Service requests from customers will appear here.</p>
                    </div>
                )}

                <AnimatePresence>
                    {activeChatBooking && (
                        <ChatModal
                            isOpen={isChatOpen}
                            onClose={() => setIsChatOpen(false)}
                            bookingId={activeChatBooking.id}
                            recipientName={activeChatBooking.customer?.full_name}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showOtpModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowOtpModal(false)}
                                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 text-center"
                            >
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12 group-hover:rotate-0 transition-transform">
                                    <ShieldAlert className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Verify Completion</h3>
                                <p className="text-sm text-gray-800 font-bold mb-8">Ask the customer for the 6-digit OTP to complete the service.</p>

                                <div className="space-y-6">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otpValue}
                                        onChange={(e) => setOtpValue(e.target.value)}
                                        className="w-full text-center text-4xl font-black tracking-[0.5em] p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none transition-all placeholder:text-gray-200"
                                        placeholder="000000"
                                    />

                                    <button
                                        onClick={() => handleUpdateStatus(selectedBooking.id, 'COMPLETED', otpValue)}
                                        disabled={otpValue.length !== 6 || actionLoading === selectedBooking.id}
                                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 active:scale-95 disabled:bg-gray-400 disabled:scale-100 transition-all flex items-center justify-center"
                                    >
                                        {actionLoading === selectedBooking.id ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify & Complete Job"}
                                    </button>

                                    <button
                                        onClick={() => setShowOtpModal(false)}
                                        className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {showSuccessScreen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center p-8"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                                    className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100/50"
                                >
                                    <CheckCircle2 className="w-16 h-16" />
                                </motion.div>
                                <motion.h2
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-4xl font-black text-gray-900 mb-4"
                                >
                                    Order Completed!
                                </motion.h2>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-gray-500 font-bold text-lg mb-8"
                                >
                                    Earnings have been added to your wallet.
                                </motion.p>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2.5, ease: "linear", delay: 0.6 }}
                                    className="h-1 bg-blue-600 rounded-full max-w-[200px] mx-auto"
                                />
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-4">Redirecting to Wallet...</p>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
}
