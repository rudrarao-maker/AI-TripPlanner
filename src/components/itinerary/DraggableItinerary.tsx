"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
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
import { GripVertical, Clock, MapPin } from "lucide-react";

// Placeholder for Sortable Activity Item
function SortableActivity({ activity }: { activity: any }) {
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
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 mb-3 flex items-center gap-4 bg-background border-primary/10 shadow-sm"
    >
      <div {...attributes} {...listeners} className="cursor-grab hover:text-primary transition-colors">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold">{activity.name}</h4>
          <span className="text-sm font-medium text-primary flex items-center gap-1">
            <Clock className="h-3 w-3" /> {activity.time || "Flexible"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {activity.location}
        </p>
      </div>
    </Card>
  );
}

export function DraggableItinerary({ initialActivities, tripId }: { initialActivities: any[], tripId: string }) {
  const [activities, setActivities] = useState(initialActivities || []);
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

    return () => {
      unsubscribe();
      unsubDrag();
    };
  }, [subscribe]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      {/* Presence Indicator */}
      {activeEditor && (
        <div className="text-xs font-medium text-primary flex items-center gap-2 animate-pulse bg-primary/10 px-3 py-1.5 rounded-full w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          {activeEditor} is moving an activity...
        </div>
      )}

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
        <div className="space-y-1">
          {activities.map((activity) => (
            <SortableActivity key={activity.id} activity={activity} />
          ))}
        </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
