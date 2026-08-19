import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

// Sample coordinates around Indore
const ROUTES = {
  "route-1": [
    { lat: 22.7196, lng: 75.8577 }, // Starting point
    { lat: 22.7206, lng: 75.8677 },
    { lat: 22.7306, lng: 75.8777 },
    { lat: 22.7406, lng: 75.8877 },
    { lat: 22.7506, lng: 75.8977 }, // End point
  ],
  "route-2": [
    { lat: 22.7096, lng: 75.8477 },
    { lat: 22.7196, lng: 75.8377 },
    { lat: 22.7296, lng: 75.8277 },
    { lat: 22.7396, lng: 75.8177 },
  ]
};

const buses = [
  { busId: "bus-001", busNumber: "MP09-AB-1001", routeId: "route-1", currentPoint: 0, direction: 1 },
  { busId: "bus-002", busNumber: "MP09-AB-1002", routeId: "route-2", currentPoint: 0, direction: 1 },
];

console.log("Starting simulator...");

socket.on("connect", () => {
  console.log("Simulator connected to server");
  
  setInterval(() => {
    buses.forEach(bus => {
      const route = ROUTES[bus.routeId as keyof typeof ROUTES];
      if (!route) return;
      
      // Get current and next point
      const currentLoc = route[bus.currentPoint];
      let nextPoint = bus.currentPoint + bus.direction;
      
      // Reverse direction if at the end of route
      if (nextPoint >= route.length || nextPoint < 0) {
        bus.direction *= -1;
        nextPoint = bus.currentPoint + bus.direction;
      }
      
      const nextLoc = route[nextPoint];
      
      // Interpolate a bit (simulate moving between points)
      // For simplicity in this demo, just move exactly to the point over time
      // Or just jump to the next point
      
      const location = {
        lat: currentLoc.lat + (Math.random() * 0.001 - 0.0005),
        lng: currentLoc.lng + (Math.random() * 0.001 - 0.0005)
      };

      console.log(`Sending GPS for ${bus.busNumber}: ${location.lat}, ${location.lng}`);
      
      socket.emit("driver:location", {
        busId: bus.busId,
        busNumber: bus.busNumber,
        routeId: bus.routeId,
        driverId: `driver-${bus.busId}`,
        location,
        timestamp: new Date().toISOString()
      });
      
      // Occasionally advance to next point
      if (Math.random() > 0.7) {
        bus.currentPoint = nextPoint;
      }
    });
  }, 3000); // Send updates every 3 seconds
});
