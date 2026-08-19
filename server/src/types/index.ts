import { Document, Types } from 'mongoose';

// ---------- Location ----------
export interface Location {
  lat: number;
  lng: number;
}

// ---------- Stop ----------
export interface IStop extends Document {
  name: string;
  location: Location;
  routes: Types.ObjectId[];
}

// ---------- Route ----------
export interface RouteStop {
  stopId: Types.ObjectId;
  order: number;
}

export interface IRoute extends Document {
  name: string;
  routeNumber: string;
  stops: RouteStop[];
  color: string;
}

// ---------- Bus ----------
export interface IBus extends Document {
  busNumber: string;
  routeId: Types.ObjectId;
  driverId: Types.ObjectId;
  isActive: boolean;
  currentLocation: Location;
  lastUpdated: Date;
}

// ---------- Trip ----------
export type TripStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface LocationHistoryEntry {
  lat: number;
  lng: number;
  timestamp: Date;
}

export interface ITrip extends Document {
  busId: Types.ObjectId;
  routeId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: TripStatus;
  locationHistory: LocationHistoryEntry[];
}
