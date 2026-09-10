"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Eye, EyeOff, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ChangePasswordModalProps {
  user: { id: string; name: string; email: string } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ user, isOpen, onClose }: ChangePasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isValid) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      toast.success(`Password changed successfully for ${user.name}`);
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirm(false);
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border/50 text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Change Password
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-600 dark:text-amber-400">
            You are changing the password for <strong>{user.name}</strong> ({user.email}). 
            The user will need to use the new password on their next login.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          {password.length > 0 && (
            <div className="space-y-1.5 p-3 bg-muted/30 rounded-lg border border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Password Requirements</p>
              <Requirement met={hasMinLength} label="At least 8 characters" />
              <Requirement met={hasUppercase} label="One uppercase letter" />
              <Requirement met={hasLowercase} label="One lowercase letter" />
              <Requirement met={hasNumber} label="One number" />
              {confirmPassword.length > 0 && (
                <Requirement met={passwordsMatch} label="Passwords match" />
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || loading}
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs transition-colors ${met ? "text-emerald-500" : "text-muted-foreground"}`}>
      <CheckCircle2 className={`h-3.5 w-3.5 ${met ? "text-emerald-500" : "text-muted-foreground/40"}`} />
      {label}
    </div>
  );
}
