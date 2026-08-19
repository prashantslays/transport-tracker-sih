"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Clock, Search, Smartphone, Users, IndianRupee, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import SMSQueryWidget from "@/components/SMSQueryWidget";

export default function Home() {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const routes = [
    {
      id: "1",
      name: "Railway Station ➔ Palasia ➔ Vijay Nagar",
      nameHi: "रेलवे स्टेशन ➔ पलासिया ➔ विजय नगर",
      no: "1",
      buses: 4,
      crowd: "🟢 Low",
      color: "from-blue-600 to-indigo-600",
      fare: "₹10 - ₹20",
    },
    {
      id: "2",
      name: "Rajwada Palace ➔ Bada Ganpati ➔ Airport",
      nameHi: "राजवाड़ा ➔ बड़ा गणपति ➔ एयरपोर्ट",
      no: "2",
      buses: 2,
      crowd: "🟡 Med",
      color: "from-emerald-600 to-teal-600",
      fare: "₹10 - ₹15",
    },
    {
      id: "3",
      name: "Bhanwarkuan ➔ Navlakha ➔ MR10 ISBT",
      nameHi: "भंवरकुआं ➔ नवलखा ➔ एमआर10",
      no: "3",
      buses: 3,
      crowd: "🔴 Full",
      color: "from-purple-600 to-pink-600",
      fare: "₹15 - ₹25",
    },
  ];

  const filteredRoutes = routes.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.nameHi.includes(searchTerm) ||
      r.no.includes(searchTerm)
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative px-4 py-16 md:py-28 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10" />

        {/* Live City Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-6 border border-indigo-500/20 shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          {t("heroBadge")}
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 max-w-4xl text-white leading-tight">
          {t("heroTitle1")} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">
            {t("heroTitle2")}
          </span>
        </h1>

        <p className="text-sm md:text-lg text-slate-400 max-w-2xl mb-8 leading-relaxed">
          {t("heroSub")}
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-lg relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all backdrop-blur-md text-sm shadow-xl"
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/map"
            className="h-12 px-7 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            {t("openMapBtn")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="px-4 py-8 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
            <MapPin className="text-indigo-400 w-5 h-5" />
            <span>{t("popularRoutes")}</span>
          </h2>
          <span className="text-xs text-slate-400">Indore City Transport Service</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => (
            <Link key={route.id} href={`/route/${route.id}`} className="block group">
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all h-full flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-600/30">
                      {route.no}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {route.buses} {t("activeBuses")}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base md:text-lg text-white group-hover:text-indigo-300 transition-colors leading-snug">
                    {language === "hi" ? route.nameHi : route.name}
                  </h3>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t("viewEta")}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                    {route.fare}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Offline SMS Query Section (Key Hackathon Standout Feature) */}
      <section className="px-4 py-12 md:px-8 max-w-5xl mx-auto w-full">
        <SMSQueryWidget />
      </section>
    </div>
  );
}

