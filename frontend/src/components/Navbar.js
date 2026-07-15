"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, User, LogOut, Briefcase, Calendar, MessageSquare, Home, List, Wallet, LayoutDashboard, Phone, Info, Bell } from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [pendingCount, setPendingCount] = useState(0);

    const toggleMenu = () => setIsOpen(!isOpen);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Build nav links based on role
    const isProvider = user?.role === 'SERVICE_PROVIDER';
    const isCustomer = user?.role === 'CUSTOMER';
    const isAdmin = user?.role === 'ADMIN';

    // Fetch pending bookings count for providers
    useEffect(() => {
        if (isAuthenticated && isProvider) {
            const fetchPendingCount = async () => {
                try {
                    const response = await api.get('bookings/provider/', { params: { status: 'PENDING' } });
                    // Handle both paginated and non-paginated responses
                    const count = response.data.count !== undefined ? response.data.count : (Array.isArray(response.data) ? response.data.length : 0);
                    setPendingCount(count);
                } catch (error) {
                    console.error('Error fetching pending count:', error);
                }
            };
            fetchPendingCount();

            // Refresh every 2 minutes
            const interval = setInterval(fetchPendingCount, 120000);
            return () => clearInterval(interval);
        } else {
            setPendingCount(0);
        }
    }, [isAuthenticated, isProvider]);

    const navLinks = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Services', href: '/services', icon: Briefcase },
        // Only show Contact to guests and customers, not providers
        ...(!isProvider ? [{ name: 'Contact', href: '/contact-services', icon: Phone }] : []),
    ];

    if (isAuthenticated) {
        if (isCustomer) {
            navLinks.push(
                { name: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
                { name: 'My Bookings', href: '/customer/bookings', icon: Calendar }
            );
        } else if (isProvider) {
            navLinks.push(
                { name: 'Dashboard', href: '/provider/dashboard', icon: LayoutDashboard },
                { name: 'My Jobs', href: '/provider/bookings', icon: Calendar, badge: pendingCount },
                { name: 'My Services', href: '/provider/services', icon: List },
                { name: 'My Wallet', href: '/provider/wallet', icon: Wallet }
            );
        } else if (isAdmin) {
            navLinks.push(
                { name: 'Admin Dashboard', href: '/admin/financials', icon: Wallet }
            );
        }
    }

    const getProfileLink = () => {
        if (user?.role === 'CUSTOMER') return '/customer/profile';
        if (user?.role === 'SERVICE_PROVIDER') return '/provider/profile';
        return '#';
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50" suppressHydrationWarning>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
                <div className="flex justify-between h-16" suppressHydrationWarning>
                    <div className="flex items-center" suppressHydrationWarning>
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold text-blue-600">HomeCare</span>
                            <span className="text-2xl font-bold text-gray-800">Market</span>
                        </Link>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8" suppressHydrationWarning>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-xl text-sm font-bold transition-all flex items-center group active:scale-95"
                                >
                                    {link.icon && <link.icon className="w-4 h-4 mr-1.5 opacity-60 group-hover:opacity-100 transition-opacity" />}
                                    {link.name}
                                    {link.badge > 0 && (
                                        <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-pulse ring-2 ring-white">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="hidden sm:flex sm:items-center sm:space-x-4" suppressHydrationWarning>
                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef} suppressHydrationWarning>
                                {/* Avatar trigger */}
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center group focus:outline-none"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-white shadow-sm ring-2 ring-blue-100 overflow-hidden flex items-center justify-center transition-all group-hover:ring-blue-400 group-active:scale-95">
                                        {user?.profile_picture ? (
                                            <img
                                                src={getImageUrl(user.profile_picture)}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-6 h-6 text-blue-300" />
                                        )}
                                    </div>
                                    <div className="ml-3 hidden lg:block text-left">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Account</p>
                                        <p className="text-sm font-bold text-gray-900 leading-none group-hover:text-blue-600 transition-colors">
                                            {user?.full_name ? user.full_name.split(' ')[0] : 'User'}
                                        </p>
                                    </div>
                                </button>

                                {/* Dropdown */}
                                <AnimatePresence>
                                    {dropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                                        >
                                            {/* User info header */}
                                            <div className="px-5 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
                                                <p className="text-sm font-black text-gray-900">{user?.full_name}</p>
                                                <p className="text-xs font-bold text-blue-500 mt-0.5">{user?.email}</p>
                                                <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                                                    {user?.role === 'SERVICE_PROVIDER' ? '🔧 Provider' : user?.role === 'CUSTOMER' ? '👤 Customer' : '⚙️ Admin'}
                                                </span>
                                            </div>

                                            {/* Links */}
                                            <div className="py-2">
                                                <Link
                                                    href={getProfileLink()}
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center px-5 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                >
                                                    <User className="w-4 h-4 mr-3 opacity-60" />
                                                    View Profile
                                                </Link>
                                            </div>

                                            {/* Logout */}
                                            <div className="py-2">
                                                <button
                                                    onClick={() => { logout(); setDropdownOpen(false); }}
                                                    className="w-full flex items-center px-5 py-3 text-sm font-black text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4 mr-3" />
                                                    Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4" suppressHydrationWarning>
                                <Link
                                    href="/login"
                                    className="text-black hover:text-blue-600 font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center sm:hidden" suppressHydrationWarning>
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="sm:hidden bg-white border-t border-gray-100"
                    >
                        <div className="px-4 pt-4 pb-3 space-y-2">
                            {isAuthenticated && (
                                <Link
                                    href={getProfileLink()}
                                    className="flex items-center p-4 bg-blue-50/50 rounded-2xl mb-4 border border-blue-50 ring-1 ring-blue-100"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden flex items-center justify-center bg-white mr-4">
                                        {user?.profile_picture ? (
                                            <img
                                                src={getImageUrl(user.profile_picture)}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-6 h-6 text-blue-200" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-0.5">My Profile</p>
                                        <p className="text-lg font-black text-gray-900 leading-tight">{user?.full_name}</p>
                                    </div>
                                </Link>
                            )}

                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="px-4 py-3.5 rounded-2xl text-base font-black text-gray-800 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center group active:scale-95"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors relative">
                                        {link.icon && <link.icon className="w-5 h-5 opacity-60 group-hover:opacity-100" />}
                                        {link.badge > 0 && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                                                {link.badge}
                                            </div>
                                        )}
                                    </div>
                                    {link.name}
                                </Link>
                            ))}

                            {isAuthenticated ? (
                                <div className="pt-4 mt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center px-4 py-4 rounded-2xl text-base font-black text-red-600 hover:bg-red-50 transition-all active:scale-95"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mr-4">
                                            <LogOut className="w-5 h-5" />
                                        </div>
                                        Logout from Account
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
