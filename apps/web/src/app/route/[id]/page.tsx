"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Bus, MapPin, Users, Bell, BellRing, Sparkles, Navigation } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { socket } from "@/lib/socket";

interface RouteData {
  id: string;
  name: string;
  nameHi: string;
  routeNo: string;
  color: string;
  busesCount: number;
  stops: Array<{
    id: string;
    name: string;
    nameHi: string;
    etaMinutes: number;
    isPassed: boolean;
    isCurrent: boolean;
  }>;
}

const SAMPLE_ROUTES: Record<string, RouteData> = {
  "1": {
    id: "1",
    name: "Railway Station to Vijay Nagar (via Palasia)",
    nameHi: "रेलवे स्टेशन से विजय नगर (पलासिया होकर)",
    routeNo: "1",
    color: "from-blue-500 to-indigo-600",
    busesCount: 4,
    stops: [
      { id: "s1", name: "Sarwate Bus Stand / Railway Station", nameHi: "सरवटे बस स्टैंड / रेलवे स्टेशन", etaMinutes: 0, isPassed: true, isCurrent: false },
      { id: "s2", name: "Geeta Bhawan Square", nameHi: "गीता भवन चौराहा", etaMinutes: 0, isPassed: true, isCurrent: false },
      { id: "s3", name: "Palasia Square", nameHi: "पलासिया चौराहा", etaMinutes: 2, isPassed: false, isCurrent: true },
      { id: "s4", name: "Treasure Island Mall", nameHi: "ट्रेजर आइलैंड मॉल", etaMinutes: 7, isPassed: false, isCurrent: false },
      { id: "s5", name: "Industry House", nameHi: "इंडस्ट्री हाउस", etaMinutes: 12, isPassed: false, isCurrent: false },
      { id: "s6", name: "Vijay Nagar Square", nameHi: "विजय नगर चौराहा", etaMinutes: 18, isPassed: false, isCurrent: false },
    ],
  },
  "2": {
    id: "2",
    name: "Rajwada Palace to Airport Terminal",
    nameHi: "राजवाड़ा पैलेस से एयरपोर्ट टर्मिनल",
    routeNo: "2",
    color: "from-emerald-500 to-teal-600",
    busesCount: 2,
    stops: [
      { id: "r1", name: "Rajwada Palace Gate", nameHi: "राजवाड़ा पैलेस गेट", etaMinutes: 0, isPassed: true, isCurrent: false },
      { id: "r2", name: "Bada Ganpati", nameHi: "बड़ा गणपति", etaMinutes: 3, isPassed: false, isCurrent: true },
      { id: "r3", name: "Mari Mata Square", nameHi: "मारी माता चौराहा", etaMinutes: 8, isPassed: false, isCurrent: false },
      { id: "r4", name: "Airport Road", nameHi: "एयरपोर्ट रोड", etaMinutes: 14, isPassed: false, isCurrent: false },
      { id: "r5", name: "Devi Ahilya Bai Airport", nameHi: "देवी अहिल्या बाई एयरपोर्ट", etaMinutes: 20, isPassed: false, isCurrent: false },
    ],
  },
  "3": {
    id: "3",
    name: "Bhanwarkuan to MR10 ISBT",
    nameHi: "भंवरकुआं से एमआर10 बस स्टैंड",
    routeNo: "3",
    color: "from-purple-500 to-pink-600",
    busesCount: 3,
    stops: [
      { id: "b1", name: "Bhanwarkuan Square", nameHi: "भंवरकुआं चौराहा", etaMinutes: 0, isPassed: true, isCurrent: false },
      { id: "b2", name: "Tower Square", nameHi: "टावर चौराहा", etaMinutes: 0, isPassed: true, isCurrent: false },
      { id: "b3", name: "Navlakha Bus Stop", nameHi: "नवलखा बस स्टॉप", etaMinutes: 4, isPassed: false, isCurrent: true },
      { id: "b4", name: "LIG Square", nameHi: "एलआईजी चौराहा", etaMinutes: 11, isPassed: false, isCurrent: false },
      { id: "b5", name: "MR10 ISBT Terminal", nameHi: "एमआर10 बस टर्मिनल", etaMinutes: 19, isPassed: false, isCurrent: false },
    ],
  },
};

