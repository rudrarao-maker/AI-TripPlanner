"use client";

import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import api from "@/lib/api";

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

export function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
  const { isLoaded, userId } = useAuth();
  const { user, setUser } = useUserStore();
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoadingProfile(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        setUser(res.data.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    if (!user) {
      fetchProfile();
    } else {
      setLoadingProfile(false);
    }
  }, [userId, user, setUser]);

  if (!isLoaded || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
