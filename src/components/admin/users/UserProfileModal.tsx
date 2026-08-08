"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, CreditCard, LogIn, Activity } from "lucide-react";

export function UserProfileModal({ user, isOpen, onClose }: { user: any, isOpen: boolean, onClose: () => void }) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card border-border/50 text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            User Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="md:col-span-1 flex flex-col items-center p-6 bg-muted/30 rounded-xl border border-border/50">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold mb-4">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-center">{user.name}</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">{user.email}</p>
            
            <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className="mb-2 w-full justify-center">
              {user.status.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="w-full justify-center">
              Role: {user.role.toUpperCase()}
            </Badge>
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Joined</span>
                </div>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Mail className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Verified</span>
                </div>
                <p className="font-medium">{user.verified ? 'Yes' : 'No'}</p>
              </div>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50 h-48 overflow-y-auto">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <CreditCard className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Recent Payments</span>
              </div>
              {user.payments && user.payments.length > 0 ? (
                <div className="space-y-3">
                  {user.payments.map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0">
                      <div>
                        <p className="font-medium">${p.amount}</p>
                        <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center mt-8">No payment history found.</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
