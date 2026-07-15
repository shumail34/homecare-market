"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import ServiceCard from '@/components/ServiceCard';
import { Star, ShieldCheck, Award, Briefcase, MapPin, Loader2, User, ChevronRight, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ProviderPublicProfile() {
    const { id } = useParams();
    const router = useRouter();
    const [provider, setProvider] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/', '') : 'http://127.0.0.1:8000';

    useEffect(() => {
        const fetchProviderData = async () => {
            try {
                const [providerRes, servicesRes] = await Promise.all([
                    api.get(`auth/users/${id}/`),
                    api.get(`services/?provider=${id}`)
                ]);
                setProvider(providerRes.data);
                setServices(servicesRes.data.results || servicesRes.data);
            } catch (error) {
                console.error('Error fetching provider profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProviderData();
    }, [id]);

    const getAvatarUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const separator = (backendUrl.endsWith('/') || url.startsWith('/')) ? '' : '/';
        return `${backendUrl}${separator}${url}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col pt-20 items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="mt-4 text-gray-500 font-medium">Loading profile...</p>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="min-h-screen flex flex-col pt-20 items-center justify-center bg-gray-50">
                <h2 className="text-2xl font-bold">Provider not found</h2>
                <button onClick={() => router.back()} className="mt-4 text-blue-600 font-bold underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

            <main className="flex-grow">
                {/* Header Cover Area */}
                <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-blue-800 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-10 pb-20">
                    {/* Profile Info and Badges - Now in a balanced 2-column layout to fill space */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-10 flex flex-col items-center justify-center text-center"
                            >
                                <div className="relative inline-block mb-6">
                                    <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 mx-auto">
                                        {provider.profile_picture ? (
                                            <img
                                                src={getAvatarUrl(provider.profile_picture)}
                                                alt={provider.full_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                                <User className="w-14 h-14 text-blue-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white shadow-sm"></div>
                                </div>

                                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{provider.full_name}</h1>

                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-green-100/50">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Verified Professional
                                </div>

                                <div className="grid grid-cols-2 gap-8 w-full pt-8 border-t border-gray-50">
                                    <div>
                                        <p className="text-2xl font-black text-gray-900 leading-none mb-1">
                                            {provider.average_rating > 0 ? parseFloat(provider.average_rating).toFixed(1) : 'NEW'}
                                        </p>
                                        <div className="flex items-center justify-center text-yellow-500 gap-1.5">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Career Rating</span>
                                        </div>
                                    </div>
                                    <div className="border-l border-gray-50">
                                        <p className="text-2xl font-black text-gray-900 leading-none mb-1">{services.length}</p>
                                        <div className="flex items-center justify-center text-blue-500 gap-1.5">
                                            <Briefcase className="w-3 h-3" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Services</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10 flex flex-col"
                            >
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-blue-500" />
                                    Professional Credentials
                                </h3>

                                <div className="grid grid-cols-1 gap-6 flex-grow">
                                    <div className="flex items-center gap-5 p-5 bg-blue-50/30 rounded-3xl border border-blue-100/30 group hover:bg-blue-600 hover:scale-[1.02] transition-all cursor-default group">
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                            <Award className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-gray-900 group-hover:text-white transition-colors">Elite Provider</p>
                                            <p className="text-[10px] font-bold text-gray-400 group-hover:text-blue-100 uppercase tracking-widest transition-colors">Top 1% Quality Marketplace Score</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-5 p-5 bg-green-50/30 rounded-3xl border border-green-100/30 group hover:bg-green-600 hover:scale-[1.02] transition-all cursor-default group">
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-gray-900 group-hover:text-white transition-colors">Instant Responder</p>
                                            <p className="text-[10px] font-bold text-gray-400 group-hover:text-green-100 uppercase tracking-widest transition-colors">Avg. Response Time: Under 2 Minutes</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-50 flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                        <MapPin className="w-4 h-4 text-red-500" />
                                        <span className="text-xs font-black text-gray-600 uppercase tracking-tighter">{provider.city || 'Verified Base'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        <span className="text-xs font-black text-gray-600 uppercase tracking-tighter">Experience: 5+ Yrs</span>
                                    </div>
                                </div>

                            </motion.div>
                        </div>
                    </div>

                    {/* Services List - Now centered and prioritized */}
                    <div className="lg:col-span-3 mt-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10"
                        >
                            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                                        <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">Service Portfolio</h2>
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">Expert Services Offered</h3>
                                </div>
                                <div className="px-5 py-2 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                                    <span className="text-sm font-black text-gray-600 uppercase tracking-widest">{services.length} Total Results</span>
                                </div>
                            </div>

                            {services.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {services.map((service) => (
                                        <ServiceCard key={service.id} service={service} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Briefcase className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Portfolio is Empty</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto">This professional hasn't listed any public services yet. Check back soon for updates!</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
