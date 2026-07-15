"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import {
    Plus, Edit, Trash2, Image as ImageIcon,
    Loader2, AlertCircle, CheckCircle2, Banknote,
    Tag, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProviderServices() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        price_per_hour: '',
        is_available: true,
        area: '',
        city: '',
        image: null
    });

    const [editingId, setEditingId] = useState(null);

    const [imagePreview, setImagePreview] = useState(null);

    const fetchServices = async () => {
        try {
            const response = await api.get('services/my-services/');
            const catsResponse = await api.get('services/categories/');
            setServices(response.data.results || response.data);
            setCategories(catsResponse.data.results || catsResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('category', formData.category);
        data.append('description', formData.description);
        data.append('price_per_hour', formData.price_per_hour);
        data.append('area', formData.area);
        data.append('city', formData.city);
        data.append('is_available', formData.is_available);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            if (editingId) {
                await api.patch(`services/${editingId}/`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                await api.post('services/', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            setIsFormOpen(false);
            setEditingId(null);
            setFormData({ title: '', category: '', description: '', price_per_hour: '', area: '', city: '', is_available: true, image: null });
            setImagePreview(null);
            fetchServices();
        } catch (error) {
            console.error('Error creating service:', error);
            let errorMessage = 'Failed to create service.';
            if (error.response?.data) {
                // Collect all error messages
                const messages = Object.values(error.response.data).flat();
                if (messages.length > 0) {
                    errorMessage = messages.join('\n');
                }
            }
            alert(errorMessage);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this service?')) return;
        try {
            await api.delete(`services/${id}/`);
            fetchServices();
        } catch (error) {
            console.error('Error deleting service:', error);
        }
    };

    const handleEditClick = (service) => {
        setFormData({
            title: service.title || '',
            category: service.category || '',
            description: service.description || '',
            price_per_hour: service.price_per_hour || '',
            area: service.area || '',
            city: service.city || '',
            is_available: service.is_available ?? true,
            image: null // user can upload a new one if they want
        });
        setEditingId(service.id);

        // Show existing image in preview if there is one
        if (service.image) {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/', '') : 'http://127.0.0.1:8000';
            const sep = (backendUrl.endsWith('/') || service.image.startsWith('/')) ? '' : '/';
            setImagePreview(service.image.startsWith('http') ? service.image : `${backendUrl}${sep}${service.image}`);
        } else {
            setImagePreview(null);
        }

        setIsFormOpen(true);
        // smooth scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Your Services</h1>
                        <p className="text-gray-900 mt-1 font-bold">List and manage your professional offerings.</p>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center active:scale-95"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Service
                    </button>
                </div>

                <AnimatePresence>
                    {isFormOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-12"
                        >
                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-blue-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Plus className="w-32 h-32" />
                                </div>
                                <h2 className="text-2xl font-bold mb-8 text-gray-900">
                                    {editingId ? 'Edit Service Listing' : 'Create New Service Listing'}
                                </h2>

                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Service Title</label>
                                            <div className="relative">
                                                <Info className="absolute left-4 top-4 w-5 h-5 text-gray-700" />
                                                <input
                                                    type="text" required
                                                    value={formData.title}
                                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                    placeholder="e.g. Expert Home Plumberin"
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                            <div className="relative">
                                                <Tag className="absolute left-4 top-4 w-5 h-5 text-gray-700" />
                                                <select
                                                    required
                                                    value={formData.category}
                                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Price per Hour (Rs.)</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-4 text-gray-700 font-bold">Rs.</div>
                                                <input
                                                    type="number" required
                                                    value={formData.price_per_hour}
                                                    onChange={e => setFormData({ ...formData, price_per_hour: e.target.value })}
                                                    placeholder="e.g. 500"
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Area</label>
                                                <input
                                                    type="text" required
                                                    value={formData.area}
                                                    onChange={e => setFormData({ ...formData, area: e.target.value })}
                                                    placeholder="e.g. Gulberg"
                                                    className="w-full px-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                                                <input
                                                    type="text" required
                                                    value={formData.city}
                                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                    placeholder="e.g. Lahore"
                                                    className="w-full px-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Service Cover Image</label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    id="service-image-upload"
                                                />
                                                <label
                                                    htmlFor="service-image-upload"
                                                    className="flex items-center justify-center w-full p-4 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                                >
                                                    {imagePreview ? (
                                                        <div className="relative w-full h-32">
                                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                                                <ImageIcon className="text-white w-8 h-8" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center py-4">
                                                            <ImageIcon className="w-8 h-8 text-gray-600 group-hover:text-blue-500 mb-2" />
                                                            <span className="text-sm text-gray-800 group-hover:text-blue-600 font-medium">Click to upload image</span>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Service Description</label>
                                            <textarea
                                                required
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Describe your expertise, tools, and what's included..."
                                                className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none h-[120px] resize-none"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id="is_available"
                                                checked={formData.is_available}
                                                onChange={e => setFormData({ ...formData, is_available: e.target.checked })}
                                                className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <label htmlFor="is_available" className="text-sm font-bold text-gray-700">Currently Available for Bookings</label>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="submit"
                                                disabled={formLoading}
                                                className="flex-grow bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center"
                                            >
                                                {formLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (editingId ? "Update Listing" : "Create Listing")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsFormOpen(false);
                                                    setEditingId(null);
                                                    setFormData({ title: '', category: '', description: '', price_per_hour: '', area: '', city: '', is_available: true, image: null });
                                                    setImagePreview(null);
                                                }}
                                                className="px-8 bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                ) : services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
                            >
                                <div className="h-40 bg-gray-100 relative">
                                    {(() => {
                                        const backendUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/', '') : 'http://127.0.0.1:8000';
                                        const sep = (backendUrl.endsWith('/') || (service.image && service.image.startsWith('/'))) ? '' : '/';
                                        const imageUrl = service.image
                                            ? (service.image.startsWith('http') ? service.image : `${backendUrl}${sep}${service.image}`)
                                            : "https://images.unsplash.com/photo-1581578731548-c64695cc6954?auto=format&fit=crop&w=800&q=60";
                                        return (
                                            <img
                                                src={imageUrl}
                                                alt={service.title}
                                                className="w-full h-full object-cover"
                                            />
                                        );
                                    })()}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-sm text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase">
                                            {service.category_name}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex-grow">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{service.title}</h3>
                                        <span className="text-lg font-black text-blue-600">Rs. {service.price_per_hour}</span>
                                    </div>
                                    {(service.area || service.city) && (
                                        <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase mb-4">
                                            <span className="mr-1">📍</span>
                                            {service.area}{service.area && service.city ? ', ' : ''}{service.city}
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-800 line-clamp-3 mb-6">{service.description}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full mr-2 ${service.is_available ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            <p className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center mb-1">
                                                {service.is_available ? 'Active' : 'Offline'}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditClick(service)}
                                                className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="p-2 text-gray-700 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                            <Plus className="w-12 h-12" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No services yet</h3>
                        <p className="mt-2 text-gray-800">Add your first service to start receiving requests.</p>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
