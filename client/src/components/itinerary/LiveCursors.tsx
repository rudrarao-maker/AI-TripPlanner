import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/hooks/useSocket";
import type { Collaborator } from "@/hooks/useSocket";
import { MousePointer2 } from "lucide-react";

interface CursorPosition {
  x: number;
  y: number;
}

interface RemoteCursor extends Collaborator {
  position: CursorPosition;
  lastUpdated: number;
}

export function LiveCursors({
  tripId,
  containerRef,
}: {
  tripId: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { isConnected, emit, subscribe, socketId } = useSocket(tripId);
  const [cursors, setCursors] = useState<Record<string, RemoteCursor>>({});
  const emitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isConnected) return;

    // Track mouse move on the container
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Throttle emits to save bandwidth (e.g. 50ms)
      if (emitTimeoutRef.current) return;

      emitTimeoutRef.current = setTimeout(() => {
        emit("cursor_moved", { tripId, position: { x, y } });
        emitTimeoutRef.current = null;
      }, 50);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      if (emitTimeoutRef.current) clearTimeout(emitTimeoutRef.current);
    };
  }, [isConnected, tripId, emit, containerRef]);

  useEffect(() => {
    // Listen for remote cursors
    const unsubscribe = subscribe(
      "cursor_moved",
      (data: {
        socketId: string;
        position: CursorPosition;
        user: Collaborator;
      }) => {
        // Ignore our own cursor echoes
        if (data.socketId === socketId) return;

        setCursors((prev) => ({
          ...prev,
          [data.socketId]: {
            ...data.user,
            position: data.position,
            lastUpdated: Date.now(),
          },
        }));
      },
    );

    // Cleanup stale cursors
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setCursors((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const [id, cursor] of Object.entries(next)) {
          // If no movement for 5 seconds, fade them out
          if (now - cursor.lastUpdated > 5000) {
            delete next[id];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(cleanupInterval);
    };
  }, [subscribe, socketId]);

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {Object.entries(cursors).map(([id, cursor]) => {
          if (!containerRef.current) return null;
          const rect = containerRef.current.getBoundingClientRect();

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                x: cursor.position.x * rect.width,
                y: cursor.position.y * rect.height,
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
                mass: 0.5,
              }}
              className="absolute top-0 left-0 flex items-start gap-1 drop-shadow-xl"
              style={{ zIndex: 100 }}
            >
              <MousePointer2
                className="w-5 h-5 -mt-[1px] -ml-[1px]"
                fill={cursor.color}
                color="white"
                strokeWidth={1.5}
              />
              <div
                className="px-2 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap shadow-sm mt-4"
                style={{ backgroundColor: cursor.color }}
              >
                {cursor.name}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
