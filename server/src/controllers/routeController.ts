import { Request, Response } from 'express';
import Route from '../models/Route';
import { IRoute } from '../types';

export const getRoutes = async (_req: Request, res: Response) => {
  try {
    const routes: IRoute[] = await Route.find().populate('stops.stopId', 'name location');
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
};

export const createRoute = async (req: Request, res: Response) => {
  try {
    const route = new Route(req.body);
    await route.save();
    res.status(201).json(route);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ error: 'Route with this number already exists' });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
};
