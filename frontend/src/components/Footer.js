import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8" suppressHydrationWarning>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12" suppressHydrationWarning>
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1 lg:col-span-1" suppressHydrationWarning>
                        <Link href="/" className="flex items-center mb-6" suppressHydrationWarning>
                            <span className="text-2xl font-bold text-blue-500">HomeCare</span>
                            <span className="text-2xl font-bold text-white">Market</span>
                        </Link>
                        <p className="text-gray-200 mb-6 leading-relaxed">
                            Your trusted partner for professional home maintenance services. We connect you with top-rated experts to keep your home in perfect condition.
                        </p>
                        <div className="flex space-x-4" suppressHydrationWarning>
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div suppressHydrationWarning>
                        <h3 className="text-lg font-bold mb-6 border-b border-gray-800 pb-2">Quick Links</h3>
                        <ul className="space-y-4">
                            <li><Link href="/services" className="text-gray-200 hover:text-white transition-colors">Browse Services</Link></li>
                            <li><Link href="/login" className="text-gray-200 hover:text-white transition-colors">Become a Partner</Link></li>
                            <li><Link href="/register" className="text-gray-200 hover:text-white transition-colors">Register as Customer</Link></li>
                            <li><Link href="/contact-services" className="text-gray-200 hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link href="/dashboard" className="text-gray-200 hover:text-white transition-colors">User Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div suppressHydrationWarning>
                        <h3 className="text-lg font-bold mb-6 border-b border-gray-800 pb-2">Popular Services</h3>
                        <p className="mt-4 text-white text-sm italic">
                            The ultimate marketplace for your home maintenance needs.
                        </p>
                        <ul className="space-y-4 text-gray-200">
                            <li>Plumberin Repairs</li>
                            <li>Electrical Installation</li>
                            <li>House Cleaning</li>
                            <li>AC Maintenance</li>
                            <li>Home Painting</li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div suppressHydrationWarning>
                        <h3 className="text-lg font-bold mb-6 border-b border-gray-800 pb-2">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <MapPin className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                                <span className="text-gray-200"> Service St, near UET, Lahore, Pakistan</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="w-5 h-5 text-blue-500 mr-3" />
                                <span className="text-gray-200">+92 300 1234567</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="w-5 h-5 text-blue-500 mr-3" />
                                <span className="text-gray-200">support@homecare.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div
                    className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6"
                    suppressHydrationWarning
                >
                    <p className="text-gray-400 font-medium text-sm">
                        © {new Date().getFullYear()} <span className="text-white font-bold">HomeCare Market</span>. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8">
                        <Link href="/privacy" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Privacy Policy</Link>
                        <Link href="/terms" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
