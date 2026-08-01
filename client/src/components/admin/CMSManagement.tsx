import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Image as ImageIcon,
  FileText,
  Tag,
  MapPin,
  Eye,
  Trash2,
  Edit3,
  Plus,
} from "lucide-react";

export function CMSManagement() {
  const [activeTab, setActiveTab] = useState<"packages" | "offers" | "landing">(
    "packages",
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Layers className="h-6 w-6 text-primary" /> Content Management
        </h2>
        <Button variant="gradient" className="rounded-full shadow-lg gap-2">
          <Plus className="h-4 w-4" /> Create Content
        </Button>
      </div>

      <div className="flex gap-2 border-b border-border/50 pb-4">
        <Button
          variant={activeTab === "packages" ? "default" : "ghost"}
          onClick={() => setActiveTab("packages")}
          className="rounded-xl gap-2"
        >
          <MapPin className="h-4 w-4" /> Curated Packages
        </Button>
        <Button
          variant={activeTab === "offers" ? "default" : "ghost"}
          onClick={() => setActiveTab("offers")}
          className="rounded-xl gap-2"
        >
          <Tag className="h-4 w-4" /> Promotional Offers
        </Button>
        <Button
          variant={activeTab === "landing" ? "default" : "ghost"}
          onClick={() => setActiveTab("landing")}
          className="rounded-xl gap-2"
        >
          <FileText className="h-4 w-4" /> Landing Page Sections
        </Button>
      </div>

      <Card className="glass">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock CMS Items */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 hover:shadow-xl transition-all"
              >
                <div className="h-32 bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8 opacity-20" />
                  </div>
                  <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    Published
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">
                    {activeTab === "packages"
                      ? "Bali Honeymoon Special"
                      : activeTab === "offers"
                        ? "Summer Sale 2026"
                        : "Hero Banner Variant"}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Last edited 2 days ago by Admin
                  </p>

                  <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Eye className="h-3 w-3" /> Preview
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-500"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
