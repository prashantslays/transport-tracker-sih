import { Request, Response } from 'express';
import Stop from '../models/Stop';
import Bus from '../models/Bus';
import Route from '../models/Route';
import { calculateEtaMinutes, getDistance } from '../services/etaService';

/**
 * GET /api/eta/:stopId
 * Returns ETA and distance for all active buses on routes serving this stop.
 */
export const getEtaForStop = async (req: Request, res: Response) => {
  try {
    const { stopId } = req.params;

    // Find the stop and the routes that serve it
    const stop = await Stop.findById(stopId).populate('routes', 'routeNumber name color');
    if (!stop) {
      res.status(404).json({ error: 'Stop not found' });
      return;
    }

    // Collect all route IDs serving this stop
    const routeIds = stop.routes.map((r: any) => r._id);

    // Find all active buses on those routes
    const buses = await Bus.find({ routeId: { $in: routeIds }, isActive: true }).populate(
      'routeId',
      'name routeNumber color'
    );

    const etas = buses.map((bus) => {
      const distance = getDistance(bus.currentLocation, stop.location);
      const etaMinutes = calculateEtaMinutes(bus.currentLocation, stop.location);

      return {
        busId: bus._id,
        busNumber: bus.busNumber,
        routeId: bus.routeId,
        distanceKm: Math.round(distance * 1000) / 1000,
        etaMinutes,
        lastUpdated: bus.lastUpdated,
      };
    });

    res.json({ stopId, stopName: stop.name, etas });
  } catch (err: any) {
    if (err instanceof Error && err.name === 'CastError') {
      res.status(400).json({ error: 'Invalid stop ID format' });
    } else {
      res.status(500).json({ error: 'Failed to calculate ETA' });
    }
  }
};
