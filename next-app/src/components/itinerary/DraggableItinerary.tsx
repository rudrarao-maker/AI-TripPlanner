"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GripVertical,
  Plus,
  Trash2,
  Clock,
  MapPin,
  IndianRupee,
  ChevronDown,
  ChevronRight,
  Edit3,
  Check,
  X,
  Star,
  Sparkles,
  RefreshCcw,
  Repeat,
  Gem,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveCursors } from "./LiveCursors";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  location?: string;
  cost?: number;
  duration?: string;
  color: string;
  rating?: number;
  isHiddenGem?: boolean;
  localTip?: string;
  imageUrl?: string;
  bestTimeToVisit?: string;
  category?: string;
}

interface DayData {
  id: string;
  dayNumber: number;
  title: string;
  theme?: string;
  date?: string;
  activities: Activity[];
}

// ===== Time slot colors =====
const SLOT_COLORS = [
  "bg-primary",
  "bg-accent",
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

// ===== Sortable Activity Item =====
function SortableActivity({
  activity,
  isLast,
  onDelete,
  onEdit,
  onHover,
  onSwap,
}: {
  activity: Activity;
  isLast: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Activity>) => void;
  onHover?: (id: string) => void;
  onSwap: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(activity.title);
  const [editDescription, setEditDescription] = useState(activity.description);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const handleSave = () => {
    onEdit(activity.id, { title: editTitle, description: editDescription });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(activity.title);
    setEditDescription(activity.description);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-3 relative group ${isDragging ? "opacity-40 scale-[0.98]" : ""}`}
      onMouseEnter={() => onHover?.(activity.id)}
      onMouseLeave={() => onHover?.("")}
    >
      {/* Vertical Timeline Connection */}
      <div className="flex flex-col items-center pt-4 w-4">
        <div
          className={`h-4 w-4 rounded-full ${activity.color || "bg-primary"} ring-4 ring-background shadow-md z-10 shrink-0`}
        />
        {!isLast && <div className="w-0.5 flex-1 bg-border/80 mt-1 mb-1" />}
      </div>

      {/* Activity Card */}
      <div className="pb-4 flex-1">
        <motion.div
          layout
          className={`flex flex-col sm:flex-row items-start gap-4 bg-card p-4 rounded-2xl border transition-all duration-200 overflow-hidden ${
            isDragging
              ? "border-primary shadow-xl ring-2 ring-primary/20"
              : "border-border/60 hover:border-primary/40 hover:shadow-lg"
          }`}
        >
          {/* Optional Image */}
          {activity.imageUrl && (
            <div className="w-full sm:w-32 h-32 sm:h-auto sm:self-stretch rounded-xl overflow-hidden shrink-0 bg-muted hidden sm:block">
              <img src={activity.imageUrl} alt={activity.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Top row: Time & Badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground tracking-wider uppercase bg-muted px-2.5 py-1 rounded-md">
                <Clock className="h-3 w-3" /> {activity.time}
              </span>
              
              {activity.isHiddenGem && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  <Gem className="h-3 w-3" /> Hidden Gem
                </span>
              )}
              
              {activity.rating && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 px-2.5 py-1 rounded-md bg-amber-500/5">
                  <Star className="h-3 w-3 fill-amber-500" /> {activity.rating}
                </span>
              )}
            </div>

            {isEditing ? (
              <div className="mt-2 space-y-3">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="font-semibold text-lg"
                  autoFocus
                />
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="text-sm"
                  placeholder="Description"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} className="rounded-full">
                    <Check className="h-4 w-4 mr-1.5" /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancel}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h4 className="font-bold text-lg text-foreground leading-tight">
                  {activity.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                  {activity.description}
                </p>

                {activity.localTip && (
                  <div className="mt-3 p-2.5 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-primary/80 italic font-medium leading-relaxed">
                      {activity.localTip}
                    </p>
                  </div>
                )}

                {/* Meta info */}
                <div className="flex items-center gap-x-4 gap-y-2 mt-3 flex-wrap">
                  {activity.location && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary/70" /> {activity.location}
                    </span>
                  )}
                  {activity.duration && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary/70" /> {activity.duration}
                    </span>
                  )}
                  {activity.cost !== undefined && activity.cost > 0 && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <IndianRupee className="h-3.5 w-3.5 text-primary/70" />{" "}
                      {activity.cost.toLocaleString()}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex sm:flex-col gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              {...attributes}
              {...listeners}
              className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <button
              onClick={() => onSwap(activity.id)}
              className="p-2 text-muted-foreground hover:text-blue-500 rounded-lg hover:bg-blue-500/10 transition-colors"
              title="Swap for alternative"
            >
              <Repeat className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
              title="Edit"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(activity.id)}
              className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
              title="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ===== Drag Overlay =====
function DragOverlayItem({ activity }: { activity: Activity }) {
  return (
    <div className="bg-card p-4 rounded-2xl border-2 border-primary shadow-2xl max-w-[400px]">
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary tracking-wider uppercase">
        <Clock className="h-3 w-3" /> {activity.time}
      </span>
      <h4 className="font-bold text-lg mt-1 text-foreground">
        {activity.title}
      </h4>
      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
        {activity.description}
      </p>
    </div>
  );
}

// ===== Single Day Component =====
function DayCard({
  day,
  onReorder,
  onDeleteActivity,
  onEditActivity,
  onAddActivity,
  onRegenerateDay,
  onSwapActivity,
  onHoverItem,
}: {
  day: DayData;
  onReorder: (dayId: string, oldIndex: number, newIndex: number) => void;
  onDeleteActivity: (dayId: string, activityId: string) => void;
  onEditActivity: (
    dayId: string,
    activityId: string,
    updates: Partial<Activity>,
  ) => void;
  onAddActivity: (dayId: string) => void;
  onRegenerateDay: (dayId: string) => void;
  onSwapActivity: (dayId: string, activityId: string) => void;
  onHoverItem?: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = day.activities.findIndex((a) => a.id === active.id);
    const newIndex = day.activities.findIndex((a) => a.id === over.id);
    onReorder(day.id, oldIndex, newIndex);
  };

  const activeActivity = activeId
    ? day.activities.find((a) => a.id === activeId)
    : null;

  const totalCost = day.activities.reduce((sum, a) => sum + (a.cost || 0), 0);

  return (
    <Card className="glass-card border-border/50 hover:border-primary/30 transition-colors overflow-visible relative mt-8 mb-4">
      {/* Day Theme Badge */}
      {day.theme && (
        <div className="absolute -top-4 left-6 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5 z-10">
          <Sparkles className="h-3.5 w-3.5" />
          {day.theme}
        </div>
      )}

      <CardHeader
        className="bg-muted/30 border-b pb-4 pt-6 flex flex-row items-center justify-between cursor-pointer select-none rounded-t-xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent text-white font-extrabold text-xl shadow-inner">
            D{day.dayNumber}
          </div>
          <div>
            <CardTitle className="text-xl font-bold">{day.title}</CardTitle>
            {day.date && (
              <p className="text-sm font-medium text-muted-foreground mt-0.5">
                {new Date(day.date).toLocaleDateString("en-IN", {
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {day.activities.length} acts
            </span>
            {totalCost > 0 && (
              <span className="text-xs font-bold text-muted-foreground bg-background px-2 py-1 rounded-md border flex items-center gap-0.5">
                <IndianRupee className="h-3 w-3" /> {totalCost.toLocaleString()}
              </span>
            )}
          </div>
          
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary z-20"
              title="Regenerate this day"
              onClick={(e) => {
                e.stopPropagation();
                onRegenerateDay(day.id);
              }}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <div className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-muted rounded-md transition-colors">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-8 pb-6 pl-4 pr-5 sm:pl-6 sm:pr-8">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={day.activities}
                  strategy={verticalListSortingStrategy}
                >
                  {day.activities.map((activity, index) => (
                    <SortableActivity
                      key={activity.id}
                      activity={activity}
                      isLast={index === day.activities.length - 1}
                      onDelete={(id) => onDeleteActivity(day.id, id)}
                      onEdit={(id, updates) =>
                        onEditActivity(day.id, id, updates)
                      }
                      onSwap={(id) => onSwapActivity(day.id, id)}
                      onHover={onHoverItem}
                    />
                  ))}
                </SortableContext>

                <DragOverlay>
                  {activeActivity ? (
                    <DragOverlayItem activity={activeActivity} />
                  ) : null}
                </DragOverlay>
              </DndContext>

              {/* Add Activity Button */}
              <button
                onClick={() => onAddActivity(day.id)}
                className="w-full mt-6 py-4 border-2 border-dashed border-border/60 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group"
              >
                <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Add Activity Manually
              </button>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ===== Main DraggableItinerary =====
interface DraggableItineraryProps {
  onHoverItem?: (id: string) => void;
  itineraryDays?: any[];
  emitSocket?: (event: string, data: any) => void;
  subscribeSocket?: (
    event: string,
    callback: (data: any) => void,
  ) => () => void;
  socketId?: string;
  tripId?: string;
}

export function DraggableItinerary({
  onHoverItem,
  itineraryDays,
  emitSocket,
  subscribeSocket,
  socketId,
  tripId,
}: DraggableItineraryProps) {
  const buildDays = useCallback((): DayData[] => {
    if (itineraryDays && itineraryDays.length > 0) {
      return itineraryDays.map((day: any, idx: number) => ({
        id: day.id || `day-${idx + 1}`,
        dayNumber: day.dayNumber || idx + 1,
        title: day.title || `Day ${idx + 1}`,
        theme: day.theme,
        date: day.date,
        activities:
          day.activities && Array.isArray(day.activities)
            ? day.activities.map((act: any, aIdx: number) => ({
                id: act.id || `d${idx + 1}-a${aIdx}`,
                title: act.name || act.title || "Activity",
                description: act.description || "",
                time: act.time || "TBD",
                location: act.location,
                cost: act.estimatedCost || act.cost || 0,
                duration: act.duration
                  ? `${Math.round(act.duration / 60)} hours`
                  : act.duration ? `${act.duration} mins` : "2 hours",
                color: SLOT_COLORS[aIdx % SLOT_COLORS.length],
                rating: act.rating,
                isHiddenGem: act.isHiddenGem,
                localTip: act.localTip,
                imageUrl: act.imageUrl || act.photoUrl,
                bestTimeToVisit: act.bestTimeToVisit,
              }))
            : ([
                day.morningActivity && {
                  id: `d${idx + 1}-morning`,
                  title: day.morningActivity.title || "Morning Activity",
                  description: day.morningActivity.description || "",
                  time: "Morning (10:00 AM)",
                  location: day.morningActivity.location,
                  cost: day.morningActivity.cost,
                  duration: day.morningActivity.duration || "3 hours",
                  color: SLOT_COLORS[0],
                },
                day.afternoonActivity && {
                  id: `d${idx + 1}-afternoon`,
                  title: day.afternoonActivity.title || "Afternoon Activity",
                  description: day.afternoonActivity.description || "",
                  time: "Afternoon (2:00 PM)",
                  location: day.afternoonActivity.location,
                  cost: day.afternoonActivity.cost,
                  duration: day.afternoonActivity.duration || "2 hours",
                  color: SLOT_COLORS[1],
                },
                day.eveningActivity && {
                  id: `d${idx + 1}-evening`,
                  title: day.eveningActivity.title || "Evening Activity",
                  description: day.eveningActivity.description || "",
                  time: "Evening (6:00 PM)",
                  location: day.eveningActivity.location,
                  cost: day.eveningActivity.cost,
                  duration: day.eveningActivity.duration || "2.5 hours",
                  color: SLOT_COLORS[2],
                },
              ].filter(Boolean) as Activity[]),
      }));
    }

    return [];
  }, [itineraryDays]);

  const [days, setDays] = useState<DayData[]>(buildDays);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (itineraryDays) setDays(buildDays());
  }, [itineraryDays, buildDays]);

  useEffect(() => {
    if (subscribeSocket) {
      const unsubSync = subscribeSocket("itinerary_sync", (updatedDays) => {
        setDays(updatedDays);
      });
      return () => {
        unsubSync();
      };
    }
  }, [subscribeSocket]);

  const saveDaysToDb = async (newDays: DayData[]) => {
    if (!tripId) return;
    try {
      const activitiesToSave = newDays.flatMap(d => 
        d.activities.map((a, i) => ({
          id: a.id.startsWith("new-") || a.id.startsWith("d") ? undefined : a.id,
          tripDayId: d.id,
          name: a.title,
          description: a.description,
          time: a.time,
          location: a.location,
          estimatedCost: a.cost,
          orderIndex: i
        }))
      );
      await api.put(`/trips/${tripId}`, { activities: activitiesToSave });
    } catch (err) {
      console.error("Failed to save itinerary changes to DB", err);
    }
  };

  const handleReorder = useCallback(
    (dayId: string, oldIndex: number, newIndex: number) => {
      setDays((prev) => {
        const next = prev.map((day) =>
          day.id === dayId
            ? {
                ...day,
                activities: arrayMove(day.activities, oldIndex, newIndex),
              }
            : day,
        );
        if (emitSocket) emitSocket("itinerary_sync", next);
        saveDaysToDb(next);
        return next;
      });
    },
    [emitSocket, tripId],
  );

  const handleDeleteActivity = useCallback(
    (dayId: string, activityId: string) => {
      setDays((prev) => {
        const next = prev.map((day) =>
          day.id === dayId
            ? {
                ...day,
                activities: day.activities.filter((a) => a.id !== activityId),
              }
            : day,
        );
        if (emitSocket) emitSocket("itinerary_sync", next);
        saveDaysToDb(next);
        return next;
      });
    },
    [emitSocket, tripId],
  );

  const handleEditActivity = useCallback(
    (dayId: string, activityId: string, updates: Partial<Activity>) => {
      setDays((prev) => {
        const next = prev.map((day) =>
          day.id === dayId
            ? {
                ...day,
                activities: day.activities.map((a) =>
                  a.id === activityId ? { ...a, ...updates } : a,
                ),
              }
            : day,
        );
        if (emitSocket) emitSocket("itinerary_sync", next);
        saveDaysToDb(next);
        return next;
      });
    },
    [emitSocket, tripId],
  );

  const handleAddActivity = useCallback(
    (dayId: string) => {
      const newActivity: Activity = {
        id: `new-${Date.now()}`,
        title: "New Activity",
        description: "Click the edit button to customize this activity.",
        time: "Flexible",
        color: SLOT_COLORS[Math.floor(Math.random() * SLOT_COLORS.length)],
      };
      setDays((prev) => {
        const next = prev.map((day) =>
          day.id === dayId
            ? { ...day, activities: [...day.activities, newActivity] }
            : day,
        );
        if (emitSocket) emitSocket("itinerary_sync", next);
        saveDaysToDb(next);
        return next;
      });
    },
    [emitSocket, tripId],
  );

  const handleRegenerateDay = async (dayId: string) => {
    if (!tripId) {
      toast.error("Save the trip first to use AI regeneration");
      return;
    }
    
    toast.loading("AI is rethinking this day...", { id: `regen-${dayId}` });
    try {
      const res = await api.post(`/trips/${tripId}/days/${dayId}/regenerate`, {
        preferences: {} 
      });
      
      const updatedDayData = res.data.data;
      
      setDays((prev) => {
        const next = prev.map((day) => {
          if (day.id === dayId) {
            return {
              ...day,
              theme: updatedDayData.theme,
              activities: updatedDayData.activities.map((act: any, aIdx: number) => ({
                id: act.id,
                title: act.name,
                description: act.description || "",
                time: act.time || "TBD",
                location: act.location,
                cost: act.estimatedCost || 0,
                duration: act.duration ? `${act.duration} mins` : "2 hours",
                color: SLOT_COLORS[aIdx % SLOT_COLORS.length],
                rating: act.rating,
                isHiddenGem: act.isHiddenGem,
                localTip: act.localTip,
                imageUrl: act.imageUrl,
              }))
            };
          }
          return day;
        });
        if (emitSocket) emitSocket("itinerary_sync", next);
        return next;
      });
      
      toast.success("Day regenerated!", { id: `regen-${dayId}` });
    } catch (error) {
      console.error(error);
      toast.error("Failed to regenerate day", { id: `regen-${dayId}` });
    }
  };
  
  const handleSwapActivity = async (dayId: string, activityId: string) => {
    if (!tripId) {
      toast.error("Save the trip first to swap activities");
      return;
    }
    
    if (activityId.startsWith("new-")) {
      toast.error("Save this new activity first");
      return;
    }
    
    toast.loading("Finding alternatives...", { id: `swap-${activityId}` });
    try {
      const res = await api.get(`/trips/${tripId}/activities/${activityId}/alternatives`);
      const alts = res.data.data.alternatives;
      
      if (alts && alts.length > 0) {
        // Just take the first alternative for simplicity, in a real app we'd show a modal
        const alt = alts[0];
        
        handleEditActivity(dayId, activityId, {
          title: alt.name,
          description: alt.localTip || "A great alternative spot.",
          rating: alt.rating,
          isHiddenGem: alt.isHiddenGem,
          localTip: alt.localTip,
          category: alt.category,
        });
        
        toast.success(`Swapped to ${alt.name}!`, { id: `swap-${activityId}` });
      } else {
        toast.error("No alternatives found", { id: `swap-${activityId}` });
      }
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to find alternatives", { id: `swap-${activityId}` });
    }
  };

  return (
    <div className="space-y-8 relative pb-10" ref={containerRef}>
      {tripId && <LiveCursors tripId={tripId} containerRef={containerRef} />}
      {days.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
          No itinerary days found.
        </div>
      ) : (
        days.map((day) => (
          <DayCard
            key={day.id}
            day={day}
            onReorder={handleReorder}
            onDeleteActivity={handleDeleteActivity}
            onEditActivity={handleEditActivity}
            onAddActivity={handleAddActivity}
            onRegenerateDay={handleRegenerateDay}
            onSwapActivity={handleSwapActivity}
            onHoverItem={onHoverItem}
          />
        ))
      )}
    </div>
  );
}
