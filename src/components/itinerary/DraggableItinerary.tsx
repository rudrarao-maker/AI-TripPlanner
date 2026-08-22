"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/hooks/useSocket";
import { optimizeRoute } from "@/lib/routeOptimizer";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Clock, MapPin, Wand2, Car, ThumbsUp } from "lucide-react";

// Placeholder for Sortable Activity Item
function SortableActivity({ activity, nextTravelTime, votes, onVote }: { activity: any; nextTravelTime?: number; votes: number; onVote: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={{ ...style, zIndex: 1, position: 'relative' }}>
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        boxShadow: activity.isAIUpdated ? "0 0 0 2px rgba(var(--primary), 0.5)" : "none",
        backgroundColor: activity.isAIUpdated ? "rgba(var(--primary), 0.05)" : undefined 
      }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
    >
      <Card
        className="p-4 mb-3 flex items-center gap-4 bg-background border-primary/10 shadow-sm transition-all hover:shadow-md"
      >
        <div {...attributes} {...listeners} className="cursor-grab hover:text-primary transition-colors">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold flex items-center gap-2">
              {activity.title || activity.name}
              {activity.isAIUpdated && (
                <motion.span 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full"
                >
                  ✨ Updated
                </motion.span>
              )}
            </h4>
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); onVote(activity.id); }} 
                className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-accent/50 transition-colors"
              >
                <ThumbsUp className={`h-3 w-3 ${votes > 0 ? "text-primary" : "text-muted-foreground"}`} />
                <span className={votes > 0 ? "text-primary font-bold" : "text-muted-foreground"}>{votes > 0 ? votes : ""}</span>
              </button>
              <span className="text-sm font-medium text-primary flex items-center gap-1">
                <Clock className="h-3 w-3" /> {activity.startTime || activity.time || "Flexible"}
              </span>
            </div>
          </div>
          {(activity.location || activity.address) && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {activity.location || activity.address}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
    {nextTravelTime !== undefined && nextTravelTime > 0 && (
      <div className="flex justify-center -my-3 z-10 relative">
        <div className="bg-background px-2 py-0.5 rounded-full text-[10px] text-muted-foreground flex items-center gap-1 border border-border shadow-sm">
          <Car className="w-3 h-3"/> {nextTravelTime} min drive
        </div>
      </div>
    )}
    </div>
  );
}

export function DraggableItinerary({ initialActivities, tripId }: { initialActivities: any[], tripId: string }) {
  const [activities, setActivities] = useState(initialActivities || []);
  const [travelTimes, setTravelTimes] = useState<number[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activityVotes, setActivityVotes] = useState<Record<string, number>>({});
  const { emit, subscribe, collaborators, socketId } = useSocket(tripId);
  const [activeEditor, setActiveEditor] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribe("activity_reordered", (newOrder: any[]) => {
      setActivities(newOrder);
      setActiveEditor(null); // Clear editor state when sync completes
    });

    const unsubDrag = subscribe("activity_dragging", ({ user }: { user: string }) => {
      setActiveEditor(user);
    });
    
    const unsubVote = subscribe("activity_voted", ({ activityId, newVotes }: { activityId: string, newVotes: number }) => {
      setActivityVotes(prev => ({ ...prev, [activityId]: newVotes }));
    });

    return () => {
      unsubscribe();
      unsubDrag();
      unsubVote();
    };
  }, [subscribe]);

  const handleVote = async (activityId: string) => {
    setActivityVotes(prev => {
      const current = prev[activityId] || 0;
      const newVotes = current + 1;
      emit("activity_voted", { activityId, newVotes });
      return { ...prev, [activityId]: newVotes };
    });
    
    // Also log this in the user's preference profile to learn their tastes over time
    try {
      const activity = activities.find(a => a.id === activityId);
      if (activity?.category) {
        await fetch('/api/user/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: activity.category, action: 'upvote' })
        });
      }
    } catch (e) {
      console.error("Failed to update user preference profile", e);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const { optimized, travelTimes: newTimes } = optimizeRoute(activities);
      setActivities([...optimized]);
      setTravelTimes(newTimes);
      emit("activity_reordered", optimized);
      setIsOptimizing(false);
    }, 600);
  };

  function handleDragStart() {
    emit("activity_dragging", { user: "Someone" }); // Would pass actual user name
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setActivities((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Broadcast the new order to all collaborators
        emit("activity_reordered", newOrder);
        setTravelTimes([]); // Reset travel times as order changed manually
        
        return newOrder;
      });
    } else {
       emit("activity_reordered", activities); // Just clear the dragging state
    }
  }

  if (activities.length === 0) {
    return <div className="text-center p-8 text-muted-foreground glass rounded-2xl">No activities planned for this day yet.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        {/* Presence Indicator */}
        {activeEditor ? (
          <div className="text-xs font-medium text-primary flex items-center gap-2 animate-pulse bg-primary/10 px-3 py-1.5 rounded-full w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {activeEditor} is moving an activity...
          </div>
        ) : <div />}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleOptimize} 
          disabled={isOptimizing} 
          className="ml-auto flex gap-1.5 text-primary border-primary/20 hover:bg-primary/10"
        >
          <Wand2 className={`w-4 h-4 ${isOptimizing ? "animate-spin" : ""}`} />
          {isOptimizing ? "Optimizing..." : "Optimize Route"}
        </Button>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={activities.map(a => a.id)}
          strategy={verticalListSortingStrategy}
        >
        <div className="space-y-1 [content-visibility:auto]">
          <AnimatePresence>
            {activities.map((activity, index) => (
              <SortableActivity 
                key={activity.id} 
                activity={activity} 
                nextTravelTime={travelTimes[index]}
                votes={activityVotes[activity.id] || 0}
                onVote={handleVote}
              />
            ))}
          </AnimatePresence>
        </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
