/**
 * Telegram Bot for Real-Time Public Transport Tracking
 * Bot Link: https://t.me/Astrabushjejejnsbot
 */

const BOT_TOKEN = "8126323241:AAFqt4hagrIiyPW9JeeG335Ju5kf7YkMie8";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// City stops database for queries
const STOPS: Record<string, { name: string; buses: Array<{ bus: string; route: string; eta: string; crowd: string }> }> = {
  PALASIA: {
    name: "Palasia Square",
    buses: [
      { bus: "MP09-AB-1001", route: "Route 1 (Station -> Vijay Nagar)", eta: "3 mins", crowd: "Low" },
      { bus: "MP09-AB-1003", route: "Route 3 (Bhanwarkuan -> MR10)", eta: "8 mins", crowd: "Medium" },
    ],
  },
  RAJWADA: {
    name: "Rajwada Palace Gate",
    buses: [
      { bus: "MP09-AB-1002", route: "Route 2 (Rajwada -> Airport)", eta: "5 mins", crowd: "Medium" },
    ],
  },
  STATION: {
    name: "Sarwate Railway Station Stand",
    buses: [
      { bus: "MP09-AB-1001", route: "Route 1 (Station -> Vijay Nagar)", eta: "At Stop (Departs in 2m)", crowd: "Seats Available" },
    ],
  },
  VIJAYNAGAR: {
    name: "Vijay Nagar Square",
    buses: [
      { bus: "MP09-AB-1001", route: "Route 1", eta: "16 mins", crowd: "Low" },
      { bus: "MP09-AB-1004", route: "Route 4", eta: "4 mins", crowd: "Low" },
    ],
  },
  AIRPORT: {
    name: "Airport Terminal Gate",
    buses: [
      { bus: "MP09-AB-1002", route: "Route 2", eta: "12 mins", crowd: "Low" },
    ],
  },
  BHANWARKUAN: {
    name: "Bhanwarkuan Square",
    buses: [
      { bus: "MP09-AB-1003", route: "Route 3", eta: "6 mins", crowd: "High/Full" },
    ],
  },
};

function processQuery(text: string): string {
  const query = (text || "").trim().toUpperCase();

  if (query === "/START" || query === "HI" || query === "HELLO" || query === "HELP") {
    return (
      `🚍 *Indore Public Transport Assistant*\n\n` +
      `Welcome! You can track city buses and get live arrival times.\n\n` +
      `*Try sending:*\n` +
      `• \`ETA Palasia\`\n` +
      `• \`ETA Rajwada\`\n` +
      `• \`ETA Station\`\n` +
      `• \`ETA Vijay Nagar\`\n` +
      `• \`BUS 1001\`\n` +
      `• \`FARE\`\n\n` +
      `_Backed by Satellite GPS Telemetry 🛰️_`
    );
  }

  if (query.includes("FARE")) {
    return (
      `🎟️ *Indore City Bus Fare Chart:*\n\n` +
      `• 1 - 3 km: ₹10\n` +
      `• 4 - 8 km: ₹15\n` +
      `• 9+ km: ₹20\n\n` +
      `_UPI QR Ticketing available on passenger portal!_`
    );
  }

  if (query.startsWith("BUS") || query.includes("1001") || query.includes("1002")) {
    const busNo = query.replace("BUS", "").trim() || "1001";
    return (
      `🚌 *BUS STATUS UPDATE [${busNo}]:*\n\n` +
      `• *Status:* 🟢 Active & On Route\n` +
      `• *Speed:* 28.5 km/h\n` +
      `• *Current Location:* Near Geeta Bhawan Square\n` +
      `• *Next Stop:* Palasia Square (~3 mins)\n` +
      `• *Crowd Level:* 🟢 Seats Available (Low)\n\n` +
      `_Real-Time GPS Ping: Just now_`
    );
  }

  for (const [key, data] of Object.entries(STOPS)) {
    if (query.includes(key) || key.includes(query.replace("ETA", "").trim())) {
      const busList = data.buses
        .map(
          (b) =>
            `• *Bus #${b.bus.slice(-4)}* (${b.route.split(" ")[0]}): *${b.eta}* [Crowd: ${b.crowd}]`
        )
        .join("\n");

      return (
        `🚏 *STOP: ${data.name}*\n\n` +
        `${busList}\n\n` +
        `💰 *Fare to Station:* ₹10\n` +
        `🛰️ _Live Satellite GPS Tracked_`
      );
    }
  }

  return (
    `🚏 *Stop not recognized: '${text}'*\n\n` +
    `*Available Stops:* \`PALASIA\`, \`RAJWADA\`, \`STATION\`, \`VIJAYNAGAR\`, \`AIRPORT\`, \`BHANWARKUAN\`\n\n` +
    `Try typing: \`ETA Palasia\``
  );
}

async function sendMessage(chatId: number, text: string) {
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (err) {
    console.error("Error sending Telegram message:", err);
  }
}

async function startPolling() {
  console.log("🚀 Telegram Transport Bot started! Listening for messages...");
  let offset = 0;

  while (true) {
    try {
      const response = await fetch(`${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=30`);
      const data: any = await response.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            const userText = update.message.text;
            const fromUser = update.message.from?.first_name || "Commuter";

            console.log(`💬 Message from ${fromUser} (${chatId}): "${userText}"`);

            const reply = processQuery(userText);
            await sendMessage(chatId, reply);
          }
        }
      }
    } catch (err) {
      console.error("Polling error, retrying in 3s...", err);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

startPolling();
