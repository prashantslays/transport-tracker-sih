import { Request, Response } from 'express';
import Stop from '../models/Stop';
import { IStop } from '../types';

export const getStops = async (_req: Request, res: Response) => {
  try {
    const stops: IStop[] = await Stop.find().populate('routes', 'name routeNumber');
    res.json(stops);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stops' });
  }
};

export const createStop = async (req: Request, res: Response) => {
  try {
    const stop = new Stop(req.body);
    await stop.save();
    res.status(201).json(stop);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
