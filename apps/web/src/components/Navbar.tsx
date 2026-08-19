"use client";

import { useState } from "react";
import Link from "next/link";
import { Bus, Map, Shield, Languages, Calculator, LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FareCalculatorModal from "./FareCalculatorModal";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [isFareOpen, setIsFareOpen] = useState(false);

  return (
    <>
      <nav className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-indigo-500 p-2 rounded-xl group-hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base md:text-lg tracking-tight text-white leading-tight">
              {t("appTitle")}
            </span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
              Smart Transit Tier 2/3
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3 md:gap-5 text-sm font-medium">
          {/* Live Map Link */}
          <Link
            href="/map"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 transition-colors"
          >
            <Map className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">{t("liveMap")}</span>
          </Link>

          {/* SMS App Link */}
          <Link
            href="/sms"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 hover:text-white hover:border-emerald-500/50 transition-colors"
          >
            <span className="text-xs font-bold font-mono">📱 SMS App</span>
          </Link>

          {/* Fare Calculator Button */}
          <button
            onClick={() => setIsFareOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/50 transition-colors"
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">{t("fareCalc")}</span>
          </button>

          {/* Admin Dashboard */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">{t("adminDashboard")}</span>
          </Link>

          {/* Driver Login */}
          <Link
            href="/driver/login"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">{t("driverPortal")}</span>
          </Link>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                language === "en" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                language === "hi" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>
      </nav>

      {/* Fare Calculator Modal */}
      <FareCalculatorModal isOpen={isFareOpen} onClose={() => setIsFareOpen(false)} />
    </>
  );
}

