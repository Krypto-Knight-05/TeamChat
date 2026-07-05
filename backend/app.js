import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import env from './env.js';

import authRoutes from './http/routes/auth.routes.js';
import teamRoutes from './http/routes/team.routes.js';
import requireAuth from './http/middlewares/requireAuth.js';
import { socketAuth } from './socket/middleware/socket.auth.js';
import chatHandlers from './socket/handlers/chat.handlers.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN }));

const httpServer = createServer(app);

// HTTP Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', requireAuth, teamRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Socket.IO
const io = new Server(httpServer, {
  cors: { origin: env.CORS_ORIGIN },
});

io.use(socketAuth);

io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.user.name} (${socket.id})`);

  // Each user gets a personal room for targeted notifications
  socket.join(`user:${socket.user.id}`);

  chatHandlers(socket, io);

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.user.name} (${socket.id})`);
  });
});

httpServer.listen(env.PORT, () => {
  console.log(`\n🚀 TeamChat backend running at http://localhost:${env.PORT}\n`);
});
