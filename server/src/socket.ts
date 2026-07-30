import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// In-memory state of active rooms and collaborators
const roomUsers: Record<string, Record<string, any>> = {};

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
    socket.on('join_trip', (data: { tripId: string, user: any }) => {
      const { tripId, user } = data;
      socket.join(tripId);
      
      // Store user info in socket object and room state
      socket.data.tripId = tripId;
      socket.data.user = user;

      if (!roomUsers[tripId]) {
        roomUsers[tripId] = {};
      }
      
      const collaboratorData = { ...user, socketId: socket.id };
      roomUsers[tripId][socket.id] = collaboratorData;

      console.log(`[Socket] User ${user.name} (${socket.id}) joined trip ${tripId}`);
      
      // Send full state to the newly joined user
      socket.emit('room_state', Object.values(roomUsers[tripId]));
      
      // Notify others in the room
      socket.to(tripId).emit('user_joined', collaboratorData);
    });

    // Leave a specific trip room
    socket.on('leave_trip', (tripId: string) => {
      socket.leave(tripId);
      console.log(`[Socket] User ${socket.id} left trip ${tripId}`);
      
      if (roomUsers[tripId] && roomUsers[tripId][socket.id]) {
        delete roomUsers[tripId][socket.id];
      }
      
      socket.to(tripId).emit('user_left', { socketId: socket.id });
    });

    // Broadcast cursor movement for live collaboration
    socket.on('cursor_moved', (data: { tripId: string; position: {x: number, y: number} }) => {
      socket.to(data.tripId).emit('cursor_moved', {
        socketId: socket.id,
        position: data.position,
        user: socket.data.user
      });
    });

    // Broadcast itinerary updates
    socket.on('itinerary_updated', (data: { tripId: string, updatedDays: any }) => {
      // Re-broadcast to everyone ELSE in the room
      socket.to(data.tripId).emit('itinerary_sync', data.updatedDays);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
      const tripId = socket.data.tripId;
      if (tripId) {
        if (roomUsers[tripId] && roomUsers[tripId][socket.id]) {
          delete roomUsers[tripId][socket.id];
          socket.to(tripId).emit('user_left', { socketId: socket.id });
        }
      }
    });
  });

  return io;
}
