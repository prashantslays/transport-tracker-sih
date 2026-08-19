import express, { Express, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import routeRoutes from './routes/routeRoutes';
import stopRoutes from './routes/stopRoutes';
import busRoutes from './routes/busRoutes';
import etaRoutes from './routes/etaRoutes';
import smsRoutes from './routes/smsRoutes';
import { registerSocketHandlers } from './socket';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const port = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'transport-tracker-server',
    timestamp: new Date().toISOString(),
    port: Number(port),
  });
});

app.use('/api/routes', routeRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/eta', etaRoutes);
app.use('/api/sms', smsRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ---------------------------------------------------------------------------
// Socket.IO
// ---------------------------------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

registerSocketHandlers(io);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
connectDB().then(() => {
  server.listen(port, () => {
    console.log(`🚀 Transport Tracker server listening on http://localhost:${port}`);
    console.log(`📡 Socket.IO ready for connections`);
    console.log(`🗄️  MongoDB connected`);
  });
});
