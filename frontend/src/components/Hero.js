"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, Clock, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

const Hero = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-32" suppressHydrationWarning>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
                <div className="lg:grid lg:grid-cols-12 lg:gap-8" suppressHydrationWarning>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left"
                        suppressHydrationWarning
                    >
                        <h1>
                            <span className="block text-base font-semibold text-blue-600 sm:text-lg lg:text-base xl:text-lg">
                                Fresh &amp; Expert Maintenance
                            </span>
                            <span className="mt-1 block text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl">
                                <span className="block text-gray-900">Professional Care</span>
                                <span className="block text-blue-600">For Your Home</span>
                            </span>
                        </h1>
                        <p className="mt-3 text-base text-gray-800 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl font-medium">
                            From plumbing and electrical to cleaning and repair, book verified professionals in minutes.
                            The most reliable way to maintain your space.
                        </p>

                        <div className="mt-10 sm:flex sm:justify-center lg:justify-start" suppressHydrationWarning>
                            {!isAuthenticated && (
                                <div className="rounded-md shadow" suppressHydrationWarning>
                                    <Link
                                        href="/register"
                                        className="flex w-full items-center justify-center rounded-full border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 md:py-4 md:px-10 md:text-lg transition-all active:scale-95 shadow-lg"
                                    >
                                        Get Started
                                        <ChevronRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </div>
                            )}
                            <div className={!isAuthenticated ? "mt-3 sm:mt-0 sm:ml-3" : ""}>
                                <Link
                                    href="/services"
                                    className="flex w-full items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 md:py-4 md:px-10 md:text-lg transition-all active:scale-95"
                                >
                                    Browse Services
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center space-x-6 text-sm text-gray-700">
                            <div className="flex items-center">
                                <ShieldCheck className="w-5 h-5 text-green-500 mr-1" />
                                <span>Verified Pros</span>
                            </div>
                            <div className="flex items-center">
                                <Star className="w-5 h-5 text-yellow-400 mr-1" />
                                <span>4.8/5 Rating</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-6 lg:mx-0 lg:mt-0 lg:flex lg:items-center"
                    >
                        <div className="relative mx-auto w-full rounded-2xl shadow-2xl overflow-hidden bg-blue-100 p-2 min-h-64">
                            <Image
                                className="w-full rounded-xl"
                                src="/hero.png"
                                alt="Home maintenance professional"
                                width={800}
                                height={600}
                                priority
                            />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/50">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-blue-600 p-2 rounded-lg">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">Response Time</p>
                                        <p className="text-lg font-bold text-gray-900">&lt; 30 Mins</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-10 -left-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/50 hidden md:block">
                                <div className="flex items-center space-x-3">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                                <Image
                                                    src={`https://i.pravatar.cc/100?u=${i}`}
                                                    alt="User"
                                                    fill
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">1,000+ Happy Customers</p>
                                        <div className="flex text-yellow-400">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
