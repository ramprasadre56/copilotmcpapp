"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AppSettings } from "@/lib/types";
import { getAllAppIds } from "@/lib/appRegistry";

const STORAGE_KEY = "copilotmcp:enabledApps";

const AppSettingsContext = createContext<AppSettings | null>(null);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [enabledApps, setEnabledApps] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setEnabledApps(parsed);
        }
      } catch {
        // Invalid JSON, use defaults
        setEnabledApps(getAllAppIds());
      }
    } else {
      // No stored value, enable all apps by default
      setEnabledApps(getAllAppIds());
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage when enabledApps changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enabledApps));
    }
  }, [enabledApps, isLoaded]);

  const toggleApp = useCallback((appId: string) => {
    setEnabledApps((prev) => {
      if (prev.includes(appId)) {
        return prev.filter((id) => id !== appId);
      } else {
        return [...prev, appId];
      }
    });
  }, []);

  const isAppEnabled = useCallback(
    (appId: string) => {
      return enabledApps.includes(appId);
    },
    [enabledApps]
  );

  const enableAll = useCallback(() => {
    setEnabledApps(getAllAppIds());
  }, []);

  const disableAll = useCallback(() => {
    setEnabledApps([]);
  }, []);

  const value: AppSettings = {
    enabledApps,
    toggleApp,
    isAppEnabled,
    enableAll,
    disableAll,
  };

  // Don't render children until we've loaded from localStorage
  // This prevents hydration mismatch
  if (!isLoaded) {
    return null;
  }

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings(): AppSettings {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within an AppSettingsProvider");
  }
  return context;
}
