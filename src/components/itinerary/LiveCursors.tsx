"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Collaborator } from "@/hooks/useSocket";

interface CursorPosition {
  x: number;
  y: number;
}

interface LiveCursorsProps {
  collaborators: Collaborator[];
  subscribe: (event: string, cb: (data: any) => void) => () => void;
  emit: (event: string, data: any) => void;
  socketId?: string;
}

export function LiveCursors({ collaborators, subscribe, emit, socketId }: LiveCursorsProps) {
  const [cursors, setCursors] = useState<Record<string, CursorPosition>>({});

  useEffect(() => {
    // Listen for incoming cursor movements
    const unsubscribe = subscribe("cursor_move", (data: { socketId: string; x: number; y: number }) => {
      if (data.socketId === socketId) return; // Don't render our own cursor
      setCursors((prev) => ({
        ...prev,
        [data.socketId]: { x: data.x, y: data.y },
      }));
    });

    return () => unsubscribe();
  }, [subscribe, socketId]);

  useEffect(() => {
    // Emit our own cursor movements
    const handleMouseMove = (e: MouseEvent) => {
      if (!socketId) return;
      
      // Throttle slightly if needed, but for now emit directly
      emit("cursor_move", {
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [emit, socketId]);

  // Clean up disconnected users' cursors
  useEffect(() => {
    const activeIds = new Set(collaborators.map((c) => c.socketId));
    setCursors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        if (!activeIds.has(id)) {
          delete next[id];
        }
      });
      return next;
    });
  }, [collaborators]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <AnimatePresence>
        {Object.entries(cursors).map(([id, pos]) => {
          const user = collaborators.find((c) => c.socketId === id);
          if (!user) return null;

          return (
            <motion.div
              key={id}
              className="absolute left-0 top-0 flex flex-col items-center pointer-events-none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: pos.x,
                y: pos.y,
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 0.5,
              }}
            >
              {/* Pointer Icon SVG */}
              <svg
                width="24"
                height="36"
                viewBox="0 0 24 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
                style={{ fill: user.color }}
              >
                <path
                  d="M5.65376 2.15376C5.40117 1.83803 4.90806 1.87413 4.70823 2.22295L0.279328 9.94827C0.0384262 10.3685 0.38531 10.8715 0.874317 10.8105L4.44445 10.3644C4.69372 10.3333 4.9452 10.4571 5.07471 10.6749L7.54561 14.8291C7.81033 15.2743 8.44199 15.3537 8.81079 14.9882L13.1118 10.7259C13.4339 10.4068 13.3859 9.87858 13.0135 9.64573L9.62002 7.52554C9.3905 7.38214 9.3134 7.07823 9.44426 6.83737L11.5307 2.99728C11.7588 2.57763 11.411 2.06214 10.9238 2.10307L5.65376 2.15376Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Name Tag */}
              <div
                className="mt-1 px-3 py-1 text-xs font-bold text-white rounded-full shadow-md whitespace-nowrap"
                style={{ backgroundColor: user.color }}
              >
                {user.name}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
