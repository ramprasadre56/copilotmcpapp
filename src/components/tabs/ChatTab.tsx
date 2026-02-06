"use client";

import { useAppSettings } from "@/context/AppSettingsContext";
import { appRegistry } from "@/lib/appRegistry";
import { Icon } from "@/components/ui/Icons";
import { ArchitectureDiagram } from "@/components/architecture/ArchitectureDiagram";
import { DetailedArchitecture } from "@/components/architecture/DetailedArchitecture";

const features = [
  {
    icon: "sparkles",
    title: "Tool-Native UI",
    description: "Let agents open pickers, forms, and approvals instead of asking users to respond in text.",
    gradient: "from-[#6366f1] to-[#8b5cf6]",
  },
  {
    icon: "database",
    title: "Structured Input",
    description: "Collect structured input that agents can reliably act on — no more parsing free-form text.",
    gradient: "from-[#06b6d4] to-[#22d3ee]",
  },
  {
    icon: "arrow-right",
    title: "In-Product Retention",
    description: "Keep users inside your product, rather than bouncing them to external chat tools.",
    gradient: "from-[#ec4899] to-[#f472b6]",
  },
  {
    icon: "wrench",
    title: "Workflow Integration",
    description: "Blend agent actions directly into existing workflows and screens for seamless UX.",
    gradient: "from-[#10b981] to-[#34d399]",
  },
];

function FeatureCard({ icon, title, description, gradient, index }: { icon: string; title: string; description: string; gradient: string; index: number }) {
  return (
    <div 
      className="card-glass p-6 animate-fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-5 shadow-lg`}>
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function ChatTab() {
  const { enabledApps } = useAppSettings();
  const enabledAppsList = appRegistry.filter((app) => enabledApps.includes(app.id));

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center py-20 relative">
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-success)]" />
            Model Context Protocol
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-[var(--text-primary)]">
            Build MCP Apps with{" "}
            <span className="text-gradient">CopilotKit</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10">
            Build MCP-powered interactions directly into your agentic application. 
            CopilotKit makes MCP Apps usable inside real, user-facing applications.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button className="btn-primary">
              <span>Get Started</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className="btn-ghost">
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
            Your App + MCP Apps
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            CopilotKit and AG-UI bring MCP apps into your application — where you control UX, permissions, and workflows.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="card-glass p-8">
        <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">
          System Architecture
        </h2>
        <ArchitectureDiagram />
      </section>

      {/* Technical Architecture */}
      <section className="card-glass p-8">
        <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">
          Technical Details
        </h2>
        <DetailedArchitecture />
      </section>

      {/* Active Tools */}
      <section className="card-glass p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Active MCP Tools
          </h2>
          <span className="text-sm text-[var(--text-muted)] bg-[var(--bg-primary)] px-3 py-1 rounded-full">
            {enabledAppsList.length} of {appRegistry.length}
          </span>
        </div>

        {enabledAppsList.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-primary)] flex items-center justify-center">
              <Icon name="grid" className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-secondary)]">
              No tools enabled. Go to the <strong>Apps</strong> tab to enable some tools.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {enabledAppsList.map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)] hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white shadow-md shrink-0">
                  <Icon name={app.icon} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[var(--text-primary)] truncate">{app.name}</div>
                  <div className="text-xs text-[var(--text-muted)] truncate">{app.toolName}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
