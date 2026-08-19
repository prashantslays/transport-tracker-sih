import { Server, Socket } from 'socket.io';
import Bus from '../models/Bus';
import Trip from '../models/Trip';
import { Location, TripStatus } from '../types';

// In-memory map of routeId -> Set of passenger socket IDs
const routeSubscribers = new Map<string, Set<string>>();

interface LocationPayload {
  busId: string;
  routeId: string;
  driverId?: string;
  lat: number;
  lng: number;
  timestamp?: Date;
}

interface SubscribePayload {
  routeId: string;
}

export const registerSocketHandlers = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ---------------------------------------------------------------------------
    // DRIVER:LOCATION — Driver app sends GPS update
    // ---------------------------------------------------------------------------
    socket.on('driver:location', async (payload: any) => {
      const busId = payload.busId || 'unknown-bus';
      const busNumber = payload.busNumber || busId;
      const routeId = payload.routeId || 'route-1';
      const lat = payload.lat ?? payload.location?.lat ?? 22.7196;
      const lng = payload.lng ?? payload.location?.lng ?? 75.8577;
      const timestamp = payload.timestamp || new Date().toISOString();

      try {
        const location = { lat, lng };

        // Attempt MongoDB update if connected
        if (Bus.db.readyState === 1) {
          await Bus.findByIdAndUpdate(busId, {
            currentLocation: location,
            lastUpdated: new Date(timestamp),
            isActive: true,
          }).catch(() => {});

          const trip = await Trip.findOne({
            busId,
            status: { $in: ['scheduled', 'in-progress'] },
          }).catch(() => null);

          if (trip) {
            trip.locationHistory.push({ lat, lng, timestamp: new Date(timestamp) });
            if (trip.status === 'scheduled') {
              trip.status = 'in-progress';
              trip.startTime = new Date(timestamp);
            }
            await trip.save().catch(() => {});
          }
        }
      } catch (err) {
        // Continue broadcasting even if DB fails
      }

      // Broadcast position to all passengers & route subscribers
      const busUpdate = {
        busId,
        busNumber,
        routeId,
        location: { lat, lng },
        lastUpdated: timestamp,
      };

      io.to(`route:${routeId}`).emit('bus:position', busUpdate);
      io.to('route:all').emit('bus:position', busUpdate);
      io.emit('bus:position', busUpdate);
    });

    // ---------------------------------------------------------------------------
    // OCCUPANCY:UPDATE — Driver or passenger updates bus crowding level
    // ---------------------------------------------------------------------------
    socket.on('occupancy:update', (payload: { busId: string; level: 'low' | 'medium' | 'high' }) => {
      console.log(`👥 Occupancy update for ${payload.busId}: ${payload.level}`);
      io.emit('occupancy:broadcast', payload);
    });

    // ---------------------------------------------------------------------------
    // SOS:TRIGGER — Emergency panic button activated
    // ---------------------------------------------------------------------------
    socket.on('sos:trigger', (payload: { busId: string; busNumber: string; routeId: string; location: { lat: number; lng: number }; timestamp: string }) => {
      console.warn(`🚨 EMERGENCY SOS TRIGGERED by Bus ${payload.busNumber}!`);
      io.emit('sos:alert', {
        ...payload,
        id: `sos-${Date.now()}`,
        status: 'ACTIVE',
      });
    });

    // ---------------------------------------------------------------------------
    // PASSENGER:SUBSCRIBE — Passenger subscribes to a route for live updates
    // ---------------------------------------------------------------------------
    socket.on('passenger:subscribe', (payload: any) => {
      const routeId = typeof payload === 'string' ? payload : (payload?.routeId || 'all');

      if (!routeSubscribers.has(routeId)) {
        routeSubscribers.set(routeId, new Set());
      }

      const subs = routeSubscribers.get(routeId)!;
      subs.add(socket.id);

      socket.join(`route:${routeId}`);
      console.log(`👤 Passenger ${socket.id} subscribed to route ${routeId}`);

      socket.emit('passenger:subscription-confirmed', { routeId });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      routeSubscribers.forEach((subs, routeId) => {
        subs.delete(socket.id);
        if (subs.size === 0) {
          routeSubscribers.delete(routeId);
        }
      });
    });
  });
};

export const broadcastBusPosition = (
  io: Server,
  routeId: string,
  busId: string,
  location: Location,
  timestamp: Date
): void => {
  const busUpdate = {
    busId,
    busNumber: busId,
    routeId,
    location: { lat: location.lat, lng: location.lng },
    lastUpdated: timestamp.toISOString(),
  };
  io.to(`route:${routeId}`).emit('bus:position', busUpdate);
  io.to('route:all').emit('bus:position', busUpdate);
  io.emit('bus:position', busUpdate);
};
