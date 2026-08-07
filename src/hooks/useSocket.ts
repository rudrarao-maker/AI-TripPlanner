import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@clerk/nextjs";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  socketId: string;
}

// Generate consistent random color based on string
const getStringColor = (str: string) => {
  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#84cc16",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#d946ef",
    "#f43f5e",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function useSocket(tripId?: string) {
  const { user } = useUser();

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setIsConnected(true);
      if (tripId) {
        socket.emit("join_trip", {
          tripId,
          user: {
            id: user?.id || socket.id,
            name: user?.fullName || "Anonymous",
            avatar: user?.imageUrl,
            color: getStringColor(user?.id || (socket.id as string)),
          },
        });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Receive the full list of collaborators when joining
    socket.on("room_state", (users: Collaborator[]) => {
      setCollaborators(users);
    });

    socket.on("user_joined", (newUser: Collaborator) => {
      setCollaborators((prev) => {
        if (prev.some((c) => c.socketId === newUser.socketId)) return prev;
        return [...prev, newUser];
      });
    });

    socket.on("user_left", ({ socketId }) => {
      setCollaborators((prev) => prev.filter((c) => c.socketId !== socketId));
    });

    return () => {
      if (tripId) {
        socket.emit("leave_trip", tripId);
      }
      socket.disconnect();
    };
  }, [tripId, user?.id, user?.firstName, user?.fullName, user?.imageUrl]);

  const emit = (event: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  const subscribe = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  };

  return {
    isConnected,
    collaborators,
    emit,
    subscribe,
    socketId: socketRef.current?.id,
  };
}
