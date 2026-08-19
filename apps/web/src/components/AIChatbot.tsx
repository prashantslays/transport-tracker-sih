"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, User, MapPin, Clock, IndianRupee, ArrowRight, Minimize2, Maximize2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
  quickActions?: Array<{ label: string; action: () => void }>;
}

const CITY_KNOWLEDGE = {
  stops: [
    { name: "Sarwate Railway Station", routes: ["Route 1", "Route 2"], fareToVijayNagar: 20, fareToAirport: 15 },
    { name: "Palasia Square", routes: ["Route 1", "Route 3"], fareToVijayNagar: 10, fareToAirport: 15 },
    { name: "Vijay Nagar", routes: ["Route 1", "Route 4"], fareToStation: 20, fareToAirport: 20 },
    { name: "Rajwada Palace", routes: ["Route 2"], fareToAirport: 10, fareToStation: 10 },
    { name: "Airport Terminal", routes: ["Route 2"], fareToRajwada: 10, fareToVijayNagar: 20 },
    { name: "Bhanwarkuan Square", routes: ["Route 3", "Route 5"], fareToMR10: 15, fareToStation: 10 },
    { name: "MR10 ISBT", routes: ["Route 3", "Route 5"], fareToStation: 20, fareToBhanwarkuan: 15 },
  ],
  routes: [
    { no: "1", name: "Railway Station ➔ Palasia ➔ Vijay Nagar", freq: "Every 8 mins", buses: 4 },
    { no: "2", name: "Rajwada Palace ➔ Bada Ganpati ➔ Airport", freq: "Every 12 mins", buses: 2 },
    { no: "3", name: "Bhanwarkuan ➔ Navlakha ➔ MR10 ISBT", freq: "Every 10 mins", buses: 3 },
    { no: "4", name: "Mhow ➔ Rau ➔ Bombay Hospital", freq: "Every 15 mins", buses: 3 },
    { no: "5", name: "Dewas Naka ➔ Silicon City ➔ Super Corridor", freq: "Every 15 mins", buses: 2 },
  ],
};

