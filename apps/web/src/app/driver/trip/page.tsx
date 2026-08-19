"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, Activity, ShieldAlert, Users, AlertTriangle, Navigation } from "lucide-react";
import { socket } from "@/lib/socket";
import { useLanguage } from "@/context/LanguageContext";

export default function TripTerminal() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [driverInfo, setDriverInfo] = useState<{ driverId: string; busNumber: string } | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [occupancy, setOccupancy] = useState<"low" | "medium" | "high">("low");
  const [sosSent, setSosSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const info = localStorage.getItem("driverInfo");
    if (!info) {
      router.push("/driver/login");
      return;
    }
    setDriverInfo(JSON.parse(info));

    socket.connect();
    return () => {
      socket.disconnect();
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [router]);

  const toggleTrip = () => {
    if (!isActive) {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        return;
      }

      setIsActive(true);
      setError(null);

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);

          if (driverInfo) {
            const payload = {
              busId: driverInfo.busNumber,
              busNumber: driverInfo.busNumber,
              routeId: "Route 1 (Station-Vijay Nagar)",
              driverId: driverInfo.driverId,
              location,
              timestamp: new Date().toISOString(),
            };

            // 1. Socket.IO broadcast
            socket.emit("driver:location", payload);

            // 2. BroadcastChannel for instant Vercel sync
            try {
              if (typeof window !== "undefined" && "BroadcastChannel" in window) {
                const ch = new BroadcastChannel("indore_transit_fleet");
                ch.postMessage({ type: "driver:location", payload });
                ch.close();
              }
            } catch (e) {}

            // 3. LocalStorage event sync
            try {
              localStorage.setItem("active_driver_location", JSON.stringify(payload));
            } catch (e) {}
          }
        },
        (err) => {
          console.error("Error getting location", err);
          setError("Failed to get GPS signal. Using simulated coordinate broadcast.");
          // Fallback simulation coordinate so demo works seamlessly indoors
          const simLocation = { lat: 22.7216, lng: 75.8727 };
          setCurrentLocation(simLocation);

          if (driverInfo) {
            const fallbackPayload = {
              busId: driverInfo.busNumber,
              busNumber: driverInfo.busNumber,
              routeId: "Route 1",
              driverId: driverInfo.driverId,
              location: simLocation,
              timestamp: new Date().toISOString(),
            };
            socket.emit("driver:location", fallbackPayload);
            try {
              if (typeof window !== "undefined" && "BroadcastChannel" in window) {
                const ch = new BroadcastChannel("indore_transit_fleet");
                ch.postMessage({ type: "driver:location", payload: fallbackPayload });
                ch.close();
              }
            } catch (e) {}
            try {
              localStorage.setItem("active_driver_location", JSON.stringify(fallbackPayload));
            } catch (e) {}
          }
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    } else {
      setIsActive(false);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setCurrentLocation(null);
    }
  };

  const handleOccupancyChange = (level: "low" | "medium" | "high") => {
    setOccupancy(level);
    if (driverInfo) {
      socket.emit("occupancy:update", {
        busId: driverInfo.busNumber,
        level,
      });
    }
  };

  const triggerSOS = () => {
    if (!driverInfo) return;
    const loc = currentLocation || { lat: 22.7196, lng: 75.8577 };
    socket.emit("sos:trigger", {
      busId: driverInfo.busNumber,
      busNumber: driverInfo.busNumber,
      routeId: "Route 1",
      location: loc,
      timestamp: new Date().toISOString(),
    });
    setSosSent(true);
    setTimeout(() => setSosSent(false), 5000);
  };

  const logout = () => {
    if (isActive) toggleTrip();
    localStorage.removeItem("driverInfo");
    router.push("/driver/login");
  };

  if (!driverInfo) return null;

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-4rem)] bg-slate-950">
      {/* Header bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {language === "hi" ? "चालक आईडी" : "Driver ID"}
          </div>
          <div className="font-bold text-lg text-white">{driverInfo.driverId}</div>
        </div>
        
        {/* Emergency SOS Button */}
        <button
          onClick={triggerSOS}
          className={`px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all ${
            sosSent
              ? "bg-rose-500 text-white animate-bounce shadow-rose-500/50"
              : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{sosSent ? "SOS ALERT SENT!" : "EMERGENCY SOS"}</span>
        </button>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {language === "hi" ? "बस नंबर" : "Bus No."}
          </div>
          <div className="font-bold text-lg text-indigo-400 font-mono">{driverInfo.busNumber}</div>
        </div>
      </div>

      {/* Main Terminal Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-xl mx-auto w-full">
        {error && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2.5 rounded-xl w-full text-xs text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-1 text-white">
            {isActive
              ? language === "hi" ? "यात्रा सक्रिय (GPS ऑन)" : "Trip In Progress (GPS Live)"
              : language === "hi" ? "यात्रा शुरू करने के लिए तैयार" : "Ready to Start Shift"}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm">
            {isActive
              ? language === "hi" ? "लाइव सैटेलाइट जीपीएस यात्रियों को भेजा जा रहा है।" : "Broadcasting live bus location to commuters."
              : language === "hi" ? "मार्ग पर निकलते ही नीचे दिया गया बटन दबाएं।" : "Press the button below when your bus departs the terminal."}
          </p>
        </div>

        {/* Big Start/Stop Button */}
        <button
          onClick={toggleTrip}
          className={`w-52 h-52 md:w-60 md:h-60 rounded-full flex flex-col items-center justify-center gap-3 transition-all shadow-[0_0_50px_rgba(0,0,0,0.5)] ${
            isActive
              ? "bg-rose-600 hover:bg-rose-500 shadow-rose-900/60 border-8 border-rose-500/30 scale-105"
              : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/60 border-8 border-emerald-500/30 hover:scale-105"
          }`}
        >
          <Activity className={`w-14 h-14 text-white ${isActive ? "animate-pulse" : ""}`} />
          <span className="text-2xl md:text-3xl font-black tracking-wider uppercase text-white">
            {isActive ? (language === "hi" ? "यात्रा समाप्त" : "End Trip") : (language === "hi" ? "यात्रा शुरू" : "Start Trip")}
          </span>
        </button>

        {/* Live GPS Coordinates & View on Map Button */}
        {isActive && currentLocation && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Lat: {currentLocation.lat.toFixed(4)}, Lng: {currentLocation.lng.toFixed(4)}
            </div>

            <a
              href="/map"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
            >
              <Navigation className="w-4 h-4" />
              <span>View My Bus Live on Map ➔</span>
            </a>
          </div>
        )}

        {/* Occupancy Crowding Controller */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>{language === "hi" ? "बस में वर्तमान भीड़ (Occupancy):" : "Update Bus Crowding:"}</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-indigo-400">{occupancy}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleOccupancyChange("low")}
              className={`py-2 rounded-xl text-xs font-bold transition border ${
                occupancy === "low"
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              🟢 {language === "hi" ? "खाली" : "Seats Avail"}
            </button>
            <button
              onClick={() => handleOccupancyChange("medium")}
              className={`py-2 rounded-xl text-xs font-bold transition border ${
                occupancy === "medium"
                  ? "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              🟡 {language === "hi" ? "मध्यम" : "Standing"}
            </button>
            <button
              onClick={() => handleOccupancyChange("high")}
              className={`py-2 rounded-xl text-xs font-bold transition border ${
                occupancy === "high"
                  ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              🔴 {language === "hi" ? "फुल" : "Full / Crowded"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer logout */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 mt-auto">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-950 hover:text-white transition-colors text-xs font-semibold"
        >
          <LogOut className="w-4 h-4" /> {language === "hi" ? "शिफ्ट समाप्त और लॉगआउट" : "End Shift & Logout"}
        </button>
      </div>
    </div>
  );
}

