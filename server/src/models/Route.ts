import { Schema, model } from 'mongoose';
import { IRoute } from '../types';

const RouteStopSchema = new Schema(
  {
    stopId: { type: Schema.Types.ObjectId, ref: 'Stop', required: true },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const RouteSchema = new Schema<IRoute>({
  name: { type: String, required: true, trim: true },
  routeNumber: { type: String, required: true, unique: true, trim: true },
  stops: [RouteStopSchema],
  color: { type: String, default: '#3b82f6' },
});

RouteSchema.index({ routeNumber: 1 }, { unique: true });

export default model<IRoute>('Route', RouteSchema);
