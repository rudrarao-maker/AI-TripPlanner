import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import prisma from "./utils/prisma";

// In-memory state of active rooms and collaborators
const roomUsers: Record<string, Record<string, any>> = {};

interface AuthenticatedSocket extends Socket {
  data: {
    userId?: string;
    userName?: string;
    tripId?: string;
    user?: any;
  };
}

export function setupSocketIO(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ============================================================
  // Socket.IO Authentication Middleware
  // ============================================================
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      // The client should pass the Clerk userId via auth handshake
      const clerkUserId = socket.handshake.auth?.userId;

      if (!clerkUserId || typeof clerkUserId !== "string") {
        return next(new Error("Authentication required. No userId provided."));
      }

      // Verify user exists in our database
      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true, name: true, role: true, status: true },
      });

      if (!user) {
        return next(new Error("User not found in database."));
      }

      if (user.status === "restricted") {
        return next(new Error("Account is restricted."));
      }

      // Store authenticated user info on socket
      socket.data.userId = user.id;
      socket.data.userName = user.name;

      next();
    } catch (error) {
      console.error("[Socket] Auth middleware error:", error);
      next(new Error("Authentication failed."));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`[Socket] Authenticated user connected: ${socket.data.userName} (${socket.id})`);

    // ============================================================
    // Join Trip Room — Requires Trip Membership
    // ============================================================
    socket.on("join_trip", async (data: { tripId: string; user?: any }) => {
      const { tripId } = data;
      const userId = socket.data.userId;

      if (!userId || !tripId) {
        socket.emit("error", { message: "Missing userId or tripId" });
        return;
      }

      try {
        // Verify trip exists and user has access
        const trip = await prisma.trip.findUnique({
          where: { id: tripId },
          select: { userId: true },
        });

        if (!trip) {
          socket.emit("error", { message: "Trip not found" });
          return;
        }

        let memberRole = "owner";

        if (trip.userId !== userId) {
          // Not the owner — check membership
          const membership = await prisma.tripMember.findUnique({
            where: { tripId_userId: { tripId, userId } },
            select: { role: true },
          });

          if (!membership) {
            socket.emit("error", { message: "You do not have access to this trip" });
            return;
          }
          memberRole = membership.role;
        }

        // Authorized — join the room
        socket.join(tripId);
        socket.data.tripId = tripId;

        if (!roomUsers[tripId]) {
          roomUsers[tripId] = {};
        }

        const collaboratorData = {
          id: userId,
          name: socket.data.userName,
          socketId: socket.id,
          role: memberRole,
        };
        roomUsers[tripId][socket.id] = collaboratorData;

        console.log(`[Socket] ${socket.data.userName} joined trip ${tripId} as ${memberRole}`);

        // Send full state to the newly joined user
        socket.emit("room_state", Object.values(roomUsers[tripId]));

        // Notify others in the room
        socket.to(tripId).emit("user_joined", collaboratorData);
      } catch (error) {
        console.error("[Socket] join_trip error:", error);
        socket.emit("error", { message: "Failed to join trip room" });
      }
    });

    // Leave a specific trip room
    socket.on("leave_trip", (tripId: string) => {
      socket.leave(tripId);
      console.log(`[Socket] ${socket.data.userName} left trip ${tripId}`);

      if (roomUsers[tripId] && roomUsers[tripId][socket.id]) {
        delete roomUsers[tripId][socket.id];
      }

      socket.to(tripId).emit("user_left", { socketId: socket.id });
    });

    // Broadcast cursor movement for live collaboration
    socket.on(
      "cursor_moved",
      (data: { tripId: string; position: { x: number; y: number } }) => {
        socket.to(data.tripId).emit("cursor_moved", {
          socketId: socket.id,
          position: data.position,
          user: {
            id: socket.data.userId,
            name: socket.data.userName,
          },
        });
      },
    );

    // Broadcast itinerary updates — only editors/owners can emit
    socket.on(
      "itinerary_updated",
      (data: { tripId: string; updatedDays: any }) => {
        const userInRoom = roomUsers[data.tripId]?.[socket.id];
        if (!userInRoom || userInRoom.role === "viewer") {
          socket.emit("error", { message: "You do not have edit access" });
          return;
        }
        // Re-broadcast to everyone ELSE in the room
        socket.to(data.tripId).emit("itinerary_sync", data.updatedDays);
      },
    );

    socket.on("disconnect", () => {
      console.log(`[Socket] User disconnected: ${socket.data.userName} (${socket.id})`);
      const tripId = socket.data.tripId;
      if (tripId) {
        if (roomUsers[tripId] && roomUsers[tripId][socket.id]) {
          delete roomUsers[tripId][socket.id];
          socket.to(tripId).emit("user_left", { socketId: socket.id });
        }
      }
    });
  });

  return io;
}
