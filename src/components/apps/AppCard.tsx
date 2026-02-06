"use client";

import { AppConfig } from "@/lib/types";
import { Icon } from "@/components/ui/Icons";

interface AppCardProps {
  app: AppConfig;
  enabled: boolean;
  onToggle: () => void;
}

const categoryColors: Record<AppConfig["category"], { gradient: string; shadow: string }> = {
  utility: { 
    gradient: "from-[#6366f1] to-[#8b5cf6]", 
    shadow: "shadow-indigo-500/25" 
  },
  data: { 
    gradient: "from-[#06b6d4] to-[#22d3ee]", 
    shadow: "shadow-cyan-500/25" 
  },
  ai: { 
    gradient: "from-[#f59e0b] to-[#fbbf24]", 
    shadow: "shadow-amber-500/25" 
  },
  integration: { 
    gradient: "from-[#10b981] to-[#34d399]", 
    shadow: "shadow-emerald-500/25" 
  },
};

export function AppCard({ app, enabled, onToggle }: AppCardProps) {
  const colors = categoryColors[app.category];
  
  return (
    <div
      className={`
        bg-white rounded-2xl border transition-all duration-300 overflow-hidden
        ${enabled 
          ? "border-[var(--accent-success)]/30 shadow-lg shadow-emerald-500/10" 
          : "border-[var(--glass-border)] shadow-md hover:shadow-lg hover:-translate-y-1"
        }
      `}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white shadow-lg ${colors.shadow}`}>
              <Icon name={app.icon} className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">{app.name}</h3>
              <span className="text-xs text-[var(--text-muted)] capitalize">{app.category}</span>
            </div>
          </div>

          {enabled && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[var(--accent-success)] bg-[var(--accent-success)]/10 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-success)]" />
              Active
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 min-h-[40px]">
          {app.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-5 text-xs text-[var(--text-muted)]">
          {app.hasUI && (
            <span className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-primary)] rounded-lg">
              <Icon name="sparkles" className="w-3 h-3" />
              Interactive
            </span>
          )}
          {app.parameters.length > 0 && (
            <span className="px-2 py-1 bg-[var(--bg-primary)] rounded-lg">
              {app.parameters.length} param{app.parameters.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onToggle}
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            ${enabled
              ? "bg-[var(--accent-danger)]/10 text-[var(--accent-danger)] border border-[var(--accent-danger)]/20 hover:bg-[var(--accent-danger)]/20"
              : `bg-gradient-to-r ${colors.gradient} text-white shadow-lg ${colors.shadow} hover:shadow-xl hover:-translate-y-0.5`
            }
          `}
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
        </button>
      </div>
    </div>
  );
}
