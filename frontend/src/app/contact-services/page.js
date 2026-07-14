"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, MessageSquare, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function ContactPage() {
    const { user, isAuthenticated } = useAuth();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setStatus({ type: 'error', msg: 'Please login to send a message.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', msg: '' });

        try {
            await api.post('auth/contact/', { subject, message });
            setStatus({ type: 'success', msg: 'Your message has been sent successfully!' });
            setSubject('');
            setMessage('');
        } catch (error) {
            setStatus({
                type: 'error',
                msg: error.response?.data?.error || 'Failed to send message. Please try again later.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-gray-900 py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/10 blur-[100px] -translate-y-1/2"></div>
                    <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block text-blue-400 font-black uppercase tracking-[0.2em] text-xs mb-4"
                        >
                            Get In Touch
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-white italic mb-6"
                        >
                            How Can We Help?
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
                        >
                            Have a question or feedback? Our team is here to support you. Send us a message and we'll get back to you within 24 hours.
                        </motion.p>
                    </div>
                </section>

                <section className="py-24 max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Contact Info Cards */}
                        <div className="space-y-6">
                            {[
                                {
                                    icon: <Mail className="w-6 h-6" />,
                                    title: "Email Support",
                                    detail: "support@homecare.com",
                                    desc: "Response within 24 hours"
                                },
                                {
                                    icon: <Phone className="w-6 h-6" />,
                                    title: "Call Us",
                                    detail: "+92 300 1234567",
                                    desc: "Mon - Fri, 9am - 6pm"
                                },
                                {
                                    icon: <MapPin className="w-6 h-6" />,
                                    title: "Visit Our Office",
                                    detail: "Tech Hub, Islamabad",
                                    desc: "2nd Floor, Block C"
                                }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-blue-200 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 mb-1 italic">{item.title}</h3>
                                    <p className="text-blue-600 font-bold mb-2">{item.detail}</p>
                                    <p className="text-gray-500 text-sm font-medium">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-gray-100 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                <h2 className="text-3xl font-black text-gray-900 italic mb-8">Send a Message</h2>

                                {!isAuthenticated && (
                                    <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm font-bold flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 shrink-0" />
                                        You must be logged in as {user?.full_name || 'a user'} to send a message from your registered email.
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Your Name</label>
                                            <input
                                                type="text"
                                                value={user?.full_name || ''}
                                                disabled
                                                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-500 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Your Email</label>
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-500 font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Subject</label>
                                        <input
                                            type="text"
                                            required
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="What can we help you with?"
                                            className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-900 font-bold focus:border-blue-600 outline-none transition-all placeholder:text-gray-300"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Message</label>
                                        <textarea
                                            required
                                            rows={6}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Type your message here..."
                                            className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-900 font-bold focus:border-blue-600 outline-none transition-all placeholder:text-gray-300 resize-none"
                                        ></textarea>
                                    </div>

                                    {status.msg && (
                                        <div className={`p-4 rounded-2xl text-sm font-bold ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                            {status.msg}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || !isAuthenticated}
                                        className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Send Message
                                                <Send className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* FAQ Style Callout */}
                <section className="bg-white py-24">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-8">
                            <Clock className="w-4 h-4" />
                            Fast Response Time
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 italic mb-6">Common Questions</h2>
                        <p className="text-gray-600 text-lg mb-12">
                            Check out our FAQ section for quick answers to common questions about bookings, payments, and service provider registration.
                        </p>
                        <div className="inline-flex gap-4">
                            <button className="px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-xl active:scale-95">
                                Visit Help Center
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
