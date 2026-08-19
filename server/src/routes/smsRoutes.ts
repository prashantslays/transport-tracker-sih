import { Router, Request, Response } from "express";

const router = Router();

// Sample city stops database for SMS lookups
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

/**
 * Generates an SMS response string based on incoming query text
 */
function processSMSQuery(incomingText: string): string {
  const query = (incomingText || "").trim().toUpperCase();

  if (!query || query === "HELP" || query === "HI" || query === "HELLO") {
    return `🚌 Indore City Bus SMS Info\nReply:\n• 'ETA <STOP>' (e.g. ETA PALASIA)\n• 'BUS <NO>' (e.g. BUS 1001)\n• 'FARE' for fare chart.\nToll-Free 24x7.`;
  }

  if (query.includes("FARE")) {
    return `🎟️ Indore City Bus Fares:\n• 1-3 km: Rs. 10\n• 4-8 km: Rs. 15\n• 9+ km: Rs. 20\nConcession: 50% for Students/Seniors.`;
  }

  if (query.startsWith("BUS") || query.includes("1001") || query.includes("1002")) {
    const busNo = query.replace("BUS", "").trim() || "1001";
    return `🚌 BUS UPDATE [${busNo}]:\n• Status: Active (Speed: 29 km/h)\n• Current Loc: Near Geeta Bhawan\n• Next Stop: Palasia Sq (in ~3m)\n• Crowd: 🟢 Seats Available`;
  }

  // Check matching stop names
  for (const [key, data] of Object.entries(STOPS)) {
    if (query.includes(key) || key.includes(query.replace("ETA", "").trim())) {
      const busList = data.buses
        .map((b) => `• Bus #${b.bus.slice(-4)} (${b.route.split(" ")[0]}): ${b.eta} [Crowd: ${b.crowd}]`)
        .join("\n");

      return `🚏 STOP: ${data.name}\n${busList}\nFare to Station: Rs 10\n[Live Satellite GPS Tracked]`;
    }
  }

  return `🚏 STOP '${incomingText}' not found.\nPopular: PALASIA, RAJWADA, STATION, VIJAYNAGAR, AIRPORT.\nReply 'ETA PALASIA'`;
}

/**
 * Twilio Webhook Handler (POST /api/sms/webhook)
 * Twilio sends incoming SMS as application/x-www-form-urlencoded with 'Body', 'From', 'To'
 */
router.post("/webhook", (req: Request, res: Response) => {
  const incomingMsg = req.body?.Body || req.query?.Body || req.body?.text || "";
  const senderNumber = req.body?.From || req.query?.From || "Unknown";

  console.log(`📱 INCOMING REAL SMS from ${senderNumber}: "${incomingMsg}"`);

  const replyText = processSMSQuery(String(incomingMsg));

  console.log(`📤 OUTGOING SMS REPLY to ${senderNumber}:\n${replyText}`);

  // Return standard TwiML XML format for Twilio
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${replyText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Message>
</Response>`;

  res.set("Content-Type", "text/xml");
  res.status(200).send(twiml);
});

/**
 * Direct REST endpoint for manual testing (GET or POST /api/sms/query)
 */
router.all("/query", (req: Request, res: Response) => {
  const query = req.body?.query || req.query?.query || req.body?.text || "";
  const reply = processSMSQuery(String(query));
  res.json({
    query,
    reply,
    timestamp: new Date().toISOString(),
  });
});

export default router;