function generateAIResponse(userInput: string, lang: "en" | "hi"): string {
  const query = (userInput || "").toLowerCase().trim();

  // 1. Greetings
  if (query.includes("hi") || query.includes("hello") || query.includes("hey") || query.includes("नमस्ते") || query.includes("हेल्प")) {
    return lang === "hi"
      ? "नमस्ते! मैं आपका इंदौर स्मार्ट बस एआई सहायक (सारथी AI) हूँ। 🚍\n\nआप मुझसे पूछ सकते हैं:\n• 'स्टेशन से एयरपोर्ट कैसे जाएं?'\n• 'पलासिया पर अगली बस कब आएगी?'\n• 'विजय नगर का किराया कितना है?'\n• 'खोया-पाया (Lost & Found) हेल्पलाइन क्या है?'"
      : "Hello! I am your AI Transit Assistant (Saarthi AI) for Indore Public Transport. 🚍\n\nHow can I help you today? You can ask:\n• 'How to go from Railway Station to Airport?'\n• 'When is the next bus at Palasia?'\n• 'What is the fare to Vijay Nagar?'\n• 'Lost & Found helpline details'";
  }

  // 2. Route Navigation queries (e.g. Station to Airport)
  if ((query.includes("station") && query.includes("airport")) || (query.includes("स्टेशन") && query.includes("एयरपोर्ट"))) {
    return lang === "hi"
      ? "📍 **रूट सुझाव: रेलवे स्टेशन ➔ एयरपोर्ट**\n\n1. **बस लें:** बस #2 (रूट 2 - राजवाड़ा से एयरपोर्ट)\n2. **प्रस्थान स्टॉप:** सरवटे बस स्टैंड (प्लेटफ़ॉर्म 3)\n3. **समय:** लगभग 22 मिनट\n4. **किराया:** ₹15 प्रति व्यक्ति\n5. **लाइव स्थिति:** अगली बस 4 मिनट में आ रही है (भीड़: मध्यम 🟡)"
      : "📍 **Best Route: Railway Station ➔ Airport**\n\n1. **Take Bus:** Bus #2 (Route 2: Rajwada - Airport)\n2. **Boarding Stop:** Sarwate Bus Stand (Platform 3)\n3. **Travel Time:** ~22 minutes\n4. **Estimated Fare:** ₹15 per passenger\n5. **Live Status:** Next bus arriving in 4 mins (Crowd: Medium 🟡)";
  }

  // 3. Station to Vijay Nagar
  if (query.includes("vijay nagar") || query.includes("विजय नगर")) {
    return lang === "hi"
      ? "📍 **विजय नगर के लिए बस जानकारी:**\n\n• **सर्वश्रेष्ठ बस:** बस #1 (रूट 1: स्टेशन ➔ पलासिया ➔ विजय नगर)\n• **आवृत्ति:** हर 8 मिनट में बस उपलब्ध है\n• **किराया:** पलासिया से ₹10, स्टेशन से ₹20\n• **लाइव ट्रैकिंग:** वर्तमान में 4 बसें सक्रिय हैं (🟢 सीटें उपलब्ध)"
      : "📍 **Bus Information for Vijay Nagar:**\n\n• **Recommended Bus:** Bus #1 (Route 1: Station ➔ Palasia ➔ Vijay Nagar)\n• **Frequency:** A bus every 8 minutes\n• **Fare:** ₹10 from Palasia, ₹20 from Railway Station\n• **Live Telemetry:** 4 active buses currently on this route (🟢 Seats Available)";
  }

  // 4. Palasia queries
  if (query.includes("palasia") || query.includes("पलासिया")) {
    return lang === "hi"
      ? "🚏 **पलासिया चौराहा बस स्टॉप (लाइव स्थिति):**\n\n• **बस #1 (विजय नगर की ओर):** ~3 मिनट में (सीटें उपलब्ध 🟢)\n• **बस #3 (एमआर10 की ओर):** ~8 मिनट में (मध्यम भीड़ 🟡)\n• **स्टॉप कोड:** IND-PL03\n• **एसएमएस सेवा:** 'ETA PALASIA' भेजें 56161 पर"
      : "🚏 **Palasia Square Stop (Live Status):**\n\n• **Bus #1 (towards Vijay Nagar):** in ~3 mins (Seats Available 🟢)\n• **Bus #3 (towards MR10):** in ~8 mins (Moderate Crowd 🟡)\n• **Stop Code:** IND-PL03\n• **Offline SMS:** Text 'ETA PALASIA' to 56161";
  }

  // 5. Fare Queries
  if (query.includes("fare") || query.includes("ticket") || query.includes("price") || query.includes("किराया") || query.includes("टिकट")) {
    return lang === "hi"
      ? "🎟️ **इंदौर सिटी बस किराया तालिका:**\n\n• **1 से 3 किमी:** ₹10\n• **4 से 8 किमी:** ₹15\n• **9 किमी से अधिक:** ₹20\n• **छात्र/वरिष्ठ नागरिक:** 50% छूट (पास उपलब्ध)\n\n💡 _आप ऐप के शीर्ष नेवबार में 'किराया और टिकट' बटन दबाकर तुरंत यूपीआई क्यूआर टिकट बुक कर सकते हैं!_"
      : "🎟️ **Indore Public Bus Fare Structure:**\n\n• **1 - 3 km:** ₹10\n• **4 - 8 km:** ₹15\n• **9+ km:** ₹20\n• **Students & Seniors:** 50% concession\n\n💡 _You can click 'Fare & Ticket' in the top navbar to calculate exact distance fare and generate an instant UPI QR ticket!_";
  }

  // 6. Lost and Found / Emergency
  if (query.includes("lost") || query.includes("emergency") || query.includes("help") || query.includes("खोया") || query.includes("शिकायत")) {
    return lang === "hi"
      ? "🚨 **हेल्पलाइन और खोया-पाया (Lost & Found):**\n\n• **24x7 टोल-फ्री हेल्पलाइन:** 1800-233-1221\n• **कंट्रोल रूम फोन:** 0731-2544111\n• **खोया सामान रिपोर्ट:** सरवटे बस स्टैंड केंद्रीय कार्यालय (काउंटर 4)\n• **महिला सुरक्षा हेल्पलाइन:** 1090"
      : "🚨 **Helpline & Lost & Found:**\n\n• **24x7 Toll-Free Transit Helpline:** 1800-233-1221\n• **Central Control Room:** 0731-2544111\n• **Lost Item Claim Center:** Sarwate Bus Stand Central Depot (Counter 4)\n• **Women Safety Helpline:** 1090";
  }

  // 7. General fallback
  return lang === "hi"
    ? `🔍 **'${userInput}' के लिए जानकारी:**\n\nइंदौर नगर निगम और एआईसीटीएसएल (AICTSL) की 5 प्रमुख बस लाइनें 24x7 जीपीएस सैटेलाइट से ट्रैक की जा रही हैं।\n\n• आप लाइव नक्शे पर सभी 12 बसों की स्थिति देख सकते हैं।\n• क्या आप किसी विशिष्ट रूट या स्टॉप का समय जानना चाहते हैं?`
    : `🔍 **Information for '${userInput}':**\n\nIndore City Bus Network operates 5 major routes tracked live via satellite GPS.\n\n• **Live Fleet:** 12 active buses running on time.\n• Would you like to check specific stop ETAs (e.g. *Palasia*, *Rajwada*, *Station*) or calculate a route fare?`;
}

