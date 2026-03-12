// server.js

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import { config } from './config/index.js';

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ["*","http://localhost:5173"], // Adjust as needed for security
    methods: ['GET', 'POST','PATCH']
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  // Listen for join event to join user-specific room
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`Socket ${socket.id} joined room ${userId}`);
    }
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible in controllers
app.set('io', io);

const start = async () => {
  try {
    await connectDB();
    server.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
