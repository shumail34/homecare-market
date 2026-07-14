"use client";

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Gavel, CheckCircle, AlertTriangle, Scale, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
    const sections = [
        {
            title: "Agreement to Terms",
            icon: <Scale className="w-6 h-6" />,
            content: "By accessing or using HomeCare Market, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access our service. We provide a platform connecting customers with independent service providers for home maintenance."
        },
        {
            title: "User Responsibilities",
            icon: <CheckCircle className="w-6 h-6" />,
            content: "You must provide accurate and complete information when creating an account. You are responsible for all activity that occurs under your account. Customers must provide a safe environment for service providers and pay for services rendered promptly."
        },
        {
            title: "Service Provider Conduct",
            icon: <Gavel className="w-6 h-6" />,
            content: "Service providers registered on this platform are independent contractors. They are responsible for the quality of their work and professional conduct. HomeCare Market facilitates the connection but does not directly employ the experts."
        },
        {
            title: "Cancellations & Refunds",
            icon: <AlertTriangle className="w-6 h-6" />,
            content: "Cancellations made less than 2 hours before the scheduled service may incur a late cancellation fee. Refunds are handled on a case-by-case basis through our support team and are generally only issued for services that were not completed as promised."
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-gray-900 py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600 opacity-10 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-block bg-blue-600/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                        >
                            Legal Framework
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-white italic mb-6"
                        >
                            Terms of Service
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
                        >
                            Defining the rules and expectations for a safe, reliable, and fair marketplace experience for everyone.
                        </motion.p>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-24 max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 hover:border-blue-200 hover:bg-white transition-all duration-500 group"
                        >
                            <div className="w-14 h-14 bg-white shadow-sm border border-gray-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                {section.icon}
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition-colors italic">
                                {section.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                {section.content}
                            </p>
                        </motion.div>
                    ))}
                </section>

                {/* FAQ Section Style Callout */}
                <section className="py-24 bg-blue-600 relative overflow-hidden">
                    <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                        <HelpCircle className="w-16 h-16 text-white/20 mx-auto mb-6" />
                        <h2 className="text-4xl font-black text-white italic mb-6">Need Clarification?</h2>
                        <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto font-medium">
                            If any part of these terms is unclear, or you're unsure how they apply to your specific situation, we're here to help.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/contact-services" className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black hover:bg-gray-100 transition-all shadow-xl active:scale-95">
                                Contact Legal Team
                            </Link>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
