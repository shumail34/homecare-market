"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, FileText, Camera, Loader2, Save, CheckCircle2, AlertCircle, Star } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePage = () => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        full_name: '',
        bio: '',
        address: '',
        phone_number: ''
    });
    const [uploadingPic, setUploadingPic] = useState(false);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                bio: user.bio || '',
                address: user.address || '',
                phone_number: user.phone_number || ''
            });
            setLoading(false);
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        await uploadImage(file);
    };

    const uploadImage = async (file) => {
        setUploadingPic(true);
        setMessage({ type: '', text: '' });

        try {
            const uploadData = new FormData();
            uploadData.append('profile_picture', file);

            await api.patch('auth/profile/', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            await refreshUser();
            setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({
                type: 'error',
                text: 'Failed to upload profile picture. Please try again.'
            });
        } finally {
            setUploadingPic(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const updateData = {
                full_name: formData.full_name,
                bio: formData.bio,
                address: formData.address
            };
            const response = await api.put('auth/profile/', updateData);
            await refreshUser();
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Update error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to update profile. Please try again.'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20" suppressHydrationWarning>
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto" suppressHydrationWarning>
            <div className="mb-10" suppressHydrationWarning>
                <h1 className="text-3xl font-extrabold text-gray-900">Account Settings</h1>
                <p className="text-gray-800 mt-1">Manage your public profile and personal information.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden" suppressHydrationWarning>
                {/* Header/Cover */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700" suppressHydrationWarning></div>

                <div className="px-8 pb-10" suppressHydrationWarning>
                    <div className="relative -mt-16 mb-8 flex items-end justify-between" suppressHydrationWarning>
                        <div className="relative" suppressHydrationWarning>
                            <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-xl" suppressHydrationWarning>
                                <div className="w-full h-full rounded-[1.25rem] bg-blue-50 flex items-center justify-center text-blue-600 overflow-hidden relative">
                                    {uploadingPic ? (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                        </div>
                                    ) : null}
                                    {user?.profile_picture ? (
                                        <img
                                            src={user.profile_picture.startsWith('http') ? user.profile_picture : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '')}${user.profile_picture}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-16 h-16" />
                                    )}
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPic}
                                className="absolute bottom-2 right-2 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-800 hover:text-blue-600 transition-all hover:scale-110 disabled:opacity-50"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="bg-blue-50 px-4 py-2 rounded-xl">
                                <span className="text-blue-700 font-bold text-sm uppercase tracking-widest">{user?.role?.replace('_', ' ')}</span>
                            </div>

                            {user?.role === 'SERVICE_PROVIDER' && (
                                <div className="bg-yellow-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-yellow-100 shadow-sm">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-yellow-700 font-black text-sm">{user?.average_rating || '5.0'} / 5.0 Rating</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8" suppressHydrationWarning>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" suppressHydrationWarning>
                            <div suppressHydrationWarning>
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                                    <User className="w-4 h-4 mr-2 text-blue-500" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                />
                            </div>

                            <div suppressHydrationWarning>
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                                    <Mail className="w-4 h-4 mr-2 text-blue-500" />
                                    Phone Number (Login)
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={formData.phone_number}
                                    className="w-full px-5 py-4 bg-gray-100 border-none rounded-2xl text-gray-600 cursor-not-allowed outline-none"
                                />
                                <p className="mt-2 text-[10px] text-gray-700">Phone number cannot be changed once verified.</p>
                            </div>

                            <div className="md:col-span-2" suppressHydrationWarning>
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-blue-500" />
                                    Bio / Expertise
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Tell us a bit about yourself or your professional background..."
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none h-32 resize-none text-gray-800"
                                />
                            </div>

                            <div className="md:col-span-2" suppressHydrationWarning>
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                                    Location / Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="e.g. Innovation Hub, Block 4, Karachi"
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {message.text && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-2xl flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}
                                suppressHydrationWarning
                            >
                                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
                                <span className="text-sm font-medium">{message.text}</span>
                            </motion.div>
                        )}

                        <div className="pt-6 border-t border-gray-50 flex justify-end" suppressHydrationWarning>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-blue-600 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 flex items-center transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <Save className="w-5 h-5 mr-2" />
                                )}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
