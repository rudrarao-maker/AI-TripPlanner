import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  color: string;
}

// Sortable Item Component
function SortableActivity({ activity, index }: { activity: Activity, index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex gap-4 relative group ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex flex-col items-center">
        <div className={`h-3 w-3 rounded-full ${activity.color} ring-4 ring-primary/10 z-10`} />
        {index !== 2 && <div className="w-px h-full bg-border absolute top-3 left-1.5" />}
      </div>
      
      <div className="pb-4 flex-1 flex items-start gap-2 bg-card p-3 -mt-2 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
        <div className="flex-1">
          <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">{activity.time}</span>
          <h4 className="font-semibold text-lg mt-1 text-foreground">{activity.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
        </div>
        
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function DraggableItinerary({ onHoverItem }: { onHoverItem?: (id: string) => void }) {
  const [items, setItems] = useState<Activity[]>([
    { id: 'a1', title: 'Cultural City Tour', description: 'Visit the historic landmarks.', time: 'Morning (10:00 AM)', color: 'bg-primary' },
    { id: 'a2', title: 'Local Cuisine Lunch', description: 'Enjoy famous local dishes.', time: 'Afternoon (2:00 PM)', color: 'bg-accent' },
    { id: 'a3', title: 'Sunset Views', description: 'Relax at a scenic viewpoint.', time: 'Evening (6:00 PM)', color: 'bg-indigo-500' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <Card className="glass-card border-border/50 hover:border-primary/30 transition-colors">
      <CardHeader className="bg-muted/30 border-b pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Day 1 — Arrival & Exploration</CardTitle>
        <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border">Drag to reorder</span>
      </CardHeader>
      <CardContent className="pt-8 pb-4 pl-4 pr-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items}
            strategy={verticalListSortingStrategy}
          >
            {items.map((activity, index) => (
              <div 
                key={activity.id} 
                onMouseEnter={() => onHoverItem?.(activity.id)}
                onMouseLeave={() => onHoverItem?.('')}
              >
                <SortableActivity activity={activity} index={index} />
              </div>
            ))}
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
