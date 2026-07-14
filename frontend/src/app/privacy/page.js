"use client";

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
    const sections = [
        {
            title: "Introduction",
            icon: <FileText className="w-6 h-6" />,
            content: "Welcome to HomeCare Market. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you."
        },
        {
            title: "The Data We Collect",
            icon: <Eye className="w-6 h-6" />,
            content: "We collect various types of information to provide and improve our services to you, including: Personal Identity Data (Full Name), Contact Data (Email, Phone Number, Address), Transaction Data (Booking history), and Technical Data (IP address via cookies)."
        },
        {
            title: "How We Use Your Data",
            icon: <Shield className="w-6 h-6" />,
            content: "We only use your personal data when the law allows us to. Most commonly, we will use it to: Register you as a new customer, Process and deliver your bookings, Manage our relationship with you, and Enable you to participate in reviews or surveys."
        },
        {
            title: "Security of Your Information",
            icon: <Lock className="w-6 h-6" />,
            content: "We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. We limit access to your personal data to those employees, agents, and service providers who have a business need to know."
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-gray-900 py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600 opacity-10 blur-[100px] -translate-y-1/2"></div>
                    <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block text-blue-400 font-black uppercase tracking-widest text-xs mb-4"
                        >
                            Trust & Transparency
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-white italic mb-6"
                        >
                            Privacy Policy
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
                        >
                            Your privacy is our priority. Learn how we handle your data with care and integrity at HomeCare Market.
                        </motion.p>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-24 max-w-4xl mx-auto px-4">
                    <div className="space-y-12">
                        {sections.map((section, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex gap-8 group"
                            >
                                <div className="shrink-0">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm border border-blue-100">
                                        {section.icon}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                        {section.title}
                                        <ChevronRight className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </h2>
                                    <p className="text-gray-600 leading-relaxed text-lg">
                                        {section.content}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-24 p-12 bg-gray-900 rounded-[3rem] text-center relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-white italic mb-4">Any Questions?</h2>
                            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                                If you have any concerns about how we handle your data, feel free to reach out to our support team.
                            </p>
                            <Link
                                href="/contact-services"
                                className="inline-block bg-white text-gray-900 px-10 py-4 rounded-2xl font-black hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95"
                            >
                                Contact Support
                            </Link>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-10 blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
