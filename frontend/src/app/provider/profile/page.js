"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfilePage from '@/components/ProfilePage';

export default function ProviderProfilePage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <ProfilePage />
            </main>
            <Footer />
        </div>
    );
}
