"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, ArrowDown, Plus, GripVertical, Settings2, Trash2, Lock, Wand2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DestinationSearchModal } from "./DestinationSearchModal";
import { DestinationEntry } from "@/lib/ai-pipeline/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Internal sortable item component
function SortableDestinationItem({ 
  dest, 
  onRemove, 
  onUpdateDays 
}: { 
  dest: DestinationEntry; 
  onRemove: (name: string) => void;
  onUpdateDays: (name: string, days: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: dest.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Card className={`p-4 border shadow-sm transition-all ${isDragging ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"}`}>
        <div className="flex items-center gap-4">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground">
            <GripVertical className="h-5 w-5" />
          </div>
          
          <div className="bg-primary/10 p-3 rounded-xl">
            <MapPin className="h-6 w-6 text-primary" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-lg">{dest.name}</h3>
            {dest.country && <p className="text-sm text-muted-foreground">{dest.country}</p>}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-accent/50 rounded-lg p-1 border">
              <button 
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-background transition-colors"
                onClick={() => onUpdateDays(dest.name, Math.max(1, dest.numberOfDays - 1))}
              >
                -
              </button>
              <div className="w-16 text-center font-medium">
                {dest.numberOfDays} {dest.numberOfDays === 1 ? 'day' : 'days'}
              </div>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-background transition-colors"
                onClick={() => onUpdateDays(dest.name, Math.min(30, dest.numberOfDays + 1))}
              >
                +
              </button>
            </div>

            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onRemove(dest.name)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function DestinationBuilder({
  entries,
  onChange,
}: {
  entries: DestinationEntry[];
  onChange: (entries: DestinationEntry[]) => void;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const router = useRouter();

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      try {
        const res = await api.get("/user/me");
        return res.data.data;
      } catch (e) {
        return null;
      }
    }
  });

  const isPro = userProfile?.planType === "pro";

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = entries.findIndex((e) => e.name === active.id);
      const newIndex = entries.findIndex((e) => e.name === over.id);
      
      const newArray = arrayMove(entries, oldIndex, newIndex);
      // Update order field
      const updatedOrder = newArray.map((e, idx) => ({ ...e, order: idx + 1 }));
      onChange(updatedOrder);
    }
  };

  const handleAddDestination = (selectedDest: any) => {
    const newEntry: DestinationEntry = {
      name: selectedDest.name,
      country: selectedDest.country,
      state: selectedDest.state,
      lat: selectedDest.lat,
      lng: selectedDest.lng,
      numberOfDays: 3, // Default to 3 days
      order: entries.length + 1,
    };
    onChange([...entries, newEntry]);
  };

  const handleRemove = (name: string) => {
    const newArray = entries.filter(e => e.name !== name).map((e, idx) => ({ ...e, order: idx + 1 }));
    onChange(newArray);
  };

  const handleUpdateDays = (name: string, days: number) => {
    const newArray = entries.map(e => e.name === name ? { ...e, numberOfDays: days } : e);
    onChange(newArray);
  };

  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    try {
      const res = await api.post("/trips/optimize-route", {
        destinations: entries
      });
      if (res.data.success && res.data.optimizedOrder) {
        // Reapply proper order indices
        const properlyOrdered = res.data.optimizedOrder.map((e: any, idx: number) => ({ ...e, order: idx + 1 }));
        onChange(properlyOrdered);
        toast.success("Route optimized for shortest distance!");
      }
    } catch (e) {
      toast.error("Failed to optimize route.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const totalDays = entries.reduce((sum, e) => sum + e.numberOfDays, 0);

  return (
    <div className="space-y-4">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={entries.map(e => e.name)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 relative">
            {entries.map((dest, index) => (
              <div key={dest.name} className="relative">
                <SortableDestinationItem 
                  dest={dest} 
                  onRemove={handleRemove}
                  onUpdateDays={handleUpdateDays}
                />
                
                {/* Connective Line & Transfer Indicator */}
                {index < entries.length - 1 && (
                  <div className="absolute -bottom-5 left-10 w-0.5 h-7 bg-primary/20 z-0 flex items-center justify-center">
                    <ArrowDown className="h-3 w-3 text-primary/50 absolute" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {entries.length < 10 && (
        <Button 
          variant="outline" 
          className={`w-full py-6 border-dashed border-2 transition-all mt-4 ${!isPro && entries.length >= 1 ? "border-amber-500/50 text-amber-600 hover:bg-amber-50" : "border-primary/50 hover:border-primary hover:bg-primary/5"}`}
          onClick={() => {
            if (!isPro && entries.length >= 1) {
              router.push("/pricing");
            } else {
              setIsSearchOpen(true);
            }
          }}
        >
          {!isPro && entries.length >= 1 ? (
            <><Lock className="h-5 w-5 mr-2" /> Upgrade to Pro for Multi-Destination Trips</>
          ) : (
            <><Plus className="mr-2 h-5 w-5" /> Add Destination</>
          )}
        </Button>
      )}

      {entries.length > 0 && (
        <div className="mt-6 flex flex-col gap-4 bg-accent/30 p-4 rounded-xl border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium">Total Trip Duration</span>
            </div>
            <span className="text-xl font-bold">{totalDays} Days</span>
          </div>

          {entries.length >= 3 && (
            <Button 
              variant="default" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg border-0"
              onClick={handleOptimizeRoute}
              disabled={isOptimizing}
            >
              {isOptimizing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Optimizing Route...</>
              ) : (
                <><Wand2 className="h-4 w-4 mr-2" /> Optimize Route Order (AI)</>
              )}
            </Button>
          )}
        </div>
      )}

      <DestinationSearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleAddDestination}
        existingDestinations={entries.map(e => e.name)}
      />
    </div>
  );
}
