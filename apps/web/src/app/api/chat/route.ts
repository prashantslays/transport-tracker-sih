import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, language, apiKey: clientApiKey } = body;

    const userMessage = messages[messages.length - 1]?.content || "";

    const systemPrompt = `You are "Saarthi AI" (सारथी AI), a full-fledged intelligent conversational AI agent embedded in the Indore Smart City Public Transport System for the Smart India Hackathon (SIH).

Personality & Abilities:
1. You are a versatile, friendly, intelligent companion. You can chat normally about ANY topic (science, coding, jokes, life, weather, philosophy, everyday questions, hackathons).
2. You are also the ultimate transit expert for Indore city: you know routes, stops, fares, and live fleet management.
3. You speak fluently in English, Hindi, and Hinglish. Automatically adapt to the user's language.
4. When relevant, you can execute real UI actions in the app by including these action tags:
   - [ACTION:NAVIGATE_MAP] -> when user asks to see/open the live map
   - [ACTION:OPEN_FARE] -> when user asks for fare calculator or digital ticket
   - [ACTION:OPEN_DRIVER] -> when user asks for driver terminal
   - [ACTION:OPEN_ADMIN] -> when user asks for admin control room
   - [ACTION:OPEN_SMS] -> when user asks for offline SMS app

Keep responses natural, helpful, engaging, and well-formatted with markdown and emojis.`;

    const chatHistory = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-8),
    ];

    // Priority 1: Google Gemini API (if GEMINI_API_KEY is configured in Vercel or environment)
    const geminiKey = process.env.GEMINI_API_KEY || (clientApiKey?.startsWith("AIza") ? clientApiKey : null);
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 600,
              },
            }),
            signal: AbortSignal.timeout(9000),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return NextResponse.json({ reply: text.trim() });
        }
      } catch (err) {
        console.warn("Gemini API call failed, falling back...", err);
      }
    }

    // Priority 2: OpenRouter API (if OPENROUTER_API_KEY is configured)
    const openrouterKey = process.env.OPENROUTER_API_KEY || (clientApiKey?.startsWith("sk-or") ? clientApiKey : null);
    if (openrouterKey) {
      try {
        const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openrouterKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-exp:free",
            messages: chatHistory,
          }),
          signal: AbortSignal.timeout(9000),
        });

        if (orRes.ok) {
          const orData = await orRes.json();
          const text = orData.choices?.[0]?.message?.content;
          if (text) return NextResponse.json({ reply: text.trim() });
        }
      } catch (err) {
        console.warn("OpenRouter API call failed, falling back...", err);
      }
    }

    // Priority 3: Free Zero-Config Multi-LLM Engine (Pollinations / OpenAI compatible)
    try {
      const response = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          model: "openai",
          seed: 42,
        }),
        signal: AbortSignal.timeout(9000),
      });

      if (response.ok) {
        const replyText = await response.text();
        if (replyText && replyText.trim().length > 0) {
          return NextResponse.json({ reply: replyText.trim() });
        }
      }
    } catch (e) {
      console.warn("Free LLM gateway timeout, using intelligent fallback");
    }

    // Priority 4: Built-in Intelligent Fallback Response
    const fallbackReply = getIntelligentFallback(userMessage, language);
    return NextResponse.json({ reply: fallbackReply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      reply: "I am here! 😊 Ask me any question, chat about any topic, or ask about Indore bus routes, fares, and live GPS tracking.",
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
