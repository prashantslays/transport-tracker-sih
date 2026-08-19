"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi";

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const translations: Translations = {
  appTitle: {
    en: "Transport Tracker",
    hi: "परिवहन ट्रैकर",
  },
  liveMap: {
    en: "Live Map",
    hi: "लाइव नक्शा",
  },
  driverPortal: {
    en: "Driver Portal",
    hi: "चालक पोर्टल",
  },
  adminDashboard: {
    en: "Admin",
    hi: "प्रशासक",
  },
  fareCalc: {
    en: "Fare & Ticket",
    hi: "किराया और टिकट",
  },
  heroBadge: {
    en: "Live in Indore (Tier 2/3 City Smart Fleet)",
    hi: "इंदौर में लाइव (स्मार्ट पब्लिक ट्रांसपोर्ट)",
  },
  heroTitle1: {
    en: "Never miss your bus again.",
    hi: "अब कभी बस नहीं छूटेगी।",
  },
  heroTitle2: {
    en: "Track it in real-time.",
    hi: "सटीक लाइव लोकेशन देखें।",
  },
  heroSub: {
    en: "Find your route, see live GPS tracking, check bus crowding, and get accurate arrival times.",
    hi: "अपना रूट खोजें, लाइव जीपीएस देखें, बस में भीड़ का स्तर जांचें और सही समय पर पहुंचें।",
  },
  searchPlaceholder: {
    en: "Search routes, stops (e.g., Palasia, Rajwada, Station)...",
    hi: "रूट या बस स्टॉप खोजें (जैसे पलासिया, राजवाड़ा, स्टेशन)...",
  },
  openMapBtn: {
    en: "Open Live Map",
    hi: "लाइव नक्शा खोलें",
  },
  popularRoutes: {
    en: "Popular Bus Routes",
    hi: "प्रमुख बस मार्ग",
  },
  activeBuses: {
    en: "active buses",
    hi: "सक्रिय बसें",
  },
  viewEta: {
    en: "View stops & live ETA",
    hi: "स्टॉप और लाइव समय देखें",
  },
  crowdingSeats: {
    en: "Seats Available",
    hi: "सीटें उपलब्ध",
  },
  crowdingStanding: {
    en: "Standing Only",
    hi: "केवल खड़े रहने की जगह",
  },
  crowdingFull: {
    en: "Crowded / Full",
    hi: "अत्यधिक भीड़ / फुल",
  },
  sosTriggered: {
    en: "EMERGENCY SOS ALERT",
    hi: "आपातकालीन एसओएस चेतावनी",
  },
  smsTitle: {
    en: "Offline SMS & Feature Phone Support",
    hi: "ऑफ़लाइन एसएमएस और कीपैड फोन सुविधा",
  },
  smsSub: {
    en: "No smartphone or 4G data? SMS stop code or route to get instant arrival info via SMS/WhatsApp.",
    hi: "स्मार्टफोन या इंटरनेट नहीं है? बस स्टॉप का कोड एसएमएस करें और तुरंत बस का समय पाएं।",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => translations[key]?.en || String(key),
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("preferred_lang") as Language;
    if (saved && (saved === "en" || saved === "hi")) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("preferred_lang", lang);
  };

  const t = (key: keyof typeof translations): string => {
    if (!translations[key]) return String(key);
    return translations[key][language] || translations[key].en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
