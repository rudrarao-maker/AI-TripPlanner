import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';

// ─── CORS Configuration ──────────────────────────────────────────
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

const app = express();
app.use(cors({ origin: ALLOWED_ORIGINS }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Connection limits for DDoS protection
  maxHttpBufferSize: 1e6, // 1MB max message size
  pingTimeout: 20000,
  pingInterval: 25000,
});

// ─── Redis Adapter (horizontal scaling) ───────────────────────────
if (process.env.REDIS_URL) {
  const pubClient = new Redis(process.env.REDIS_URL);
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
  
  pubClient.on('error', (err) => console.error('Redis PubClient Error:', err));
  subClient.on('error', (err) => console.error('Redis SubClient Error:', err));
  
  console.log('Socket.io configured with Redis Adapter for multi-instance scaling.');
} else {
  console.log('Running Socket.io without Redis (Single instance mode). Set REDIS_URL to scale.');
}

// ─── Input Validation Helpers ─────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(str: any): boolean {
  return typeof str === 'string' && UUID_REGEX.test(str);
}

interface User {
  id?: string;
  name: string;
  avatar?: string;
  email?: string;
}

function sanitizeUser(user: any): User {
  if (!user || typeof user !== 'object') return { name: 'Anonymous' };
  return {
    id: typeof user.id === 'string' ? user.id.slice(0, 128) : undefined,
    name: typeof user.name === 'string' ? user.name.slice(0, 100) : 'Anonymous',
    avatar: typeof user.avatar === 'string' ? user.avatar.slice(0, 500) : undefined,
    email: typeof user.email === 'string' ? user.email.slice(0, 320) : undefined,
  };
}

// ─── Authentication Middleware ────────────────────────────────────
// Custom interface to extend socket
interface AuthenticatedSocket extends Socket {
  userId?: string;
}

io.use((socket: AuthenticatedSocket, next) => {
  const token = socket.handshake.auth?.token;

  // In development, allow connections without a token if SOCKET_AUTH_REQUIRED is not set
  if (process.env.NODE_ENV !== 'production' && !process.env.SOCKET_AUTH_REQUIRED) {
    socket.userId = socket.handshake.auth?.userId || 'dev-user';
    return next();
  }

  if (!token) {
    return next(new Error('Authentication required. Provide auth.token on connection.'));
  }

  const userId = socket.handshake.auth?.userId;
  if (!userId || typeof userId !== 'string') {
    return next(new Error('Invalid authentication: userId required.'));
  }

  socket.userId = userId;
  next();
});

// ─── Rate Limiting per Socket ─────────────────────────────────────
const socketRateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 1000; // 1 second
const RATE_LIMIT_MAX = 30; // max events per second

function isRateLimited(socketId: string): boolean {
  const now = Date.now();
  const entry = socketRateLimits.get(socketId);

  if (!entry || now > entry.resetAt) {
    socketRateLimits.set(socketId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of socketRateLimits) {
    if (now > entry.resetAt) socketRateLimits.delete(id);
  }
}, 30000);

// ─── Room State ───────────────────────────────────────────────────
interface RoomUser extends User {
  socketId: string;
}

const rooms = new Map<string, Map<string, RoomUser>>();

io.on('connection', (socket: AuthenticatedSocket) => {
  console.log('User connected:', socket.id, '| userId:', socket.userId);

  socket.on('join_trip', (data: any) => {
    if (isRateLimited(socket.id)) return;

    if (!data || typeof data !== 'object') return;
    const { tripId, user } = data;
    if (!isValidUUID(tripId)) {
      socket.emit('error', { message: 'Invalid trip ID format.' });
      return;
    }

    const sanitizedUser = sanitizeUser(user);
    socket.join(tripId);
    
    if (!rooms.has(tripId)) {
      rooms.set(tripId, new Map());
    }
    const userData: RoomUser = { ...sanitizedUser, socketId: socket.id };
    rooms.get(tripId)!.set(socket.id, userData);

    const roomUsers = Array.from(rooms.get(tripId)!.values());
    socket.emit('room_state', roomUsers);

    socket.to(tripId).emit('user_joined', userData);
    console.log(`User ${sanitizedUser.name} joined trip ${tripId}`);
  });

  socket.on('leave_trip', (tripId: any) => {
    if (isRateLimited(socket.id)) return;
    if (!isValidUUID(tripId)) return;

    socket.leave(tripId);
    if (rooms.has(tripId)) {
      rooms.get(tripId)!.delete(socket.id);
      if (rooms.get(tripId)!.size === 0) {
        rooms.delete(tripId);
      }
    }
    socket.to(tripId).emit('user_left', { socketId: socket.id });
    console.log(`User ${socket.id} left trip ${tripId}`);
  });

  socket.on('cursor_move', (data: any) => {
    if (isRateLimited(socket.id)) return;
    if (!data || typeof data !== 'object') return;

    const { tripId, x, y, user } = data;
    if (!isValidUUID(tripId)) return;
    if (typeof x !== 'number' || typeof y !== 'number') return;

    socket.to(tripId).emit('cursor_moved', {
      socketId: socket.id,
      x,
      y,
      user: sanitizeUser(user),
    });
  });

  socket.on('activity_voted', (data: any) => {
    if (isRateLimited(socket.id)) return;
    const tripId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (tripId) {
      socket.to(tripId).emit('activity_voted', data);
    }
  });

  socket.on('activity_reordered', (data: any) => {
    if (isRateLimited(socket.id)) return;
    const tripId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (tripId) {
      socket.to(tripId).emit('activity_reordered', data);
    }
  });

  socket.on('activity_dragging', (data: any) => {
    if (isRateLimited(socket.id)) return;
    const tripId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (tripId) {
      socket.to(tripId).emit('activity_dragging', data);
    }
  });

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        if (rooms.has(room)) {
          rooms.get(room)!.delete(socket.id);
          if (rooms.get(room)!.size === 0) {
            rooms.delete(room);
          }
        }
        socket.to(room).emit('user_left', { socketId: socket.id });
      }
    }
  });

  socket.on('disconnect', () => {
    socketRateLimits.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

// ─── Health Check ─────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connectedClients: io.engine.clientsCount,
    activeRooms: rooms.size,
  });
});

const PORT = process.env.SOCKET_PORT || 5000;

server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
  console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});
