"use client";

import { useEffect, useState } from "react";
import { Users, Bus, Route, Activity, ShieldAlert, Radio, AlertTriangle, CheckCircle, BellRing, MapPin } from "lucide-react";
import { socket } from "@/lib/socket";
import { useLanguage } from "@/context/LanguageContext";

interface SOSAlert {
  id: string;
  busId: string;
  busNumber: string;
  routeId: string;
  location: { lat: number; lng: number };
  timestamp: string;
}

export default function AdminDashboard() {
  const { language, t } = useLanguage();
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [livePings, setLivePings] = useState<Array<{ id: string; bus: string; time: string; loc: string }>>([
    { id: "1", bus: "MP09-AB-1001", time: "Just now", loc: "22.7196, 75.8577 (Palasia)" },
    { id: "2", bus: "MP09-AB-1002", time: "3s ago", loc: "22.7096, 75.8475 (Rajwada)" },
  ]);

  useEffect(() => {
    socket.connect();

    socket.on("sos:alert", (alert: SOSAlert) => {
      setSosAlerts((prev) => [alert, ...prev]);
    });

    socket.on("bus:position", (data: any) => {
      setLivePings((prev) => [
        {
          id: `${Date.now()}`,
          bus: data.busNumber || data.busId,
          time: "Just now",
          loc: `${data.location.lat.toFixed(4)}, ${data.location.lng.toFixed(4)}`,
        },
        ...prev.slice(0, 5),
      ]);
    });

    return () => {
      socket.off("sos:alert");
      socket.off("bus:position");
      socket.disconnect();
    };
  }, []);

  const dismissSOS = (id: string) => {
    setSosAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              City Control Room Active
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">
            {language === "hi" ? "इंदौर स्मार्ट सिटी - केंद्रीय परिवहन नियंत्रण कक्ष" : "Indore City Central Transport Control Room"}
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-slate-300">
          <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>WebSocket Telemetry: Live (Port 3001)</span>
        </div>
      </div>

      {/* Emergency SOS Banner (Triggered when driver presses SOS) */}
      {sosAlerts.length > 0 && (
        <div className="space-y-3">
          {sosAlerts.map((sosItem) => (
            <div
              key={sosItem.id}
              className="bg-rose-950/90 border-2 border-rose-500 p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-bounce"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-600 rounded-2xl text-white shadow-lg shadow-rose-600/50 animate-pulse">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest">
                      CRITICAL EMERGENCY
                    </span>
                    <span className="text-xs text-rose-300 font-mono">
                      {new Date(sosItem.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">
                    SOS Triggered by Bus #{sosItem.busNumber} ({sosItem.routeId})
                  </h3>
                  <p className="text-xs text-rose-200 mt-0.5 flex items-center gap-1 font-mono">
                    <MapPin className="w-3.5 h-3.5" /> Coordinates: {sosItem.location.lat.toFixed(4)}, {sosItem.location.lng.toFixed(4)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.alert(`Dispatching Indore Police & Emergency Medical Response to Bus ${sosItem.busNumber} at [${sosItem.location.lat}, ${sosItem.location.lng}]`)}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition"
                >
                  🚨 Dispatch Emergency Services
                </button>
                <button
                  onClick={() => dismissSOS(sosItem.id)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
                >
                  Resolve Alert
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fleet KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl">
              <Bus className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
              98% On Route
            </span>
          </div>
          <h3 className="text-slate-400 font-medium text-xs uppercase tracking-wider">
            {language === "hi" ? "सक्रिय बसें (Active Fleet)" : "Active Fleet"}
          </h3>
          <p className="text-3xl font-black text-white mt-1">12 / 14</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <Route className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
              Coverage: 100%
            </span>
          </div>
          <h3 className="text-slate-400 font-medium text-xs uppercase tracking-wider">
            {language === "hi" ? "सक्रिय मार्ग (Routes)" : "City Routes"}
          </h3>
          <p className="text-3xl font-black text-white mt-1">5 Routes</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">
              +18% Peak
            </span>
          </div>
          <h3 className="text-slate-400 font-medium text-xs uppercase tracking-wider">
            {language === "hi" ? "आज के यात्री (Passengers)" : "Today's Ridership"}
          </h3>
          <p className="text-3xl font-black text-white mt-1">1,248</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-500/10 rounded-2xl">
              <Activity className="w-6 h-6 text-rose-400" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
              Low Delay
            </span>
          </div>
          <h3 className="text-slate-400 font-medium text-xs uppercase tracking-wider">
            {language === "hi" ? "औसत विलंब (Avg Delay)" : "Average Schedule Delay"}
          </h3>
          <p className="text-3xl font-black text-white mt-1">3.2 min</p>
        </div>
      </div>

      {/* Main Tables & Live Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Status Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Live Bus Telemetry & Compliance</h2>
              <p className="text-xs text-slate-400">Real-time driver GPS tracking status</p>
            </div>
            <span className="text-xs font-mono text-indigo-400">Auto-refreshing</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Bus No.</th>
                  <th className="pb-3">Route</th>
                  <th className="pb-3">Driver</th>
                  <th className="pb-3">Crowd</th>
                  <th className="pb-3">Adherence</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-800/60 font-medium">
                {[
                  { bus: "MP09-AB-1001", route: "Route 1 (Station-Vijay Nagar)", driver: "D-101 (Ramesh S.)", crowd: "🟢 Seats Avail", status: "On Time (28 km/h)" },
                  { bus: "MP09-AB-1002", route: "Route 2 (Rajwada-Airport)", driver: "D-104 (Sunil K.)", crowd: "🟡 Standing", status: "On Time (31 km/h)" },
                  { bus: "MP09-AB-1003", route: "Route 3 (Bhanwarkuan-MR10)", driver: "D-109 (Vikram P.)", crowd: "🔴 Crowded", status: "+4m Delay" },
                  { bus: "MP09-AB-1004", route: "Route 4 (Mhow-Rau)", driver: "D-115 (Deepak T.)", crowd: "🟢 Seats Avail", status: "On Time (35 km/h)" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 font-bold text-white font-mono">{row.bus}</td>
                    <td className="py-3.5 text-slate-300">{row.route}</td>
                    <td className="py-3.5 text-slate-400">{row.driver}</td>
                    <td className="py-3.5">{row.crowd}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live GPS Feed Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Live GPS Feed</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Socket.IO
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {livePings.map((p) => (
                <div key={p.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-indigo-400">{p.bus}</span>
                    <div className="text-[10px] text-slate-500">{p.loc}</div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">{p.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Satellite Status: 8 Locked</span>
            <span className="text-emerald-400 font-bold">100% Uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
}

