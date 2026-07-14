"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServiceCard from '@/components/ServiceCard';
import SkeletonCard from '@/components/SkeletonCard';
import api from '@/lib/api';
import { Search, Filter, SlidersHorizontal, Loader2, MapPin, Banknote, ArrowUpDown, X, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ServicesContent() {
    const searchParams = useSearchParams();
    const categoryId = searchParams.get('category');

    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(categoryId || '');

    // New Filters state
    const [showFilters, setShowFilters] = useState(false);
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
    const [city, setCity] = useState(searchParams.get('city') || '');
    const [area, setArea] = useState(searchParams.get('area') || '');
    const [sortBy, setSortBy] = useState('-created_at');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [servicesRes, categoriesRes] = await Promise.all([
                    api.get('services/', {
                        params: {
                            category: selectedCategory,
                            search: search,
                            price_per_hour__gte: minPrice,
                            price_per_hour__lte: maxPrice,
                            city__icontains: city,
                            area__icontains: area,
                            ordering: sortBy
                        }
                    }),
                    api.get('services/categories/')
                ]);
                setServices(servicesRes.data.results || servicesRes.data);
                setCategories(categoriesRes.data.results || categoriesRes.data);
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [selectedCategory, search, minPrice, maxPrice, city, area, sortBy]);

    // Handle initial category from URL or AI redirection
    useEffect(() => {
        const cat = searchParams.get('category');
        const ct = searchParams.get('city');
        const max = searchParams.get('max_price');

        if (cat) setSelectedCategory(cat);
        if (ct) setCity(ct);
        if (max) setMaxPrice(max);

        if (ct || max || cat) {
            setShowFilters(true);
        }
    }, [searchParams]);

    const resetFilters = () => {
        setSearch('');
        setSelectedCategory('');
        setMinPrice('');
        setMaxPrice('');
        setCity('');
        setArea('');
        setSortBy('-created_at');
    };

    // Handle real-time AI intent from Chatbot
    useEffect(() => {
        const handleSmartIntent = (event) => {
            const { category, max_budget, urgency, location, preferences } = event.detail;
            let hasSpecificIntent = false;

            // 1. Try to find and set category
            if (category && category !== 'General' && categories.length > 0) {
                const foundCategory = categories.find(c =>
                    c.name.toLowerCase().includes(category.toLowerCase()) ||
                    category.toLowerCase().includes(c.name.toLowerCase())
                );
                if (foundCategory) {
                    setSelectedCategory(foundCategory.id.toString());
                    hasSpecificIntent = true;
                }
            }

            // 2. Set Budget Filter directly
            if (max_budget) {
                setMaxPrice(max_budget.toString());
                hasSpecificIntent = true;
            }

            // 3. Set Location Filter directly
            if (location) {
                setCity(location);
                hasSpecificIntent = true;
            }

            // If we have a specific intent (Category, Price, or City), 
            // we should CLEAR the manual search text to avoid conflicts
            // e.g. User types "hello" then asks AI for "cleaning"
            if (hasSpecificIntent) {
                setSearch('');
                setShowFilters(true);
            }
        };

        window.addEventListener('smart-intent-discovered', handleSmartIntent);
        return () => window.removeEventListener('smart-intent-discovered', handleSmartIntent);
    }, [categories]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col gap-8 mb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Available Services</h1>
                        <p className="mt-2 text-gray-800">Find and book the best professionals for your home.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-grow md:min-w-[400px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by service title, location or keywords..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-white font-medium"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all border ${showFilters ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-gray-900 border-gray-100 shadow-sm hover:border-blue-200'}`}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            Filters
                            {(minPrice || maxPrice || city || area || selectedCategory) && (
                                <span className="flex items-center justify-center w-5 h-5 bg-current text-blue-600 rounded-full text-[10px] ml-1 bg-white">
                                    !
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-white rounded-[2rem] border border-gray-100 shadow-xl">
                                {/* Sort Section */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <ArrowUpDown className="w-3 h-3" /> Sort By
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm transition-all"
                                    >
                                        <option value="-created_at">Newest First</option>
                                        <option value="price_per_hour">Price: Low to High</option>
                                        <option value="-price_per_hour">Price: High to Low</option>
                                    </select>
                                </div>

                                {/* Category Section */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Filter className="w-3 h-3" /> Category
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm transition-all"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Range Section */}
                                <div className="space-y-3 md:col-span-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Banknote className="w-3 h-3" /> Price Range (PKR)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="w-1/2 px-4 py-3 rounded-xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm transition-all"
                                        />
                                        <span className="text-gray-300">-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-1/2 px-4 py-3 rounded-xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Location Section */}
                                <div className="space-y-3 md:col-span-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="w-3 h-3" /> City & Area
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="w-1/2 px-4 py-3 rounded-xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm transition-all"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Area"
                                            value={area}
                                            onChange={(e) => setArea(e.target.value)}
                                            className="w-1/2 px-4 py-3 rounded-xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-4 flex justify-end pt-2 border-t border-gray-50 mt-2">
                                    <button
                                        onClick={resetFilters}
                                        className="text-xs font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2"
                                    >
                                        <X className="w-3 h-3" /> Clear All Filters
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Active Filter Chips */}
                {(search || minPrice || maxPrice || city || area || selectedCategory) && (
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Active:</span>
                        {search && (
                            <button onClick={() => setSearch('')} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-colors">
                                "{search}" <X className="w-3 h-3" />
                            </button>
                        )}
                        {selectedCategory && (
                            <button onClick={() => setSelectedCategory('')} className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100 hover:bg-green-100 transition-colors">
                                {categories.find(c => c.id.toString() === selectedCategory)?.name} <X className="w-3 h-3" />
                            </button>
                        )}
                        {(minPrice || maxPrice) && (
                            <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full text-xs font-bold border border-orange-100 hover:bg-orange-100 transition-colors">
                                PKR {minPrice || '0'} - {maxPrice || 'Any'} <X className="w-3 h-3" />
                            </button>
                        )}
                        {city && (
                            <button onClick={() => setCity('')} className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-bold border border-purple-100 hover:bg-purple-100 transition-colors">
                                City: {city} <X className="w-3 h-3" />
                            </button>
                        )}
                        {area && (
                            <button onClick={() => setArea('')} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors">
                                Area: {area} <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200"
                >
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No services found</h3>
                    <p className="mt-2 text-gray-800">Try adjusting your filters or search keywords.</p>
                    <button
                        onClick={resetFilters}
                        className="mt-6 font-bold text-blue-600 hover:text-blue-500 transition-colors"
                    >
                        Clear all filters
                    </button>
                </motion.div>
            )}
        </div>
    );
}

export default function ServicesPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white page-fade-in">
            <Navbar />
            <Suspense fallback={
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
            }>
                <ServicesContent />
            </Suspense>
            <Footer />
        </div>
    );
}
