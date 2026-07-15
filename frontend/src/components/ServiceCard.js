"use client";

import React, { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, User, MapPin, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

const ServiceCard = memo(({ service }) => {
    const { user } = useAuth();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/', '') : 'http://127.0.0.1:8000';

    const getImageUrl = (img) => {
        if (!img) return `https://images.unsplash.com/photo-1581578731548-c64695cc6954?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60`;
        if (img.startsWith('http')) return img;
        const separator = (backendUrl.endsWith('/') || img.startsWith('/')) ? '' : '/';
        return `${backendUrl}${separator}${img}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all group flex flex-col h-full"
        >
            <div className="relative h-44 flex-shrink-0 overflow-hidden bg-gray-100">
                <Image
                    src={getImageUrl(service.image)}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-blue-600 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                        {service.category_name}
                    </span>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {service.title}
                    </h3>
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center text-yellow-500 bg-yellow-50 px-2.5 py-1 rounded-lg flex-shrink-0 border border-yellow-100/50">
                            <Star className="w-3.5 h-3.5 fill-current mr-1" />
                            <span className="text-[11px] font-black">{service.average_rating > 0 ? parseFloat(service.average_rating).toFixed(1) : 'NEW'}</span>
                        </div>
                        {service.total_bookings > 0 && (
                            <div className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100/50">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                <span className="text-[9px] font-black tabular-nums">{service.total_bookings}</span>
                            </div>
                        )}
                    </div>
                </div>

                {(service.area || service.city) && (
                    <div className="flex items-center text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">
                        <MapPin className="w-3 h-3 text-blue-500 mr-1" />
                        <span className="line-clamp-1">{service.area}{service.area && service.city ? ', ' : ''}{service.city}</span>
                    </div>
                )}

                <div className="flex-grow">
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 font-medium h-10 overflow-hidden leading-snug">
                        {service.description}
                    </p>
                </div>

                <div className="pt-4 border-t border-gray-50 mb-5">
                    <Link
                        href={`/providers/${service.provider}`}
                        className="flex items-center justify-between group/provider"
                    >
                        <div className="flex items-center space-x-2">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden text-[11px] font-black border-2 border-white shadow-sm transition-transform group-hover/provider:scale-105">
                                {service.provider_name ? service.provider_name.charAt(0) : <User className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-gray-900 line-clamp-1 uppercase tracking-tight leading-none mb-1">{service.provider_name || 'Professional'}</span>
                                <div className="flex items-center text-[9px] text-blue-600 font-black tracking-wider uppercase opacity-80">
                                    <Star className="w-2.5 h-2.5 fill-current mr-1 text-yellow-400" />
                                    <span>{service.provider_rating > 0 ? `${parseFloat(service.provider_rating).toFixed(1)} Rating` : 'NEW PROVIDER'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter mb-0.5 opacity-60">Price/hr</p>
                            <p className="text-base font-black text-blue-600">Rs. {service.price_per_hour}</p>
                        </div>
                    </Link>
                </div>

                <Link
                    href={user?.id === service.provider ? "/provider/services" : `/services/${service.id}`}
                    className={`w-full flex items-center justify-center font-black text-sm py-3 px-4 rounded-2xl transition-all active:scale-95 shadow-sm ${user?.id === service.provider
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-900 hover:bg-blue-600 text-white"
                        }`}
                >
                    {user?.id === service.provider ? "Manage My Service" : "Book Service"}
                </Link>
            </div>
        </motion.div>
    );
});

ServiceCard.displayName = 'ServiceCard';

export default ServiceCard;
