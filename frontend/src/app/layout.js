import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import dynamic from 'next/dynamic';

const ChatbotWidget = dynamic(() => import("@/components/ChatbotWidget"), { ssr: false });
const MessagesWidget = dynamic(() => import("@/components/MessagesWidget"), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Home-Care Market | Reliable Home Services & Professional Pros",
  description: "Book verified professionals for home cleaning, plumbing, electrical work, and more. Transparent pricing and secure payments.",
  keywords: "home services, cleaning, plumbing, electrician, handyman, home maintenance",
  openGraph: {
    title: "Home-Care Market",
    description: "Reliable, Professional Home Services at Your Fingertips",
    type: "website",
    locale: "en_US",
    siteName: "Home-Care Market",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { RealtimeProvider } from "@/contexts/RealtimeContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`} suppressHydrationWarning>
        <AuthProvider>
          <RealtimeProvider>
            {children}
            <div className="fixed bottom-0 right-0 p-0 pointer-events-none z-[60]" suppressHydrationWarning>
              <div className="pointer-events-auto">
                <MessagesWidget />
                <ChatbotWidget />
              </div>
            </div>
          </RealtimeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
