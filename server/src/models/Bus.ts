import { Schema, model } from 'mongoose';
import { IBus } from '../types';

const LocationSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const BusSchema = new Schema<IBus>({
  busNumber: { type: String, required: true, unique: true, trim: true },
  routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
  isActive: { type: Boolean, default: true },
  currentLocation: { type: LocationSchema, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

BusSchema.index({ routeId: 1 });
BusSchema.index({ currentLocation: '2dsphere' });

export default model<IBus>('Bus', BusSchema);
