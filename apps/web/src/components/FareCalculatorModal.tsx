"use client";

import React, { useState } from "react";
import { X, Calculator, QrCode, CheckCircle, ArrowRight, IndianRupee } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface FareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STOPS = [
  "Railway Station (Sarwate)",
  "Geeta Bhawan",
  "Palasia Square",
  "Treasure Island Mall",
  "Vijay Nagar (Brilliant Conv.)",
  "Rajwada Palace",
  "Airport Terminal",
  "Bhanwarkuan Square",
  "MR10 Intercity Bus Stand",
];

export default function FareCalculatorModal({ isOpen, onClose }: FareModalProps) {
  const { language } = useLanguage();
  const [fromStop, setFromStop] = useState(STOPS[0]);
  const [toStop, setToStop] = useState(STOPS[2]);
  const [passengerCount, setPassengerCount] = useState(1);
  const [showQR, setShowQR] = useState(false);
  const [ticketPurchased, setTicketPurchased] = useState(false);

  if (!isOpen) return null;

  // Calculate fare based on stop index distance
  const indexFrom = STOPS.indexOf(fromStop);
  const indexTo = STOPS.indexOf(toStop);
  const stopsDistance = Math.max(1, Math.abs(indexTo - indexFrom));
  
  // Base fare: ₹10 for up to 2 stops, + ₹5 for each additional stop
  const baseRate = stopsDistance <= 2 ? 10 : 10 + (stopsDistance - 2) * 5;
  const totalFare = baseRate * passengerCount;
  const approxDistanceKm = (stopsDistance * 2.4).toFixed(1);
  const approxTimeMin = stopsDistance * 6;

  const handlePay = () => {
    setShowQR(true);
    // Simulate instant UPI verification after 2.5 seconds
    setTimeout(() => {
      setTicketPurchased(true);
    }, 2500);
  };

  const handleReset = () => {
    setShowQR(false);
    setTicketPurchased(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {language === "hi" ? "किराया कैलकुलेटर और डिजिटल टिकट" : "Fare Calculator & Quick Ticket"}
              </h2>
              <p className="text-xs text-slate-400">
                {language === "hi" ? "दूरी के आधार पर किराया और UPI टिकटिंग" : "Distance-based fare & instant UPI payment"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!showQR ? (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {language === "hi" ? "प्रस्थान स्टॉप (From)" : "Boarding Stop (From)"}
              </label>
              <select
                value={fromStop}
                onChange={(e) => setFromStop(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {STOPS.map((s) => (
                  <option key={s} value={s} disabled={s === toStop}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {language === "hi" ? "गंतव्य स्टॉप (To)" : "Destination Stop (To)"}
              </label>
              <select
                value={toStop}
                onChange={(e) => setToStop(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {STOPS.map((s) => (
                  <option key={s} value={s} disabled={s === fromStop}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium text-slate-300">
                {language === "hi" ? "यात्रियों की संख्या" : "Passengers"}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
                >
                  -
                </button>
                <span className="font-bold text-white w-6 text-center">{passengerCount}</span>
                <button
                  type="button"
                  onClick={() => setPassengerCount(Math.min(6, passengerCount + 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Fare Summary Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-500/20 mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">
                  {language === "hi" ? "अनुमानित दूरी और समय" : "Est. Distance & Time"}
                </span>
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  ~{approxDistanceKm} km • ~{approxTimeMin} min
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-800/80">
                <span className="font-bold text-slate-200">
                  {language === "hi" ? "कुल किराया" : "Total Fare"}
                </span>
                <span className="text-3xl font-black text-emerald-400 flex items-center">
                  <IndianRupee className="w-6 h-6 inline" />
                  {totalFare}
                </span>
              </div>
            </div>

            <button
              onClick={handlePay}
              className="w-full h-12 mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <QrCode className="w-5 h-5" />
              {language === "hi" ? "UPI QR से टिकट खरीदें" : "Generate UPI Ticket"}
            </button>
          </div>
        ) : !ticketPurchased ? (
          /* QR Payment Simulation */
          <div className="mt-6 flex flex-col items-center text-center py-4">
            <div className="p-4 bg-white rounded-2xl shadow-xl mb-4">
              {/* Simulated QR Code */}
              <div className="w-44 h-44 bg-slate-900 rounded-lg flex flex-col items-center justify-center p-3 relative">
                <QrCode className="w-32 h-32 text-white" />
                <span className="text-[10px] font-mono text-emerald-400 tracking-wider mt-1">
                  UPI: indorebus@nic
                </span>
              </div>
            </div>
            <p className="text-sm font-semibold text-white">
              {language === "hi" ? `₹${totalFare} का भुगतान स्कैन करें` : `Scan to Pay ₹${totalFare}`}
            </p>
            <p className="text-xs text-slate-400 mt-1 animate-pulse">
              {language === "hi" ? "भुगतान की पुष्टि की जा रही है..." : "Simulating UPI instant confirmation..."}
            </p>
          </div>
        ) : (
          /* Generated Digital Ticket */
          <div className="mt-6 text-center py-2 animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">
              {language === "hi" ? "डिजिटल टिकट जारी किया गया!" : "Digital Ticket Confirmed!"}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Ticket ID: <span className="font-mono text-indigo-400 font-bold">IND-{Date.now().toString().slice(-6)}</span>
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Route:</span>
                <span className="font-semibold text-white">{fromStop.split(" ")[0]} ➔ {toStop.split(" ")[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Passengers:</span>
                <span className="font-semibold text-white">{passengerCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-emerald-400">₹{totalFare} (UPI Success)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valid Until:</span>
                <span className="font-semibold text-slate-300">Today, 23:59 PM</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
            >
              {language === "hi" ? "बंद करें" : "Done / Save Ticket"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
