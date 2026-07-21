import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function setupSocketIO(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // Join a specific trip room
    socket.on('join_trip', (tripId: string) => {
      socket.join(tripId);
      console.log(`[Socket] User ${socket.id} joined trip ${tripId}`);
      // Notify others in the room
      socket.to(tripId).emit('user_joined', { socketId: socket.id });
    });

    // Leave a specific trip room
    socket.on('leave_trip', (tripId: string) => {
      socket.leave(tripId);
      console.log(`[Socket] User ${socket.id} left trip ${tripId}`);
      socket.to(tripId).emit('user_left', { socketId: socket.id });
    });

    // Broadcast cursor movement for live collaboration
    socket.on('cursor_move', (data: { tripId: string; userId: string; name: string; color: string; x: number; y: number }) => {
      socket.to(data.tripId).emit('cursor_update', {
        socketId: socket.id,
        ...data
      });
    });

    // Broadcast itinerary updates
    socket.on('itinerary_updated', (data: { tripId: string, updatedDays: any }) => {
      // Re-broadcast to everyone ELSE in the room
      socket.to(data.tripId).emit('itinerary_sync', data.updatedDays);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
      // The socket automatically leaves all rooms upon disconnect,
      // but we might want to broadcast a cleanup event if we track global state
    });
  });

  return io;
}
