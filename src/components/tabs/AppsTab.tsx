"use client";

import { useState } from "react";
import { useAppSettings } from "@/context/AppSettingsContext";
import { appRegistry } from "@/lib/appRegistry";
import { AppCard } from "@/components/apps/AppCard";
import { AppCategory } from "@/lib/types";

const categories: { id: AppCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "utility", label: "Utility" },
  { id: "data", label: "Data" },
  { id: "ai", label: "AI" },
  { id: "integration", label: "Integration" },
];

export function AppsTab() {
  const { enabledApps, toggleApp, enableAll, disableAll } = useAppSettings();
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | "all">("all");

  const filteredApps =
    selectedCategory === "all"
      ? appRegistry
      : appRegistry.filter((app) => app.category === selectedCategory);

  const enabledCount = enabledApps.length;

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-[var(--text-primary)]">
            App Marketplace
          </h1>
          <p className="text-[var(--text-secondary)]">
            Enable tools to extend your AI assistant&apos;s capabilities
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--text-muted)] px-4 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
            {enabledCount}/{appRegistry.length} active
          </span>
          <button onClick={enableAll} className="btn-ghost text-sm">
            Enable All
          </button>
          <button onClick={disableAll} className="btn-ghost text-sm">
            Disable All
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = selectedCategory === category.id;
          const count =
            category.id === "all"
              ? appRegistry.length
              : appRegistry.filter((app) => app.category === category.id).length;

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200
                ${isActive
                  ? "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-indigo-500/25"
                  : "bg-white text-[var(--text-secondary)] border border-[var(--glass-border)] hover:border-[var(--accent-primary)]/30 hover:text-[var(--text-primary)]"
                }
              `}
            >
              {category.label}
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isActive ? 'bg-white/20' : 'bg-[var(--bg-primary)]'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredApps.map((app, index) => (
          <div 
            key={app.id}
            className="animate-fade-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <AppCard
              app={app}
              enabled={enabledApps.includes(app.id)}
              onToggle={() => toggleApp(app.id)}
            />
          </div>
        ))}
      </div>

      {filteredApps.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[var(--text-secondary)]">No apps found in this category.</p>
        </div>
      )}
    </div>
  );
}
