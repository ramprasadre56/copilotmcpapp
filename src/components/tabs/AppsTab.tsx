"use client";

import { useState } from "react";
import { useAppSettings } from "@/context/AppSettingsContext";
import { appRegistry } from "@/lib/appRegistry";
import { AppCard } from "@/components/apps/AppCard";
import { Button } from "@/components/ui/Button";
import { AppCategory } from "@/lib/types";

const categories: { id: AppCategory | "all"; label: string }[] = [
  { id: "all", label: "All Apps" },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            App Marketplace
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Enable or disable MCP tools to customize your AI assistant
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {enabledCount} of {appRegistry.length} enabled
          </span>
          <Button variant="ghost" size="sm" onClick={enableAll}>
            Enable All
          </Button>
          <Button variant="ghost" size="sm" onClick={disableAll}>
            Disable All
          </Button>
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
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }
              `}
            >
              {category.label}
              <span
                className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredApps.map((app) => (
          <AppCard
            key={app.id}
            app={app}
            enabled={enabledApps.includes(app.id)}
            onToggle={() => toggleApp(app.id)}
          />
        ))}
      </div>

      {filteredApps.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No apps found in this category.
        </div>
      )}
    </div>
  );
}
