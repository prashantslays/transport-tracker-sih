import { Request, Response } from 'express';
import Bus from '../models/Bus';
import { IBus } from '../types';

export const getBuses = async (_req: Request, res: Response) => {
  try {
    const buses: IBus[] = await Bus.find()
      .populate('routeId', 'name routeNumber color')
      .populate('driverId', 'name');
    res.json(buses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch buses' });
  }
};

export const createBus = async (req: Request, res: Response) => {
  try {
    const bus = new Bus(req.body);
    await bus.save();
    res.status(201).json(bus);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ error: 'Bus with this number already exists' });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
};
