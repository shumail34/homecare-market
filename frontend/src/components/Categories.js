"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import Image from 'next/image';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('services/categories/');
                setCategories(response.data.results || response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-100 animate-pulse h-40">
                            <div className="w-16 h-16 mb-4 rounded-xl bg-gray-200" />
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-gray-100 rounded w-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6" suppressHydrationWarning>
                {categories.map((category, index) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                        <Link
                            href={`/services?category=${category.id}`}
                            className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all text-center h-full"
                        >
                            <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                {(() => {
                                    const backendUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/', '') : 'http://127.0.0.1:8000';
                                    const iconUrl = category.icon_url
                                        ? (category.icon_url.startsWith('http') ? category.icon_url : `${backendUrl}${category.icon_url}`)
                                        : 'https://cdn-icons-png.flaticon.com/512/3094/3094833.png';
                                    return (
                                        <div className="relative w-10 h-10">
                                            <Image
                                                src={iconUrl}
                                                alt={category.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    );
                                })()}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {category.name}
                            </h3>
                            <p className="mt-2 text-sm text-gray-800 line-clamp-2">
                                {category.description}
                            </p>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Categories;
