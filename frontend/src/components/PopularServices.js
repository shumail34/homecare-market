"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import ServiceCard from './ServiceCard';
import SkeletonCard from './SkeletonCard';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const PopularServices = () => {
    const [title, setTitle] = useState("Popular Services");
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPopular = async (categoryId = null, location = null, maxBudget = null) => {
        setLoading(true);
        try {
            const params = { limit: 9, ordering: '-avg_rating' };
            if (categoryId) params.category = categoryId;
            if (location) params.city__icontains = location;
            if (maxBudget) params.price_per_hour__lte = maxBudget;
            const response = await api.get('services/', { params });
            setServices(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching popular services:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPopular();

        const handleSmartIntent = async (event) => {
            const { category, location, max_budget } = event.detail;

            try {
                let catId = null;
                if (category && category !== 'General') {
                    const catRes = await api.get('services/categories/');
                    const categories = catRes.data.results || catRes.data;
                    const found = categories.find(c =>
                        c.name.toLowerCase().includes(category.toLowerCase())
                    );
                    if (found) {
                        catId = found.id;
                        setTitle(`Top Recommended ${found.name} Experts ${location ? `in ${location}` : ''}`);
                    }
                } else if (location) {
                    setTitle(`Top Rated Experts in ${location}`);
                }

                if (location || max_budget || catId) {
                    fetchPopular(catId, location, max_budget);
                }
            } catch (e) {
                setTitle("Popular Services");
                fetchPopular();
            }
        };

        window.addEventListener('smart-intent-discovered', handleSmartIntent);
        return () => window.removeEventListener('smart-intent-discovered', handleSmartIntent);
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (services.length === 0) return null;

    return (
        <section className="py-20 bg-white" suppressHydrationWarning>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
                <div className="flex items-end justify-between mb-12" suppressHydrationWarning>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl tracking-tight">
                            {title}
                        </h2>
                        <p className="mt-3 text-lg text-gray-600 font-medium">
                            Highly rated professionals trusted by our community.
                        </p>
                    </div>
                    <Link
                        href="/services"
                        className="hidden sm:flex items-center text-blue-600 font-bold hover:text-blue-700 transition-all group"
                    >
                        View All Services
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" suppressHydrationWarning>
                    {services.slice(0, 9).map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="h-full"
                        >
                            <ServiceCard service={service} />
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center sm:hidden" suppressHydrationWarning>
                    <Link
                        href="/services"
                        className="inline-flex items-center bg-blue-50 text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-100 transition-all"
                    >
                        Browse All Services
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default PopularServices;
