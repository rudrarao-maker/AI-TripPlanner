import { useState, useCallback } from 'react';
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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Plus, Trash2, Clock, MapPin, IndianRupee, ChevronDown, ChevronRight, Edit3, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  location?: string;
  cost?: number;
  duration?: string;
  color: string;
}

interface DayData {
  id: string;
  dayNumber: number;
  title: string;
  date?: string;
  activities: Activity[];
}

// ===== Time slot colors =====
const SLOT_COLORS = ['bg-primary', 'bg-accent', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];

// ===== Sortable Activity Item =====
function SortableActivity({
  activity,
  isLast,
  onDelete,
  onEdit,
  onHover,
}: {
  activity: Activity;
  isLast: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Activity>) => void;
  onHover?: (id: string) => void;
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
      className={`flex gap-3 relative group ${isDragging ? 'opacity-40 scale-[0.98]' : ''}`}
      onMouseEnter={() => onHover?.(activity.id)}
      onMouseLeave={() => onHover?.('')}
    >
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center pt-4">
        <div className={`h-3 w-3 rounded-full ${activity.color} ring-4 ring-background shadow-sm z-10 shrink-0`} />
        {!isLast && <div className="w-px flex-1 bg-border/60 mt-1" />}
      </div>

      {/* Activity Card */}
      <div className="pb-4 flex-1">
        <motion.div
          layout
          className={`flex items-start gap-2 bg-card p-3.5 rounded-xl border transition-all duration-200 ${
            isDragging ? 'border-primary shadow-xl' : 'border-border/50 hover:border-primary/30 hover:shadow-md'
          }`}
        >
          <div className="flex-1 min-w-0">
            {/* Time badge */}
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground tracking-wider uppercase bg-muted px-2 py-0.5 rounded-md">
              <Clock className="h-2.5 w-2.5" /> {activity.time}
            </span>

            {isEditing ? (
              <div className="mt-2 space-y-2">
                <Input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="h-8 text-sm font-semibold"
                  autoFocus
                />
                <Input
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="Description"
                />
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleSave}>
                    <Check className="h-3 w-3 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={handleCancel}>
                    <X className="h-3 w-3 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h4 className="font-semibold text-base mt-1.5 text-foreground leading-tight">{activity.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{activity.description}</p>

                {/* Meta info */}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {activity.location && (
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {activity.location}
                    </span>
                  )}
                  {activity.duration && (
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {activity.duration}
                    </span>
                  )}
                  {activity.cost !== undefined && activity.cost > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <IndianRupee className="h-3 w-3" /> {activity.cost.toLocaleString()}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              {...attributes}
              {...listeners}
              className="p-1.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-primary/10 transition-colors"
              title="Edit"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(activity.id)}
              className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors"
              title="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ===== Drag Overlay (what you see while dragging) =====
function DragOverlayItem({ activity }: { activity: Activity }) {
  return (
    <div className="bg-card p-3.5 rounded-xl border-2 border-primary shadow-2xl max-w-[400px]">
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary tracking-wider uppercase">
        <Clock className="h-2.5 w-2.5" /> {activity.time}
      </span>
      <h4 className="font-semibold text-base mt-1 text-foreground">{activity.title}</h4>
      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{activity.description}</p>
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
  onHoverItem,
}: {
  day: DayData;
  onReorder: (dayId: string, oldIndex: number, newIndex: number) => void;
  onDeleteActivity: (dayId: string, activityId: string) => void;
  onEditActivity: (dayId: string, activityId: string, updates: Partial<Activity>) => void;
  onAddActivity: (dayId: string) => void;
  onHoverItem?: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = day.activities.findIndex(a => a.id === active.id);
    const newIndex = day.activities.findIndex(a => a.id === over.id);
    onReorder(day.id, oldIndex, newIndex);
  };

  const activeActivity = activeId ? day.activities.find(a => a.id === activeId) : null;

  // Calculate total cost for the day
  const totalCost = day.activities.reduce((sum, a) => sum + (a.cost || 0), 0);

  return (
    <Card className="glass-card border-border/50 hover:border-primary/20 transition-colors overflow-hidden">
      <CardHeader
        className="bg-muted/30 border-b pb-4 flex flex-row items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
            {day.dayNumber}
          </div>
          <div>
            <CardTitle className="text-base">{day.title}</CardTitle>
            {day.date && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border">
              {day.activities.length} activities
            </span>
            {totalCost > 0 && (
              <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border flex items-center gap-0.5">
                <IndianRupee className="h-3 w-3" /> {totalCost.toLocaleString()}
              </span>
            )}
          </div>
          {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-6 pb-4 pl-4 pr-5">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={day.activities} strategy={verticalListSortingStrategy}>
                  {day.activities.map((activity, index) => (
                    <SortableActivity
                      key={activity.id}
                      activity={activity}
                      isLast={index === day.activities.length - 1}
                      onDelete={(id) => onDeleteActivity(day.id, id)}
                      onEdit={(id, updates) => onEditActivity(day.id, id, updates)}
                      onHover={onHoverItem}
                    />
                  ))}
                </SortableContext>

                <DragOverlay>
                  {activeActivity ? <DragOverlayItem activity={activeActivity} /> : null}
                </DragOverlay>
              </DndContext>

              {/* Add Activity Button */}
              <button
                onClick={() => onAddActivity(day.id)}
                className="w-full mt-2 py-3 border-2 border-dashed border-border/60 rounded-xl text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors flex items-center justify-center gap-2 group"
              >
                <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Add Activity
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
  subscribeSocket?: (event: string, callback: (data: any) => void) => () => void;
  socketId?: string;
}

export function DraggableItinerary({ onHoverItem, itineraryDays, emitSocket, subscribeSocket, socketId }: DraggableItineraryProps) {
  
  const buildDays = useCallback((): DayData[] => {
    if (itineraryDays && itineraryDays.length > 0) {
      return itineraryDays.map((day: any, idx: number) => ({
        id: day.id || `day-${idx + 1}`,
        dayNumber: day.dayNumber || idx + 1,
        title: day.title || `Day ${idx + 1}`,
        date: day.date,
        activities: (day.activities || [
          day.morningActivity && {
            id: `d${idx + 1}-morning`,
            title: day.morningActivity.title || 'Morning Activity',
            description: day.morningActivity.description || '',
            time: 'Morning (10:00 AM)',
            location: day.morningActivity.location,
            cost: day.morningActivity.cost,
            duration: day.morningActivity.duration || '3 hours',
            color: SLOT_COLORS[0],
          },
          day.afternoonActivity && {
            id: `d${idx + 1}-afternoon`,
            title: day.afternoonActivity.title || 'Afternoon Activity',
            description: day.afternoonActivity.description || '',
            time: 'Afternoon (2:00 PM)',
            location: day.afternoonActivity.location,
            cost: day.afternoonActivity.cost,
            duration: day.afternoonActivity.duration || '2 hours',
            color: SLOT_COLORS[1],
          },
          day.eveningActivity && {
            id: `d${idx + 1}-evening`,
            title: day.eveningActivity.title || 'Evening Activity',
            description: day.eveningActivity.description || '',
            time: 'Evening (6:00 PM)',
            location: day.eveningActivity.location,
            cost: day.eveningActivity.cost,
            duration: day.eveningActivity.duration || '2.5 hours',
            color: SLOT_COLORS[2],
          },
        ].filter(Boolean) as Activity[]),
      }));
    }

    return [
      {
        id: 'day-1',
        dayNumber: 1,
        title: 'Arrival & Exploration',
        activities: [
          { id: 'a1', title: 'Cultural City Tour', description: 'Visit the historic landmarks and immerse yourself in local culture.', time: 'Morning (10:00 AM)', location: 'City Center', cost: 800, duration: '3 hours', color: SLOT_COLORS[0] },
          { id: 'a2', title: 'Local Cuisine Lunch', description: 'Enjoy famous local dishes at a top-rated restaurant.', time: 'Afternoon (2:00 PM)', location: 'Food Street', cost: 1200, duration: '1.5 hours', color: SLOT_COLORS[1] },
          { id: 'a3', title: 'Sunset Views', description: 'Relax at a scenic viewpoint and watch the golden sunset.', time: 'Evening (6:00 PM)', location: 'Scenic Viewpoint', cost: 0, duration: '2 hours', color: SLOT_COLORS[2] },
        ],
      },
      {
        id: 'day-2',
        dayNumber: 2,
        title: 'Adventure & Discovery',
        activities: [
          { id: 'b1', title: 'Morning Hike', description: 'Trek through nature trails with stunning panoramic views.', time: 'Morning (7:00 AM)', location: 'Nature Reserve', cost: 500, duration: '4 hours', color: SLOT_COLORS[3] },
          { id: 'b2', title: 'Museum & Art Gallery', description: 'Explore local art and history at the national museum.', time: 'Afternoon (1:30 PM)', location: 'National Museum', cost: 300, duration: '2 hours', color: SLOT_COLORS[4] },
          { id: 'b3', title: 'Night Market Tour', description: 'Browse local crafts, street food, and live performances.', time: 'Evening (7:00 PM)', location: 'Night Market', cost: 1500, duration: '3 hours', color: SLOT_COLORS[5] },
        ],
      },
    ];
  }, [itineraryDays]);

  const [days, setDays] = useState<DayData[]>(buildDays);
  const [cursors, setCursors] = useState<Record<string, { x: number, y: number, color: string }>>({});

  useEffect(() => {
    if (itineraryDays) setDays(buildDays());
  }, [itineraryDays, buildDays]);

  useEffect(() => {
    if (subscribeSocket) {
      const unsubSync = subscribeSocket('itinerary_sync', (updatedDays) => {
        setDays(updatedDays);
      });
      const unsubCursor = subscribeSocket('cursor_update', (data) => {
        if (data.socketId !== socketId) {
          setCursors(prev => ({ ...prev, [data.socketId]: { x: data.x, y: data.y, color: data.color } }));
        }
      });
      return () => { unsubSync(); unsubCursor(); };
    }
  }, [subscribeSocket, socketId]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (emitSocket) {
      emitSocket('cursor_move', { x: e.clientX, y: e.clientY, color: '#8B5CF6' });
    }
  };

  const handleReorder = useCallback((dayId: string, oldIndex: number, newIndex: number) => {
    setDays(prev => {
      const next = prev.map(day =>
        day.id === dayId
          ? { ...day, activities: arrayMove(day.activities, oldIndex, newIndex) }
          : day
      );
      if (emitSocket) emitSocket('itinerary_sync', next);
      return next;
    });
  }, [emitSocket]);

  const handleDeleteActivity = useCallback((dayId: string, activityId: string) => {
    setDays(prev => {
      const next = prev.map(day =>
        day.id === dayId
          ? { ...day, activities: day.activities.filter(a => a.id !== activityId) }
          : day
      );
      if (emitSocket) emitSocket('itinerary_sync', next);
      return next;
    });
  }, [emitSocket]);

  const handleEditActivity = useCallback((dayId: string, activityId: string, updates: Partial<Activity>) => {
    setDays(prev => {
      const next = prev.map(day =>
        day.id === dayId
          ? { ...day, activities: day.activities.map(a => a.id === activityId ? { ...a, ...updates } : a) }
          : day
      );
      if (emitSocket) emitSocket('itinerary_sync', next);
      return next;
    });
  }, [emitSocket]);

  const handleAddActivity = useCallback((dayId: string) => {
    const newActivity: Activity = {
      id: `new-${Date.now()}`,
      title: 'New Activity',
      description: 'Click the edit button to customize this activity.',
      time: 'Flexible',
      color: SLOT_COLORS[Math.floor(Math.random() * SLOT_COLORS.length)],
    };
    setDays(prev => {
      const next = prev.map(day =>
        day.id === dayId
          ? { ...day, activities: [...day.activities, newActivity] }
          : day
      );
      if (emitSocket) emitSocket('itinerary_sync', next);
      return next;
    });
  }, [emitSocket]);

  return (
    <div className="space-y-4">
      {days.map(day => (
        <DayCard
          key={day.id}
          day={day}
          onReorder={handleReorder}
          onDeleteActivity={handleDeleteActivity}
          onEditActivity={handleEditActivity}
          onAddActivity={handleAddActivity}
          onHoverItem={onHoverItem}
        />
      ))}
    </div>
  );
}
