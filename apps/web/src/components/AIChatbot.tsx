"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Sparkles,
  User,
  MapPin,
  Clock,
  IndianRupee,
  ArrowRight,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  Volume2,
  Trash2,
  Compass,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
  actionTriggered?: string;
}

export default function AIChatbot() {
  const router = useRouter();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text:
        language === "hi"
          ? "नमस्ते! मैं **सारथी AI (Saarthi)** हूँ — आपका पूर्ण AI साथी और स्मार्ट सिटी असिस्टेंट! 🤖✨\n\nआप मुझसे किसी भी विषय पर सामान्य बातचीत कर सकते हैं (जैसे जोक्स, सवाल, सलाह), या बस के रूट, लाइव ट्रैकिंग और किराए के बारे में पूछ सकते हैं।"
          : "Hello! I am **Saarthi AI** 🤖 — your full-fledged conversational AI agent & transit copilot!\n\nI can chat with you normally about **anything** (ask me general questions, tell me a joke, chat about life or coding), as well as provide real-time bus tracking and ticket assistance across the city.",
      time: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Speech Recognition support (if supported by browser)
  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "hi" ? "hi-IN" : "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMsg(transcript);
          handleSend(transcript);
        }
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Text-to-speech for AI responses
  const speakMessage = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const cleanText = text.replace(/\[ACTION:.*?\]/g, "").replace(/[*_#`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === "hi" ? "hi-IN" : "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend?: string) => {
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

    try {
      // Build full conversation history for AI agent
      const historyPayload = messages.concat(userMessage).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          language,
        }),
      });

      const data = await res.json();
      let botReply = data.reply || "I am right here with you! How can I assist you further?";

      // Check and execute Agentic Actions
      let actionFound: string | undefined = undefined;
      if (botReply.includes("[ACTION:NAVIGATE_MAP]")) {
        actionFound = "Navigating to Live Map...";
        setTimeout(() => router.push("/map"), 1500);
      } else if (botReply.includes("[ACTION:OPEN_FARE]")) {
        actionFound = "Opening Fare & Ticket Calculator...";
      } else if (botReply.includes("[ACTION:OPEN_DRIVER]")) {
        actionFound = "Opening Driver Portal...";
        setTimeout(() => router.push("/driver/login"), 1500);
      } else if (botReply.includes("[ACTION:OPEN_ADMIN]")) {
        actionFound = "Opening City Control Room...";
        setTimeout(() => router.push("/admin"), 1500);
      } else if (botReply.includes("[ACTION:OPEN_SMS]")) {
        actionFound = "Opening SMS App...";
        setTimeout(() => router.push("/sms"), 1500);
      }

      // Remove action tags from visible message
      const cleanReply = botReply.replace(/\[ACTION:.*?\]/g, "").trim();

      const botMessage: Message = {
        id: `${Date.now() + 1}`,
        sender: "bot",
        text: cleanReply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionTriggered: actionFound,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("AI chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now() + 1}`,
          sender: "bot",
          text:
            language === "hi"
              ? "मैं यहाँ हूँ! आप मुझसे सामान्य बातचीत कर सकते हैं, चुटकुले सुन सकते हैं, या इंदौर बस रूट और लाइव स्थिति के बारे में पूछ सकते हैं।"
              : "I'm right here with you! Feel free to ask me anything — general knowledge, casual conversation, jokes, or live bus tracking across Indore.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        sender: "bot",
        text:
          language === "hi"
            ? "बातचीत रीसेट हो गई! आप मुझसे क्या पूछना चाहते हैं? 😊"
            : "Conversation cleared! What would you like to chat about? 😊",
        time: "Just now",
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Badge */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-[0_0_35px_rgba(99,102,241,0.6)] hover:scale-110 active:scale-95 transition-all flex items-center gap-2.5 group"
          title="Chat with Full AI Agent"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>
          <div className="flex flex-col items-start pr-1 hidden sm:flex">
            <span className="font-black text-xs tracking-tight">
              {language === "hi" ? "सारथी AI एजेंट" : "Saarthi AI Agent"}
            </span>
            <span className="text-[9px] text-cyan-200 font-medium leading-none">
              {language === "hi" ? "किसी भी विषय पर बात करें" : "Talk about anything"}
            </span>
          </div>
        </button>
      )}

      {/* Floating AI Agent Modal */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-slate-950/95 border border-slate-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 backdrop-blur-2xl transition-all ${
            isExpanded
              ? "inset-4 sm:inset-10 w-auto h-auto"
              : "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[440px] h-[580px] max-h-[88vh]"
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                    <span>{language === "hi" ? "सारथी AI एजेंट" : "Saarthi AI Agent"}</span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </h3>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                    Full AI Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {language === "hi" ? "सामान्य बातचीत + स्मार्ट सिटी बस नेविगेशन" : "General Conversational AI & Transit Copilot"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Minimize" : "Expand"}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors hidden sm:inline-flex"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Message History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-600/40 to-purple-600/40 border border-indigo-500/30 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="flex flex-col max-w-[84%]">
                  <div
                    className={`p-3.5 rounded-2xl whitespace-pre-line leading-relaxed shadow-md ${
                      m.sender === "user"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                        : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Triggered Agentic Action Badge */}
                  {m.actionTriggered && (
                    <div className="mt-1.5 text-[10px] font-bold text-cyan-400 flex items-center gap-1 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-lg animate-pulse self-start">
                      <Compass className="w-3 h-3 animate-spin" />
                      <span>{m.actionTriggered}</span>
                    </div>
                  )}

                  {/* Speech playback for bot message */}
                  {m.sender === "bot" && (
                    <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-500">
                      <span>{m.time}</span>
                      <button
                        onClick={() => speakMessage(m.text)}
                        title="Read aloud"
                        className="hover:text-indigo-400 transition"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
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
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce delay-300" />
                <span>{language === "hi" ? "सारथी सोच रहा है..." : "Saarthi is typing..."}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Topic Chips (Conversational & Transit) */}
          <div className="p-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
            {[
              language === "hi" ? "एक मजेदार जोक सुनाओ" : "Tell me a joke 😄",
              language === "hi" ? "स्टेशन से एयरपोर्ट कैसे जाएं?" : "Station to Airport route",
              language === "hi" ? "लाइव नक्शा खोलो" : "Show live map 🗺️",
              language === "hi" ? "SIH हैकथॉन की तैयारी कैसे करें?" : "How to win SIH hackathon? 🚀",
              language === "hi" ? "किराया कितना है?" : "What is the bus fare?",
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white transition shrink-0 whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            {/* Voice input button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isListening ? "Listening..." : "Click to speak"}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition shrink-0 ${
                isListening
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={
                isListening
                  ? "Listening..."
                  : language === "hi"
                  ? "सारथी से कुछ भी पूछें (सामान्य बातचीत, जोक्स, बस रूट)..."
                  : "Ask Saarthi anything (talk normally, jokes, bus routes)..."
              }
              className="flex-1 h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
            />

            <button
              type="submit"
              disabled={!inputMsg.trim() || isTyping}
              className="w-11 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
