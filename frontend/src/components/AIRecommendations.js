"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import ServiceCard from './ServiceCard';
import SkeletonCard from './SkeletonCard';
import { Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

const AIRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("Recommended Services");

    useEffect(() => {
        const fetchRecommendations = async (categoryId = null, location = null, maxBudget = null) => {
            setLoading(true);
            try {
                const params = { limit: 4 };
                if (categoryId) params.category_id = categoryId;
                if (location) params.city = location;
                if (maxBudget) params.max_price = maxBudget;

                const response = await api.get('ai/recommendations/', { params });
                setRecommendations(response.data || []);
            } catch (error) {
                console.error('Error fetching AI recommendations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();

        // Real-time AI Intent Listener
        const handleSmartIntent = async (event) => {
            const { category, location, max_budget } = event.detail;

            try {
                let catId = null;
                if (category && category !== 'General') {
                    // Try to match category name to an ID
                    const catRes = await api.get('services/categories/');
                    const categories = catRes.data.results || catRes.data;
                    const found = categories.find(c =>
                        c.name.toLowerCase().includes(category.toLowerCase())
                    );
                    if (found) {
                        catId = found.id;
                        setTitle(`Hand-picked ${found.name} Experts ${location ? `in ${location}` : ''}`);
                    }
                }

                if (location || max_budget || catId) {
                    fetchRecommendations(catId, location, max_budget);
                }
            } catch (e) {
                console.error("Event handling error:", e);
            }
        };

        window.addEventListener('smart-intent-discovered', handleSmartIntent);
        return () => window.removeEventListener('smart-intent-discovered', handleSmartIntent);
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) return null;

    return (
        <section className="py-16 bg-white border-y border-gray-100" suppressHydrationWarning>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
                <div className="mb-10" suppressHydrationWarning>
                    <h2 className="text-3xl font-black text-gray-900 sm:text-4xl tracking-tight">
                        {title}
                    </h2>
                    <p className="mt-3 text-lg text-gray-600 font-medium max-w-2xl">
                        Hand-picked professionals based on quality and reliability.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" suppressHydrationWarning>
                    {recommendations.map((rec, index) => {
                        return (
                            <motion.div
                                key={rec.service.id}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="h-full"
                            >
                                <ServiceCard service={rec.service} />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default AIRecommendations;
