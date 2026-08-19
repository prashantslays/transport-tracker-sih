import { Schema, model } from 'mongoose';
import { IStop } from '../types';

const LocationSchema = new Schema<Location>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const StopSchema = new Schema<IStop>({
  name: { type: String, required: true, trim: true },
  location: { type: LocationSchema, required: true },
  routes: [{ type: Schema.Types.ObjectId, ref: 'Route' }],
});

StopSchema.index({ location: '2dsphere' });

export default model<IStop>('Stop', StopSchema);
