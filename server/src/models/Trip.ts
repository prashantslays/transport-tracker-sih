import { Schema, model } from 'mongoose';
import { ITrip, TripStatus } from '../types';

const LocationHistoryEntrySchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TripSchema = new Schema<ITrip>({
  busId: { type: Schema.Types.ObjectId, ref: 'Bus', required: true },
  routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'] as TripStatus[],
    default: 'scheduled',
  },
  locationHistory: [LocationHistoryEntrySchema],
});

TripSchema.index({ busId: 1 });
TripSchema.index({ routeId: 1 });
TripSchema.index({ status: 1 });

export default model<ITrip>('Trip', TripSchema);
