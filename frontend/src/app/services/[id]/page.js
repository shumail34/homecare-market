"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Star, Clock, User, ShieldCheck, Calendar, CheckCircle2, Loader2, IndianRupee, MapPin, ChevronRight, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ServiceDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();

    const [service, setService] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const [bookingDate, setBookingDate] = useState('');
    const [notes, setNotes] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        const fetchService = async () => {
            try {
                const [serviceRes, reviewsRes] = await Promise.all([
                    api.get(`services/${id}/`),
                    api.get(`reviews/service/${id}/`).catch(err => {
                        console.error('Error fetching reviews:', err);
                        return { data: [] };
                    })
                ]);
                setService(serviceRes.data);
                setReviews(reviewsRes.data.results || reviewsRes.data);
            } catch (error) {
                console.error('Error fetching service:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    const [duration, setDuration] = useState(1);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (!address.trim()) {
            alert('Please enter a service address.');
            return;
        }

        setBookingLoading(true);
        try {
            await api.post('bookings/', {
                service: id,
                scheduled_date: new Date(bookingDate).toISOString(),
                address: address.trim(),
                duration_hours: duration,
                total_amount: parseFloat(service.price_per_hour || 0) * duration,
                notes: notes.trim()
            });
            setBookingSuccess(true);
            setTimeout(() => {
                router.push('/customer/bookings');
            }, 2000);
        } catch (error) {
            console.error('Booking error:', error);
            const msg = error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Booking failed. Please try again.';
            alert(msg);
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex flex-col pt-20 items-center justify-center">
                <h2 className="text-2xl font-bold">Service not found</h2>
                <button onClick={() => router.back()} className="mt-4 text-blue-600 font-bold underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="lg:grid lg:grid-cols-2 lg:gap-16">
                    {/* Left: Service Info */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 aspect-video">
                            {(() => {
                                const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/api\/?$/, '');
                                const sep = (backendUrl.endsWith('/') || (service.image && service.image.startsWith('/'))) ? '' : '/';
                                const imageUrl = service.image
                                    ? (service.image.startsWith('http') ? service.image : `${backendUrl}${sep}${service.image}`)
                                    : "https://images.unsplash.com/photo-1581578731548-c64695cc6954?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
                                return (
                                    <img
                                        src={imageUrl}
                                        alt={service.title}
                                        className="w-full h-full object-cover"
                                    />
                                );
                            })()}
                            <div className="absolute top-6 left-6 flex space-x-3">
                                <span className="bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-bold px-4 py-2 rounded-full shadow-sm">
                                    {service.category_name}
                                </span>
                                {service.is_available && (
                                    <span className="bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm">
                                        Available Now
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-6">
                                <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                                    {service.title}
                                </h1>
                                <div className="flex items-center text-yellow-500 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
                                    <Star className="w-5 h-5 fill-current mr-2" />
                                    <span className="text-lg font-bold">{service.average_rating > 0 ? parseFloat(service.average_rating).toFixed(1) : 'NEW'}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-8 mb-10 text-gray-900 items-center">
                                <Link
                                    href={`/providers/${service.provider?.id || service.provider}`}
                                    className="flex items-center bg-blue-50/50 hover:bg-blue-100/50 border border-blue-100/50 px-5 py-3 rounded-[2rem] transition-all group relative overflow-hidden"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 mr-4 border-2 border-white shadow-md group-hover:scale-110 transition-transform overflow-hidden">
                                        {service.provider?.profile_picture ? (
                                            <img
                                                src={(() => {
                                                    if (service.provider.profile_picture.startsWith('http')) return service.provider.profile_picture;
                                                    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');
                                                    const sep = (base.endsWith('/') || service.provider.profile_picture.startsWith('/')) ? '' : '/';
                                                    return `${base}${sep}${service.provider.profile_picture}`;
                                                })()}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Professional Provider</p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-xl font-black text-gray-900 group-hover:text-blue-700 transition-colors">{service.provider?.full_name}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 text-[9px] font-black text-white bg-blue-600 px-2 py-0.5 rounded-full shadow-sm group-hover:scale-105 transition-transform">
                                                    VIEW PUBLIC PROFILE <ChevronRight className="w-3 h-3" />
                                                </div>
                                                <Link
                                                    href="/messages"
                                                    className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full shadow-sm hover:bg-blue-100 transition-colors"
                                                >
                                                    <MessageSquare className="w-3 h-3" /> CONTACT PROVIDER
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                <div className="flex items-center gap-6 font-bold flex-1">
                                    <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-100/50">
                                        <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                                        <span className="text-sm font-black uppercase tracking-tighter tabular-nums">{service.total_bookings || 0}</span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <MapPin className="w-5 h-5 mr-2 text-red-500" />
                                        <span className="text-sm">{service.city}</span>
                                    </div>
                                    <div className="flex-grow text-right border-l pl-6 border-gray-100">
                                        <p className="text-3xl text-blue-600 font-black tracking-tight">Rs. {parseFloat(service.price_per_hour || 0).toLocaleString()}<span className="text-xs text-gray-400 font-bold ml-1 uppercase">/ hr</span></p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-4">About the Service</h3>
                            <p className="text-gray-900 font-bold leading-relaxed mb-8 whitespace-pre-line">
                                {service.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-12">
                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <ShieldCheck className="w-6 h-6 text-blue-600 mb-2" />
                                    <h4 className="font-bold text-sm">Verified Professional</h4>
                                    <p className="text-xs text-gray-700 mt-1">Provider identity and skills checked.</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <Clock className="w-6 h-6 text-blue-600 mb-2" />
                                    <h4 className="font-bold text-sm">On-Time Performance</h4>
                                    <p className="text-xs text-gray-900 mt-1 font-bold">98% customer satisfaction on punctuality.</p>
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="border-t border-gray-100 pt-10">
                                <h3 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h3>
                                {reviews.length > 0 ? (
                                    <div className="space-y-8">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 text-sm">
                                                            {review.customer_name ? review.customer_name[0] : 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">{review.customer_name || 'Anonymous User'}</p>
                                                            <p className="text-xs text-gray-700">{new Date(review.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex text-yellow-500">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-sm leading-relaxed italic">"{review.comment}"</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        <p className="text-gray-800 text-sm">No reviews yet. Be the first to book!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Booking Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mt-12 lg:mt-0"
                    >
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 sticky top-24">
                            {bookingSuccess ? (
                                <div className="text-center py-10 animate-scale-up">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Requested!</h3>
                                    <p className="text-gray-600">The provider will review your request and get back to you shortly.</p>
                                    <p className="mt-4 text-sm text-blue-600 font-medium">Redirecting to your bookings...</p>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Schedule Service</h3>
                                    <form onSubmit={handleBooking} className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                                                <Calendar className="w-3 h-3 mr-2" />
                                                Preferred Schedule
                                            </label>
                                            <input
                                                type="datetime-local"
                                                required
                                                value={bookingDate}
                                                onChange={(e) => setBookingDate(e.target.value)}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-bold text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                                                <MapPin className="w-3 h-3 mr-2" />
                                                Service Address *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter the full address for service delivery"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-bold text-sm"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                                                    <Clock className="w-3 h-3 mr-2" />
                                                    Service Duration
                                                </label>
                                                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDuration(Math.max(1, duration - 1))}
                                                        className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-xl font-bold text-blue-600 hover:bg-blue-50 active:scale-90 transition-all"
                                                    >
                                                        −
                                                    </button>
                                                    <div className="text-center">
                                                        <span className="text-xl font-black text-gray-900">{duration}</span>
                                                        <span className="text-xs font-bold text-gray-400 block -mt-1">{duration === 1 ? 'Hour' : 'Hours'}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDuration(Math.min(24, duration + 1))}
                                                        className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-xl font-bold text-blue-600 hover:bg-blue-50 active:scale-90 transition-all"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                                Instructions (Optional)
                                            </label>
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="Tell us more about the job (gate code, preferred tools, etc.)"
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium text-sm h-28 resize-none"
                                            />
                                        </div>

                                        <div className="pt-4 mt-6 border-t border-gray-50">
                                            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-50 flex justify-between items-center mb-8">
                                                <div>
                                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Estimated Total</p>
                                                    <p className="text-xs font-bold text-gray-500">
                                                        Rs. {parseFloat(service.price_per_hour || 0).toLocaleString()} × {duration}hr
                                                    </p>
                                                </div>
                                                <p className="text-3xl font-black text-blue-600">
                                                    Rs. {(parseFloat(service.price_per_hour || 0) * duration).toLocaleString()}
                                                </p>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={bookingLoading || !bookingDate}
                                                className="w-full relative group overflow-hidden bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 hover:shadow-2xl transition-all disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <span className="relative flex items-center justify-center gap-2">
                                                    {bookingLoading ? (
                                                        <Loader2 className="w-6 h-6 animate-spin" />
                                                    ) : (
                                                        <>
                                                            {isAuthenticated ? 'Confirm Booking' : 'Log in to Book Service'}
                                                            <CheckCircle2 className="w-5 h-5 text-blue-200" />
                                                        </>
                                                    )}
                                                </span>
                                            </button>
                                        </div>
                                    </form>
                                    <p className="mt-6 text-center text-xs text-gray-700 px-4">
                                        You won't be charged yet. Payment is made after the provider accepts your request.
                                    </p>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
