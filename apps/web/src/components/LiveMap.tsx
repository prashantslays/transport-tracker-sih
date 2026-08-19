"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import { socket } from "@/lib/socket";
import { Users, AlertTriangle, ShieldAlert, Sparkles, Navigation } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Default to Indore center
const DEFAULT_CENTER: [number, number] = [22.7196, 75.8577];

// Custom Bus Marker
const busIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Major City Stops in Indore
const CITY_STOPS = [
  { id: "st-1", name: "Sarwate Bus Stand", nameHi: "सरवटे बस स्टैंड", coords: [22.7126, 75.8667] as [number, number] },
  { id: "st-2", name: "Geeta Bhawan", nameHi: "गीता भवन", coords: [22.7206, 75.8777] as [number, number] },
  { id: "st-3", name: "Palasia Square", nameHi: "पलासिया चौराहा", coords: [22.7256, 75.8897] as [number, number] },
  { id: "st-4", name: "Vijay Nagar Square", nameHi: "विजय नगर चौराहा", coords: [22.7536, 75.8937] as [number, number] },
  { id: "st-5", name: "Rajwada Palace", nameHi: "राजवाड़ा पैलेस", coords: [22.7196, 75.8577] as [number, number] },
  { id: "st-6", name: "Airport Terminal", nameHi: "एयरपोर्ट टर्मिनल", coords: [22.7216, 75.8017] as [number, number] },
  { id: "st-7", name: "Bhanwarkuan Square", nameHi: "भंवरकुआं चौराहा", coords: [22.6896, 75.8647] as [number, number] },
];

type Bus = {
  busId: string;
  busNumber: string;
  routeId: string;
  location: { lat: number; lng: number };
  lastUpdated: string;
  occupancy?: "low" | "medium" | "high";
};

type SOSAlert = {
  id: string;
  busNumber: string;
  routeId: string;
  location: { lat: number; lng: number };
  timestamp: string;
};

export default function LiveMap() {
  const { language, t } = useLanguage();
  const [buses, setBuses] = useState<Record<string, Bus>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [activeSOS, setActiveSOS] = useState<SOSAlert | null>(null);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("passenger:subscribe", "all");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("bus:position", (data: Bus) => {
      setBuses((prev) => ({
        ...prev,
        [data.busId]: {
          ...prev[data.busId],
          ...data,
          occupancy: prev[data.busId]?.occupancy || "low",
        },
      }));
    });

    socket.on("occupancy:broadcast", (data: { busId: string; level: "low" | "medium" | "high" }) => {
      setBuses((prev) => {
        if (!prev[data.busId]) return prev;
        return {
          ...prev,
          [data.busId]: { ...prev[data.busId], occupancy: data.level },
        };
      });
    });

    socket.on("sos:alert", (alert: SOSAlert) => {
      setActiveSOS(alert);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("bus:position");
      socket.off("occupancy:broadcast");
      socket.off("sos:alert");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      {/* Live Connection & SOS Status Badge */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 max-w-sm">
        <div className="bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
              {isConnected ? (language === "hi" ? "लाइव जीपीएस कनेक्टेड" : "Live GPS Connected") : "Connecting..."}
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold">
              Indore Fleet
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>{Object.keys(buses).length} {t("activeBuses")}</span>
            <span className="text-slate-500">• 7 Major Stops</span>
          </div>
        </div>

        {/* Flashing SOS Alert if triggered */}
        {activeSOS && (
          <div className="bg-rose-950/95 border border-rose-500 text-rose-200 p-3 rounded-2xl shadow-2xl backdrop-blur-md animate-bounce flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs">
              <div className="font-bold text-rose-300">{t("sosTriggered")}</div>
              <div>Bus #{activeSOS.busNumber} triggered SOS near [{activeSOS.location.lat.toFixed(3)}, {activeSOS.location.lng.toFixed(3)}]</div>
            </div>
          </div>
        )}
      </div>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Bus Stop Markers */}
        {CITY_STOPS.map((stop) => (
          <CircleMarker
            key={stop.id}
            center={stop.coords}
            radius={6}
            pathOptions={{ color: "#6366f1", fillColor: "#ffffff", fillOpacity: 1, weight: 3 }}
          >
            <Popup>
              <div className="font-sans text-xs">
                <div className="font-bold text-slate-900">🚏 {language === "hi" ? stop.nameHi : stop.name}</div>
                <div className="text-slate-500 mt-0.5">Designated Bus Stop</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Live Moving Buses */}
        {Object.values(buses).map((bus) => {
          const occ = bus.occupancy || "low";
          const occBadge =
            occ === "low"
              ? "🟢 Seats Available"
              : occ === "medium"
              ? "🟡 Standing Only"
              : "🔴 Crowded";

          return (
            <Marker
              key={bus.busId}
              position={[bus.location.lat, bus.location.lng]}
              icon={busIcon}
            >
              <Popup>
                <div className="font-sans text-sm min-w-[180px]">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5">
                    <span className="font-bold text-slate-900">Bus #{bus.busNumber}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      LIVE
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div>Route: <span className="font-semibold">{bus.routeId}</span></div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span className="font-medium">{occBadge}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1">
                      GPS Ping: {new Date(bus.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

