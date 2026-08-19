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
    socket.on('driver:location', async (payload: LocationPayload) => {
      const { busId, routeId, lat, lng, timestamp = new Date() } = payload;

      try {
        const location = { lat, lng };

        // Update bus current location
        await Bus.findByIdAndUpdate(busId, {
          currentLocation: location,
          lastUpdated: timestamp,
          isActive: true,
        });

        // Find or create active trip
        const trip = await Trip.findOne({
          busId,
          status: { $in: ['scheduled', 'in-progress'] },
        });

        if (trip) {
          trip.locationHistory.push({ lat, lng, timestamp });
          if (trip.status === 'scheduled') {
            trip.status = 'in-progress';
            trip.startTime = timestamp;
          }
          await trip.save();
        } else {
          // Create new trip if none exists
          await Trip.create({
            busId,
            routeId,
            startTime: timestamp,
            status: 'in-progress' as TripStatus,
            locationHistory: [{ lat, lng, timestamp }],
          });
        }

        // Broadcast position to all passengers subscribed to this route
        broadcastBusPosition(io, routeId, busId, { lat, lng }, timestamp);
      } catch (error) {
        console.error('Error processing driver location:', error);
        socket.emit('error', { message: 'Failed to process location update' });
      }
    });

    // ---------------------------------------------------------------------------
    // PASSENGER:SUBSCRIBE — Passenger subscribes to a route for live updates
    // ---------------------------------------------------------------------------
    socket.on('passenger:subscribe', (payload: SubscribePayload) => {
      const { routeId } = payload;

      if (!routeSubscribers.has(routeId)) {
        routeSubscribers.set(routeId, new Set());
      }

      const subs = routeSubscribers.get(routeId)!;
      subs.add(socket.id);

      // Join a Socket.IO room for this route for efficient broadcasting
      socket.join(`route:${routeId}`);

      console.log(`👤 Passenger ${socket.id} subscribed to route ${routeId}`);

      // Send confirmation
      socket.emit('passenger:subscription-confirmed', { routeId });
    });

    // ---------------------------------------------------------------------------
    // PASSENGER:UNSUBSCRIBE — Passenger unsubscribes from a route
    // ---------------------------------------------------------------------------
    socket.on('passenger:unsubscribe', (payload: SubscribePayload) => {
      const { routeId } = payload;
      const subs = routeSubscribers.get(routeId);

      if (subs) {
        subs.delete(socket.id);
        if (subs.size === 0) {
          routeSubscribers.delete(routeId);
        }
      }

      socket.leave(`route:${routeId}`);
      console.log(`👤 Passenger ${socket.id} unsubscribed from route ${routeId}`);
    });

    // ---------------------------------------------------------------------------
    // Bus position broadcast is handled internally (not a direct socket event)
    // ---------------------------------------------------------------------------
    socket.on('bus:position', () => {
      // This event is broadcast *to* passengers, not received from them.
      // If a passenger somehow sends this, we ignore it.
    });

    // ---------------------------------------------------------------------------
    // DISCONNECT
    // ---------------------------------------------------------------------------
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);

      // Remove socket from all route subscriber sets
      routeSubscribers.forEach((subs, routeId) => {
        subs.delete(socket.id);
        if (subs.size === 0) {
          routeSubscribers.delete(routeId);
        }
      });
    });
  });
};

/**
 * Broadcasts a bus position to all passengers subscribed to a route.
 */
export const broadcastBusPosition = (
  io: Server,
  routeId: string,
  busId: string,
  location: Location,
  timestamp: Date
): void => {
  io.to(`route:${routeId}`).emit('bus:position', {
    busId,
    routeId,
    lat: location.lat,
    lng: location.lng,
    timestamp,
  });
};
