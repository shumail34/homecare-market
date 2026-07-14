"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentModal from '@/components/PaymentModal';
import ReviewModal from '@/components/ReviewModal';
import api from '@/lib/api';
import {
    Calendar, Clock, CheckCircle2, XCircle,
    MapPin, User, ChevronRight, Loader2,
    AlertCircle, Star, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatModal from '@/components/chat/ChatModal';

export default function CustomerBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeChatBooking, setActiveChatBooking] = useState(null);

    const fetchBookings = async () => {
        try {
            const response = await api.get('bookings/customer/');
            setBookings(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        // Optimistic update
        const originalBookings = [...bookings];
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));

        try {
            await api.patch(`bookings/${bookingId}/status/`, { status: 'CANCELLED' });
            fetchBookings();
        } catch (error) {
            // Rollback
            setBookings(originalBookings);
            console.error('Cancellation error:', error.response?.data);
            const data = error.response?.data;
            const errorMsg = data?.detail || data?.non_field_errors?.[0] || data?.status?.[0] || 'Could not cancel booking.';
            alert(errorMsg);
        }
    };

    useEffect(() => {
        fetchBookings();

        // Listen for real-time updates from Global WebSocket
        const handleNotification = (event) => {
            const data = event.detail;
            if (data.type === 'BOOKING_UPDATE') {
                console.log("Real-time Refreshing Bookings for consumer...");
                fetchBookings();
            }
        };

        window.addEventListener('app-notification', handleNotification);
        return () => window.removeEventListener('app-notification', handleNotification);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'text-orange-600 bg-orange-50 border-orange-100';
            case 'ACCEPTED': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'COMPLETED': return 'text-green-600 bg-green-50 border-green-100';
            case 'CANCELLED': return 'text-red-600 bg-red-50 border-red-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50" suppressHydrationWarning>
            <Navbar />
            <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full" suppressHydrationWarning>
                <div className="mb-10" suppressHydrationWarning>
                    <h1 className="text-3xl font-extrabold text-gray-900">Your Bookings</h1>
                    <p className="text-gray-950 mt-1 font-bold">Manage your service requests and track status.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20" suppressHydrationWarning>
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                ) : bookings.length > 0 ? (
                    <div className="space-y-6">
                        {bookings.map((booking, index) => (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all"
                            >
                                {/* Service Image/Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                                    <Calendar className="w-8 h-8 text-blue-600" />
                                </div>

                                {/* Main Content */}
                                <div className="flex-grow">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{booking.service?.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-950 mb-4 font-bold">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-2 text-gray-700" />
                                            Provider: {booking.provider?.full_name}
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-2 text-gray-700" />
                                            <span suppressHydrationWarning>{new Date(booking.scheduled_date).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-2 text-gray-700" />
                                            Service Location: My Home
                                        </div>
                                        <div className="flex items-center font-bold text-blue-600">
                                            Total: Rs. {booking.total_amount}
                                        </div>
                                    </div>

                                    {booking.notes && (
                                        <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600 italic border border-gray-100 flex items-start mb-4">
                                            <MessageSquare className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                                            "{booking.notes}"
                                        </div>
                                    )}

                                    {/* Completion OTP Display */}
                                    {['ACCEPTED', 'IN_PROGRESS'].includes(booking.status) && booking.completion_otp && (
                                        <div className="mt-4 p-5 bg-blue-600 text-white rounded-[2rem] shadow-xl shadow-blue-100 relative overflow-hidden group">
                                            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <CheckCircle2 className="w-5 h-5 text-blue-200" />
                                                        <h4 className="text-sm font-black uppercase tracking-widest italic">Service Completion Code</h4>
                                                    </div>
                                                    <p className="text-[10px] text-blue-100 font-bold max-w-[200px]">Provide this code to the expert only after the job is finished.</p>
                                                </div>
                                                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                                                    <span className="text-3xl font-black tracking-[0.3em] font-mono leading-none">{booking.completion_otp}</span>
                                                </div>
                                            </div>
                                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                                <CheckCircle2 className="w-24 h-24" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                                        {['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(booking.status) && (
                                            <>
                                                {booking.status === 'ACCEPTED' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setIsPaymentOpen(true);
                                                        }}
                                                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                                                    >
                                                        Make Payment
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setActiveChatBooking(booking);
                                                        setIsChatOpen(true);
                                                    }}
                                                    className="bg-white border border-blue-200 text-blue-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 active:scale-95 transition-all flex items-center"
                                                >
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    Chat with Provider
                                                </button>
                                                {booking.status !== 'IN_PROGRESS' && (
                                                    <button
                                                        onClick={() => handleCancel(booking.id)}
                                                        className="bg-white border border-red-100 text-red-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-50 active:scale-95 transition-all flex items-center"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                        Cancel Booking
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        {booking.status === 'COMPLETED' && booking.review_rating === null && (
                                            <button
                                                onClick={() => {
                                                    setSelectedBookingForReview(booking);
                                                    setIsReviewOpen(true);
                                                }}
                                                className="bg-white border border-gray-200 text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 active:scale-95 transition-all"
                                            >
                                                Leave a Review
                                            </button>
                                        )}
                                        {booking.status === 'COMPLETED' && booking.review_rating !== null && (
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 w-full">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Review</span>
                                                    <div className="flex items-center text-yellow-500">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3.5 h-3.5 ${i < booking.review_rating ? 'fill-current' : 'text-gray-300'}`} />
                                                        ))}
                                                        <span className="ml-2 text-sm font-black text-gray-900">{booking.review_rating}.0</span>
                                                    </div>
                                                </div>
                                                {booking.review_comment && (
                                                    <p className="text-sm text-gray-700 italic font-medium leading-relaxed">"{booking.review_comment}"</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <Calendar className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No bookings yet</h3>
                        <p className="mt-2 text-gray-800">You haven't made any service requests yet.</p>
                        <Link href="/services" className="mt-6 inline-block bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg active:scale-95 transition-all">
                            Browse Services
                        </Link>
                    </div>
                )}

                {selectedBooking && (
                    <PaymentModal
                        booking={selectedBooking}
                        isOpen={isPaymentOpen}
                        onClose={() => setIsPaymentOpen(false)}
                        onSuccess={() => {
                            setIsPaymentOpen(false);
                            fetchBookings();
                        }}
                    />
                )}

                {selectedBookingForReview && (
                    <ReviewModal
                        booking={selectedBookingForReview}
                        isOpen={isReviewOpen}
                        onClose={() => setIsReviewOpen(false)}
                        onSuccess={() => {
                            setIsReviewOpen(false);
                            fetchBookings();
                        }}
                    />
                )}

                {activeChatBooking && (
                    <ChatModal
                        isOpen={isChatOpen}
                        onClose={() => setIsChatOpen(false)}
                        bookingId={activeChatBooking.id}
                        recipientName={activeChatBooking.provider?.full_name}
                    />
                )}
            </main>
            <Footer />
        </div>
    );
}