export default function AIChatbot() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text:
        language === "hi"
          ? "नमस्ते! मैं आपका इंदौर स्मार्ट बस एआई सहायक (सारथी AI) हूँ। 🚍\n\nआप मुझसे रूट, लाइव बस समय, किराया या स्टॉप्स के बारे में पूछ सकते हैं!"
          : "Hello! I am Saarthi AI 🤖, your smart transit assistant for Indore.\n\nAsk me about live bus ETAs, best routes, fares, or emergency support!",
      time: "Just now",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `${Date.now()}`,
      sender: "user",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg("");
    setIsTyping(true);

    // Simulate AI thinking and reply
    setTimeout(() => {
      const botReplyText = generateAIResponse(text, language);
      const botMessage: Message = {
        id: `${Date.now() + 1}`,
        sender: "bot",
        text: botReplyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-3.5 md:p-4 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-110 active:scale-95 transition-all flex items-center gap-2.5 group"
          title="Open AI Transit Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>
          <span className="font-bold text-xs pr-1 hidden sm:inline group-hover:inline transition-all">
            {language === "hi" ? "सारथी AI से पूछें" : "Ask Saarthi AI"}
          </span>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[400px] h-[540px] max-h-[85vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 backdrop-blur-xl">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">
                    {language === "hi" ? "सारथी AI सहायक" : "Saarthi AI Transit Assistant"}
                  </h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {language === "hi" ? "इंदौर स्मार्ट सिटी पब्लिक ट्रांसपोर्ट" : "Indore City Transit Intelligent Copilot"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl whitespace-pre-line leading-relaxed shadow-md ${
                    m.sender === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-slate-900 border border-slate-800/90 text-slate-200 rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>

                {m.sender === "user" && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-[11px] pl-9 italic">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce delay-300" />
                <span>{language === "hi" ? "सारथी सोच रहा है..." : "Saarthi is thinking..."}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Questions */}
          <div className="p-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
            {[
              language === "hi" ? "स्टेशन से एयरपोर्ट कैसे जाएं?" : "Station to Airport route",
              language === "hi" ? "पलासिया पर बस का समय" : "Next bus at Palasia",
              language === "hi" ? "किराया सूची" : "Bus Fare chart",
              language === "hi" ? "खोया-पाया हेल्पलाइन" : "Lost & Found Helpline",
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition shrink-0 whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={
                language === "hi" ? "सारथी से पूछें (उदा. पलासिया से बस कब है?)..." : "Ask Saarthi AI anything..."
              }
              className="flex-1 h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isTyping}
              className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
