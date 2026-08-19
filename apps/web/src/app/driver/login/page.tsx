"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight } from "lucide-react";

export default function DriverLogin() {
  const router = useRouter();
  const [driverId, setDriverId] = useState("");
  const [busNumber, setBusNumber] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (driverId && busNumber) {
      // For demo purposes, simply set simple local storage and redirect
      localStorage.setItem("driverInfo", JSON.stringify({ driverId, busNumber }));
      router.push("/driver/trip");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2 text-white">Driver Portal</h1>
        <p className="text-slate-400 text-center mb-8 text-sm">Enter your credentials to start your shift</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Driver ID</label>
            <input 
              type="text" 
              required
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="e.g. D-1042"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Bus Number</label>
            <input 
              type="text" 
              required
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="e.g. MP09-AB-1234"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full h-12 mt-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 transition-colors"
          >
            Access Terminal <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
