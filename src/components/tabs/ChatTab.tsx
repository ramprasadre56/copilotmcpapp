"use client";

import { useAppSettings } from "@/context/AppSettingsContext";
import { appRegistry } from "@/lib/appRegistry";
import { Icon } from "@/components/ui/Icons";
import { ArchitectureDiagram } from "@/components/architecture/ArchitectureDiagram";
import { DetailedArchitecture } from "@/components/architecture/DetailedArchitecture";

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-5 border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Icon name={icon} className="w-5 h-5" />
        </div>
        <h3 className="font-medium text-slate-800 dark:text-white">
          {title}
        </h3>
      </div>
      <p className="text-slate-600 dark:text-slate-300 text-sm">
        {description}
      </p>
    </div>
  );
}

export function ChatTab() {
  const { enabledApps } = useAppSettings();
  const enabledAppsList = appRegistry.filter((app) => enabledApps.includes(app.id));

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-6">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          CopilotKit MCP Apps
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Interactive AI-powered applications with Model Context Protocol.
          Chat with your AI assistant to execute tools and see results.
        </p>
      </section>

      {/* Architecture Diagram */}
      <section>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
          System Architecture
        </h2>
        <ArchitectureDiagram />
      </section>

      {/* Getting Started */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
          Getting Started
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Open the chat sidebar on the right to interact with your AI copilot.
          The copilot can help you with various tasks using the enabled MCP tools.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard
            icon="message-square"
            title="MCP Integration"
            description="Connect to MCP servers to extend your AI's capabilities with custom tools."
          />
          <FeatureCard
            icon="sparkles"
            title="Generative UI"
            description="AI can generate interactive UI components directly in the chat."
          />
          <FeatureCard
            icon="arrow-right"
            title="Real-time Streaming"
            description="Get instant responses with streaming AI completions."
          />
          <FeatureCard
            icon="wrench"
            title="Tool Execution"
            description="Execute tools and see results rendered in the chat interface."
          />
        </div>
      </section>

      {/* Active Tools */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            Active Tools
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {enabledAppsList.length} of {appRegistry.length} enabled
          </span>
        </div>

        {enabledAppsList.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            No tools enabled. Go to the Apps tab to enable some tools.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {enabledAppsList.map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  <Icon name={app.icon} className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white text-sm">
                    {app.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {app.toolName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
          How It Works
        </h2>
        <ol className="space-y-3">
          {[
            "Enable the tools you want to use in the Apps tab",
            "Open the chat sidebar and start a conversation",
            "Ask the AI to perform tasks using natural language",
            "The AI will use the appropriate tools to help you",
          ].map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <span className="text-slate-600 dark:text-slate-300">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