export default function RouteDetailPage() {
  const params = useParams();
  const routeId = (params?.id as string) || "1";
  const { language, t } = useLanguage();
  
  const route = SAMPLE_ROUTES[routeId] || SAMPLE_ROUTES["1"];
  const [notifiedStop, setNotifiedStop] = useState<string | null>(null);
  const [occupancy, setOccupancy] = useState<"low" | "medium" | "high">("low");
  const [liveBuses, setLiveBuses] = useState([
    { id: "MP09-AB-1001", speed: "28 km/h", nextStop: route.stops[2].name, crowd: "low" },
    { id: "MP09-AB-1004", speed: "32 km/h", nextStop: route.stops[4].name, crowd: "medium" },
  ]);

  useEffect(() => {
    socket.connect();
    socket.emit("passenger:subscribe", `route-${routeId}`);

    socket.on("occupancy:broadcast", (data: { busId: string; level: "low" | "medium" | "high" }) => {
      setOccupancy(data.level);
    });

    return () => {
      socket.disconnect();
    };
  }, [routeId]);

  const toggleNotification = (stopId: string) => {
    if (notifiedStop === stopId) {
      setNotifiedStop(null);
    } else {
      setNotifiedStop(stopId);
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:px-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{language === "hi" ? "वापस मुख्य पृष्ठ पर जाएं" : "Back to All Routes"}</span>
      </Link>

      {/* Route Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-indigo-600/30 shrink-0">
              {route.routeNo}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {route.busesCount} {t("activeBuses")}
                </span>
                <span className="text-xs text-slate-500 font-mono">Route ID: #{route.id}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                {language === "hi" ? route.nameHi : route.name}
              </h1>
            </div>
          </div>

          <Link
            href="/map"
            className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors shrink-0 shadow-lg shadow-indigo-600/20"
          >
            <Navigation className="w-4 h-4" />
            <span>{language === "hi" ? "नक्शे पर लाइव देखें" : "View on Live Map"}</span>
          </Link>
        </div>

        {/* Live Occupancy Banner */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-300 font-medium">
              {language === "hi" ? "बस में भीड़ का स्तर:" : "Live Crowding Status:"}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                occupancy === "low"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : occupancy === "medium"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {occupancy === "low" ? t("crowdingSeats") : occupancy === "medium" ? t("crowdingStanding") : t("crowdingFull")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{language === "hi" ? "भीड़ अपडेट करें:" : "Report Crowd:"}</span>
            <button
              onClick={() => {
                setOccupancy("low");
                socket.emit("occupancy:update", { busId: "MP09-AB-1001", level: "low" });
              }}
              className="text-xs px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg hover:border-emerald-500/50 text-emerald-400 transition"
            >
              🟢 Low
            </button>
            <button
              onClick={() => {
                setOccupancy("medium");
                socket.emit("occupancy:update", { busId: "MP09-AB-1001", level: "medium" });
              }}
              className="text-xs px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg hover:border-amber-500/50 text-amber-400 transition"
            >
              🟡 Med
            </button>
            <button
              onClick={() => {
                setOccupancy("high");
                socket.emit("occupancy:update", { busId: "MP09-AB-1001", level: "high" });
              }}
              className="text-xs px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg hover:border-rose-500/50 text-rose-400 transition"
            >
              🔴 Full
            </button>
          </div>
        </div>
      </div>

      {/* Stop Timeline Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <span>{language === "hi" ? "स्टॉप्स और लाइव आगमन समय (Live ETAs)" : "Stops & Live Arrival ETAs"}</span>
        </h2>

        <div className="relative pl-6 md:pl-8 space-y-8 before:absolute before:left-2.5 md:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {route.stops.map((stop, index) => {
            const isNotified = notifiedStop === stop.id;
            return (
              <div key={stop.id} className="relative group">
                {/* Timeline Node */}
                <div
                  className={`absolute -left-6 md:-left-8 top-1 w-5 h-5 rounded-full border-4 transition-all flex items-center justify-center ${
                    stop.isCurrent
                      ? "border-indigo-500 bg-white ring-4 ring-indigo-500/20 animate-pulse"
                      : stop.isPassed
                      ? "border-slate-700 bg-slate-950"
                      : "border-slate-600 bg-slate-900 group-hover:border-indigo-400"
                  }`}
                />

                {/* Stop Card */}
                <div
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    stop.isCurrent
                      ? "bg-indigo-950/20 border-indigo-500/40 shadow-lg shadow-indigo-500/5"
                      : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">Stop #{index + 1}</span>
                      {stop.isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500 text-white rounded-full uppercase tracking-wider animate-pulse">
                          Approaching Now
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-white mt-1">
                      {language === "hi" ? stop.nameHi : stop.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">
                        {stop.isPassed
                          ? language === "hi" ? "निकल चुकी" : "Departed"
                          : stop.etaMinutes === 0
                          ? language === "hi" ? "स्टॉप पर" : "Arrived"
                          : `~${stop.etaMinutes} min`}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {stop.isPassed ? "Passed" : "Estimated Arrival"}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleNotification(stop.id)}
                      title="Notify me before bus arrives"
                      className={`p-2.5 rounded-xl border transition-all ${
                        isNotified
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      {isNotified ? <BellRing className="w-4 h-4 animate-bounce" /> : <Bell className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
