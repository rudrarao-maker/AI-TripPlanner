const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Track users in rooms
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_trip', (data) => {
    const { tripId, user } = data;
    socket.join(tripId);
    
    // Add user to room state
    if (!rooms.has(tripId)) {
      rooms.set(tripId, new Map());
    }
    const userData = { ...user, socketId: socket.id };
    rooms.get(tripId).set(socket.id, userData);

    // Send the current room state to the joining user
    const roomUsers = Array.from(rooms.get(tripId).values());
    socket.emit('room_state', roomUsers);

    socket.to(tripId).emit('user_joined', userData);
    console.log(`User ${user?.name || socket.id} joined trip ${tripId}`);
  });

  socket.on('leave_trip', (tripId) => {
    socket.leave(tripId);
    if (rooms.has(tripId)) {
      rooms.get(tripId).delete(socket.id);
      if (rooms.get(tripId).size === 0) {
        rooms.delete(tripId);
      }
    }
    socket.to(tripId).emit('user_left', { socketId: socket.id });
    console.log(`User ${socket.id} left trip ${tripId}`);
  });

  socket.on('cursor_move', (data) => {
    const { tripId, x, y, user } = data;
    socket.to(tripId).emit('cursor_moved', {
      socketId: socket.id,
      x,
      y,
      user
    });
  });

  socket.on('activity_voted', (data) => {
    // broadcast to everyone else in the room
    const tripId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (tripId) {
      socket.to(tripId).emit('activity_voted', data);
    }
  });

  socket.on('activity_reordered', (data) => {
    const tripId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (tripId) {
      socket.to(tripId).emit('activity_reordered', data);
    }
  });

  socket.on('activity_dragging', (data) => {
    const tripId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (tripId) {
      socket.to(tripId).emit('activity_dragging', data);
    }
  });

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        if (rooms.has(room)) {
          rooms.get(room).delete(socket.id);
          if (rooms.get(room).size === 0) {
            rooms.delete(room);
          }
        }
        socket.to(room).emit('user_left', { socketId: socket.id });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.SOCKET_PORT || 5000;

server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
