import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" /> Settings
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage global application settings and configurations.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass border-primary/10">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic application configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p><strong>Site Name:</strong> TripCraft AI</p>
            <p><strong>Maintenance Mode:</strong> Disabled</p>
            <Button variant="outline" className="mt-4" disabled>Edit Settings (Coming Soon)</Button>
          </CardContent>
        </Card>

        <Card className="glass border-primary/10">
          <CardHeader>
            <CardTitle>API Integrations</CardTitle>
            <CardDescription>Manage third-party service connections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p><strong>Stripe Status:</strong> Connected ✅</p>
            <p><strong>Clerk Auth:</strong> Connected ✅</p>
            <p><strong>PostHog Analytics:</strong> Connected ✅</p>
            <Button variant="outline" className="mt-4" disabled>Manage APIs (Coming Soon)</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
