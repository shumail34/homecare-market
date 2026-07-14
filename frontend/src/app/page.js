import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Footer from "@/components/Footer";
import dynamic from 'next/dynamic';

const AIRecommendations = dynamic(() => import("@/components/AIRecommendations"), { ssr: false });
const PopularServices = dynamic(() => import("@/components/PopularServices"), { ssr: false });
import { ShieldCheck, Zap, Award } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white page-fade-in" suppressHydrationWarning>
      <Navbar />
      <main className="flex-grow">
        <Hero />

        {/* Categories Section */}
        <section className="bg-white py-20" suppressHydrationWarning>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16" suppressHydrationWarning>
            <h2 className="text-3xl font-black text-gray-900 sm:text-5xl tracking-tight">
              What do you need help with?
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto font-medium">
              Choose from our wide range of professional services for your home.
            </p>
          </div>
          <Categories />
        </section>

        <AIRecommendations />

        <PopularServices />

        {/* Features Section */}
        <section className="bg-gray-50 py-20" suppressHydrationWarning>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center" suppressHydrationWarning>
              <div>
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Secure Payments</h3>
                <p className="text-gray-600">All transactions are secure and protected with our built-in payment system.</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">On-Time Service</h3>
                <p className="text-gray-600">Our professionals respect your time and arrive promptly as scheduled.</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Verified Pros</h3>
                <p className="text-gray-600">Every service provider undergoes a strict verification process for your safety.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
