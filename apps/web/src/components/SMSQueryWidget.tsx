"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Smartphone, Sparkles, CornerDownLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SMSQueryWidget() {
  const { language } = useLanguage();
  const [query, setQuery] = useState("ETA PALASIA");
  const [messages, setMessages] = useState<Array<{ sender: "user" | "system"; text: string; time: string }>>([
    {
      sender: "system",
      text: "Indore Transport SMS Service (Toll-free 56161).\nSend: ETA <STOP NAME> or BUS <NUMBER>\nExample: 'ETA PALASIA' or 'BUS 7'",
      time: "10:00 AM",
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Add user message
    const newMsgs = [...messages, { sender: "user" as const, text: userText, time: timeNow }];
    setMessages(newMsgs);
    setQuery("");

    // Simulate SMS gateway response after 600ms
    setTimeout(() => {
      let reply = "";
      const upper = userText.toUpperCase();

      if (upper.includes("PALASIA")) {
        reply = "🚏 STOP: Palasia Square\n• Bus #7 (Route 1) arriving in 3 mins (Crowd: Low)\n• Bus #12 (Route 3) arriving in 9 mins\n• Fare to Station: ₹10\n[Tracked via Satellite GPS]";
      } else if (upper.includes("RAJWADA")) {
        reply = "🚏 STOP: Rajwada Palace\n• Bus #2 (Route 2) arriving in 5 mins (Crowd: Medium)\n• Next bus in 18 mins.";
      } else if (upper.includes("BUS 7") || upper.includes("7")) {
        reply = "🚌 BUS #7 (MP09-AB-1001)\nRoute: Station -> Vijay Nagar\nCurrent: Near Geeta Bhawan (Speed: 28 km/h)\nNext Stop: Palasia in 3m.";
      } else {
        reply = `🚏 QUERY: '${userText}'\nUpcoming: Bus #7 (4 mins), Bus #2 (11 mins).\nReply 'STOP' to unsubscribe.`;
      }

      setMessages((prev) => [
        ...prev,
        { sender: "system" as const, text: reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);
    }, 600);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">
                {language === "hi" ? "ऑफ़लाइन SMS / कीपैड फोन ट्रैकिंग" : "Offline SMS / Feature Phone Query"}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
                100% Offline
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === "hi"
                ? "बिना इंटरनेट वाले साधारण फोन से बस की स्थिति जानने की लाइव सुविधा"
                : "Simulation of instant SMS arrival lookups for users without 4G/smartphones"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          SMS Gateway: <span className="font-mono text-emerald-400 font-bold">+91 98930 56161</span>
        </div>
      </div>

      {/* Simulated Phone Screen */}
      <div className="mt-6 bg-slate-950 rounded-2xl border border-slate-800/80 p-4 font-mono">
        <div className="h-56 overflow-y-auto space-y-3 pr-2 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-line leading-relaxed shadow-md ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 px-1">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800/80 mt-2">
          {["ETA PALASIA", "ETA RAJWADA", "BUS 7"].map((chip) => (
            <button
              key={chip}
              onClick={() => setQuery(chip)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === "hi" ? "एसएमएस टाइप करें (उदा. ETA PALASIA)..." : "Type SMS (e.g. ETA PALASIA)..."}
            className="flex-1 h-11 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send SMS</span>
          </button>
        </form>
      </div>
    </div>
  );
}
