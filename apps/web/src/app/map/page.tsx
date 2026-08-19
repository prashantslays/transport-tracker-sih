"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Leaflet requires window, so we must dynamically import it with ssr: false
const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
      <p className="font-medium">Loading live map...</p>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="flex-1 flex w-full relative h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="hidden md:flex w-80 flex-col bg-slate-950 border-r border-slate-800 z-10">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-bold text-lg">Active Fleet</h2>
          <p className="text-sm text-slate-400">Tracking buses in real-time</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* We will populate this from the server later, static placeholder for now */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-indigo-400">Bus #7</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Live</span>
            </div>
            <p className="text-sm text-slate-300">Route: Station to Vijay Nagar</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-indigo-400">Bus #12</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Live</span>
            </div>
            <p className="text-sm text-slate-300">Route: Rajwada to Airport</p>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <LiveMap />
      </div>
    </div>
  );
}
