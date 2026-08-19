import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AIChatbot from "@/components/AIChatbot";
import { LanguageProvider } from "@/context/LanguageContext";
import 'leaflet/dist/leaflet.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Transport Tracker - Real-time Bus Tracking for Small Cities",
  description: "Live public transport tracking, AI assistant, occupancy indicator, and offline SMS service for small cities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30`}>
        <LanguageProvider>
          <Navbar />
          <main className="flex flex-col min-h-[calc(100vh-4rem)]">
            {children}
          </main>
          <AIChatbot />
        </LanguageProvider>
      </body>
    </html>
  );
}
