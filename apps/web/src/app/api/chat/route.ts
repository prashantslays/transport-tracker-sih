import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, language } = body;

    const userMessage = messages[messages.length - 1]?.content || "";

    const systemPrompt = `You are "Saarthi AI" (सारथी AI), a full-fledged intelligent AI agent and friendly companion embedded in the Indore Smart City Public Transport System for the Smart India Hackathon (SIH).

Personality & Abilities:
1. You are a general-purpose, witty, helpful, and natural conversationalist. You can chat normally about ANYTHING (jokes, science, coding, life, weather, philosophy, casual conversations, movies, small talk).
2. You are also an expert on Indore city, public transport, smart mobility, routes, and tickets.
3. You speak fluently in English, Hindi, and Hinglish. Adapt to the user's language automatically.
4. When appropriate, you can trigger actions in the app by including special action tags in your response:
   - [ACTION:NAVIGATE_MAP] -> when user asks to open/see map
   - [ACTION:OPEN_FARE] -> when user asks to calculate fare or buy ticket
   - [ACTION:OPEN_DRIVER] -> when user asks for driver portal
   - [ACTION:OPEN_ADMIN] -> when user asks for admin control room
   - [ACTION:OPEN_SMS] -> when user asks for offline SMS feature

Keep responses clear, natural, engaging, and well-formatted with markdown and emojis.`;

    const chatHistory = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-8), // Keep recent conversation context
    ];

    // Call free multi-LLM gateway (Pollinations AI / OpenAI compatible)
    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: chatHistory,
        model: "openai",
        seed: 42,
        jsonMode: false,
      }),
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (response.ok) {
      const replyText = await response.text();
      if (replyText && replyText.trim().length > 0) {
        return NextResponse.json({ reply: replyText.trim() });
      }
    }

    // Fallback if external API is slow
    const fallbackReply = getIntelligentFallback(userMessage, language);
    return NextResponse.json({ reply: fallbackReply });
  } catch (error) {
    console.error("Chat API error:", error);
    // Intelligent local fallback so the user always gets a great reply
    return NextResponse.json({
      reply: "I'm right here with you! 😊 I can answer any questions, chat normally, help you navigate routes in Indore, calculate fares, or show you live bus tracking on the map. What's on your mind?",
    });
  }
}

function getIntelligentFallback(input: string, lang: string): string {
  const q = (input || "").toLowerCase().trim();

  if (q.includes("joke") || q.includes("चुटकुला")) {
    return lang === "hi"
      ? "😄 एक बस ड्राइवर ने कंडक्टर से पूछा: 'भाई, बस में इतनी शांति क्यों है?'\nकंडक्टर: 'सबका टिकट कट चुका है और सब लाइव जीपीएस मैप पर अपनी लोकेशन देख रहे हैं!' 🚍✨"
      : "😄 Why did the bus stop in the middle of the road?\nBecause it wanted to check its live ETA on Saarthi AI! 🚍⚡";
  }

  if (q.includes("who are you") || q.includes("तुम कौन हो") || q.includes("about you")) {
    return lang === "hi"
      ? "मैं **सारथी AI (Saarthi AI)** हूँ — आपका ऑल-इन-वन स्मार्ट सिटी एआई एजेंट! 🤖\n\nमैं आपसे किसी भी विषय पर बात कर सकता हूँ, आपके सवालों के जवाब दे सकता हूँ, और साथ ही इंदौर की लाइव बसों को ट्रैक करने में मदद कर सकता हूँ।"
      : "I am **Saarthi AI** 🤖 — your full-fledged autonomous AI companion for smart public transit and daily conversations!\n\nI can chat with you about anything in the world, tell stories, answer tech questions, and simultaneously guide you through city transit with live GPS telemetry.";
  }

  if (q.includes("map") || q.includes("नक्शा")) {
    return "Opening the live map for you! 🗺️ [ACTION:NAVIGATE_MAP]\nHere you can see all 12 active buses moving across Indore in real-time.";
  }

  if (q.includes("fare") || q.includes("ticket") || q.includes("किराया")) {
    return "Opening the Fare & Digital Ticket calculator! 🎟️ [ACTION:OPEN_FARE]\nYou can calculate distance-based fares and generate instant UPI QR tickets.";
  }

  return lang === "hi"
    ? `मुझे आपकी बात समझ आई! '${input}' के बारे में बात करने के अलावा, मैं आपकी बस यात्रा, टिकट और लाइव लोकेशन में भी मदद कर सकता हूँ। आप क्या जानना चाहते हैं? 😊`
    : `That's an interesting thought about '${input}'! Beyond chatting, I can also navigate routes, calculate fares, and track live buses across the city for you. What would you like to explore? 😊`;
}
