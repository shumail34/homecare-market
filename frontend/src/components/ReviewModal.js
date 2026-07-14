"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MessageSquare, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

const ReviewModal = ({ booking, isOpen, onClose, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hover, setHover] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        // ... (restored in previous call actually, but I need to make sure the UI handles it)
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('reviews/', {
                booking: booking.id,
                rating: rating,
                comment: comment,
                provider: booking.provider?.id || booking.provider
            });
            setSubmitted(true);
            setTimeout(() => {
                onSuccess();
                setSubmitted(false);
            }, 2000);
        } catch (err) {
            console.error('Review error:', err);
            setError(err.response?.data?.non_field_errors?.[0] || 'Failed to submit review. Please try again.');
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
                    {submitted ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12 }}
                                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
                            >
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h3>
                            <p className="text-gray-600 font-medium">Your review has been submitted successfully.</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="bg-blue-600 p-8 text-white text-center">
                                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Star className="w-8 h-8 fill-current" />
                                </div>
                                <h3 className="text-2xl font-bold">Rate Your Experience</h3>
                                <p className="text-white text-sm mt-1 font-bold">{booking.service?.title}</p>
                            </div>

                            <div className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Star Rating */}
                                    <div className="text-center">
                                        <p className="text-sm font-black text-gray-950 uppercase tracking-widest mb-4">How was the service?</p>
                                        <div className="flex justify-center space-x-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className="focus:outline-none transition-transform active:scale-90"
                                                    onMouseEnter={() => setHover(star)}
                                                    onMouseLeave={() => setHover(0)}
                                                    onClick={() => setRating(star)}
                                                >
                                                    <Star
                                                        className={`w-10 h-10 transition-colors ${(hover || rating) >= star
                                                            ? 'text-yellow-400 fill-current'
                                                            : 'text-gray-200'
                                                            }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <p className="mt-3 text-sm font-bold text-blue-600">
                                            {rating === 5 ? 'Excellent!' :
                                                rating === 4 ? 'Great!' :
                                                    rating === 3 ? 'Good' :
                                                        rating === 2 ? 'Poor' : 'Very Bad'}
                                        </p>
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                                            <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
                                            Write a Comment
                                        </label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Tell others about your experience..."
                                            className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none h-32 resize-none"
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center">
                                            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                        ) : (
                                            'Submit Review'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </>
                    )}

                    <button
                        onClick={onClose}
                        className={`absolute top-4 right-4 ${submitted ? 'text-gray-400' : 'text-white'} hover:opacity-70 transition-colors`}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReviewModal;
