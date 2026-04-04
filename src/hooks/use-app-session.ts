"use client";

import { useEffect, useState } from "react";
import {
  AppSession,
  AppUser,
  clearStoredSession,
  getStoredSession,
  setStoredSession,
  subscribeToSession,
  updateStoredUser,
} from "@/lib/app-session";

export function useAppSession() {
  const [session, setSession] = useState<AppSession | null>(null);

  useEffect(() => {
    setSession(getStoredSession());
    return subscribeToSession(() => setSession(getStoredSession()));
  }, []);

  return {
    session,
    user: session?.user ?? null,
    token: session?.token ?? null,
    isAuthenticated: Boolean(session?.token),
    login(nextSession: AppSession) {
      setStoredSession(nextSession);
      setSession(nextSession);
    },
    logout() {
      clearStoredSession();
      setSession(null);
    },
    updateUser(updates: Partial<AppUser>) {
      updateStoredUser(updates);
      setSession(getStoredSession());
    },
  };
}
