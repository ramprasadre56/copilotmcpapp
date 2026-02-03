"use client";

import { AppConfig } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";

interface AppCardProps {
  app: AppConfig;
  enabled: boolean;
  onToggle: () => void;
}

const categoryColors: Record<AppConfig["category"], string> = {
  utility: "from-purple-500 to-indigo-600",
  data: "from-blue-500 to-cyan-600",
  ai: "from-pink-500 to-rose-600",
  integration: "from-amber-500 to-orange-600",
};

const categoryLabels: Record<AppConfig["category"], string> = {
  utility: "Utility",
  data: "Data",
  ai: "AI",
  integration: "Integration",
};

export function AppCard({ app, enabled, onToggle }: AppCardProps) {
  return (
    <div
      className={`
        relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden
        border-2 transition-all duration-300 ease-out
        hover:shadow-xl hover:-translate-y-1
        ${enabled ? "border-green-500 dark:border-green-400" : "border-transparent"}
      `}
    >
      {/* Header with gradient */}
      <div className={`h-2 bg-gradient-to-r ${categoryColors[app.category]}`} />

      <div className="p-5">
        {/* Icon and Title */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                bg-gradient-to-br ${categoryColors[app.category]} text-white
              `}
            >
              <Icon name={app.icon} className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {app.name}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {categoryLabels[app.category]}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          {enabled && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Icon name="check" className="w-3 h-3" />
              Active
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2 min-h-[40px]">
          {app.description}
        </p>

        {/* Features */}
        <div className="flex items-center gap-3 mb-4 text-xs text-slate-500 dark:text-slate-400">
          {app.hasUI && (
            <span className="flex items-center gap-1">
              <Icon name="sparkles" className="w-3.5 h-3.5" />
              Interactive UI
            </span>
          )}
          {app.parameters.length > 0 && (
            <span>
              {app.parameters.length} param{app.parameters.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Action Button */}
        <Button
          variant={enabled ? "danger" : "primary"}
          size="sm"
          onClick={onToggle}
          className="w-full"
        >
          {enabled ? (
            <>
              <Icon name="x" className="w-4 h-4" />
              Disable
            </>
          ) : (
            <>
              <Icon name="plus" className="w-4 h-4" />
              Enable
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
