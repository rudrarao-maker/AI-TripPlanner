import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useSocket(tripId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      if (tripId) {
        socket.emit('join_trip', tripId);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('user_joined', ({ socketId }) => {
      setCollaborators((prev) => [...new Set([...prev, socketId])]);
    });

    socket.on('user_left', ({ socketId }) => {
      setCollaborators((prev) => prev.filter((id) => id !== socketId));
    });

    return () => {
      if (tripId) {
        socket.emit('leave_trip', tripId);
      }
      socket.disconnect();
    };
  }, [tripId]);

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

  return { isConnected, collaborators, emit, subscribe, socketId: socketRef.current?.id };
}
