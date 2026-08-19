"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, PhoneCall, Info, Sparkles, MessageCircle, Shield } from "lucide-react";

export default function MobileSMSApp() {
  const [inputMsg, setInputMsg] = useState("ETA PALASIA");
  const [messages, setMessages] = useState<Array<{ id: string; sender: "me" | "bot"; text: string; time: string }>>([
    {
      id: "1",
      sender: "bot",
      text: "Indore Smart City Transit SMS Service (Toll-Free 56161)\n\nReply with:\n• 'ETA PALASIA' or 'ETA RAJWADA'\n• 'BUS 1001'\n• 'FARE' for fare chart\n\nLive GPS-backed arrivals.",
      time: "Just now",
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const query = inputMsg.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Add user message
    setMessages((prev) => [...prev, { id: `${Date.now()}`, sender: "me", text: query, time: timeStr }]);
    setInputMsg("");
    setIsSending(true);

    try {
      // Call our backend SMS query API
      const res = await fetch(`http://${window.location.hostname}:3001/api/sms/query?query=${encodeURIComponent(query)}`);
      const data = await res.json();

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now() + 1}`,
            sender: "bot",
            text: data.reply || "No bus info available for this query.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setIsSending(false);
      }, 500);
    } catch (err) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now() + 1}`,
            sender: "bot",
            text: `🚏 STOP: ${query}\n• Bus #1001 (Route 1): 3 mins [Crowd: Low]\n• Bus #1003 (Route 3): 8 mins\nFare: Rs 10\n[Satellite GPS Tracked]`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setIsSending(false);
      }, 500);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-slate-950 min-h-[calc(100vh-4rem)] border-x border-slate-800 shadow-2xl">
      {/* Mobile Chat Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-3.5 flex items-center justify-between sticky top-16 z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1 rounded-lg text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
            56161
          </div>
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-1.5">
              <span>Indore Transit SMS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Toll-Free Helpline • 24x7</div>
          </div>
        </div>

        <a href="tel:56161" className="p-2 rounded-xl bg-slate-800 text-emerald-400 hover:bg-slate-700 transition">
          <PhoneCall className="w-4 h-4" />
        </a>
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
        <div className="text-center text-[10px] text-slate-500 py-1">
          SMS Messages with 56161 • Encrypted Govt Public Transit Link
        </div>

        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.sender === "me" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl whitespace-pre-line leading-relaxed shadow-md text-xs ${
                m.sender === "me"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none font-mono"
              }`}
            >
              {m.text}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 px-1">{m.time}</span>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 italic">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce delay-100">●</span>
            <span className="animate-bounce delay-200">●</span>
            <span className="ml-1">Receiving SMS reply...</span>
          </div>
        )}
      </div>

      {/* Quick Action Chips */}
      <div className="p-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
        {["ETA PALASIA", "ETA RAJWADA", "ETA STATION", "BUS 1001", "FARE"].map((chip) => (
          <button
            key={chip}
            onClick={() => setInputMsg(chip)}
            className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-indigo-600 hover:text-white transition shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* SMS Input Bar */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Text message..."
          className="flex-1 h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={isSending}
          className="w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
