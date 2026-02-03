"use client";

import { useState } from "react";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotAction } from "@copilotkit/react-core";
import { McpAppHost } from "@/components/McpAppHost";
import { Tabs } from "@/components/ui/Tabs";
import { ChatTab } from "@/components/tabs/ChatTab";
import { AppsTab } from "@/components/tabs/AppsTab";
import { ArchitectureTab } from "@/components/tabs/ArchitectureTab";
import { AppSettingsProvider, useAppSettings } from "@/context/AppSettingsContext";
import { TabType } from "@/lib/types";

// Helper function to call MCP tools via API
async function callMCPTool(toolName: string, args: Record<string, unknown>): Promise<string> {
  const response = await fetch("/api/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toolName, args }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.result;
}

// UI Components for tool results (fallback for tools without interactive UI)
function TimeCard({ timezone, time }: { timezone: string; time: string | object }) {
  const displayTime = typeof time === "object" ? JSON.stringify(time) : time;
  return (
    <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-white shadow-lg max-w-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🕐</span>
        <span className="text-sm opacity-90">{timezone}</span>
      </div>
      <div className="text-lg font-semibold">{displayTime}</div>
    </div>
  );
}

function UUIDCard({ uuid }: { uuid: string | object }) {
  const displayUuid = typeof uuid === "object" ? JSON.stringify(uuid) : uuid;
  return (
    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white shadow-lg max-w-sm">
      <div className="text-sm opacity-80 mb-2">Generated UUID</div>
      <div className="font-mono text-sm bg-white/20 rounded px-3 py-2 break-all">{displayUuid}</div>
    </div>
  );
}

function WordCountCard({ data }: { data: string | object }) {
  let stats: { words?: number; characters?: number; lines?: number };

  if (typeof data === "object") {
    stats = data as typeof stats;
  } else {
    try {
      stats = JSON.parse(data);
    } catch {
      return <div className="p-4 bg-gray-100 rounded-lg">{data}</div>;
    }
  }

  return (
    <div className="p-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl text-white shadow-lg max-w-sm">
      <div className="text-sm opacity-80 mb-3">Word Count Analysis</div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-2xl font-bold">{stats.words}</div>
          <div className="text-xs opacity-80">Words</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.characters}</div>
          <div className="text-xs opacity-80">Characters</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.lines}</div>
          <div className="text-xs opacity-80">Lines</div>
        </div>
      </div>
    </div>
  );
}

function DisabledToolMessage({ toolName }: { toolName: string }) {
  return (
    <div className="p-4 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
      <strong>{toolName}</strong> is currently disabled. Enable it in the Apps tab.
    </div>
  );
}

// Component that registers CopilotKit actions based on enabled apps
function DynamicToolRegistration() {
  const { isAppEnabled } = useAppSettings();

  // Weather tool with interactive MCP App UI
  useCopilotAction({
    name: "get_weather",
    description: "Get the current weather for a location. Use this when the user asks about weather in any city.",
    parameters: [
      {
        name: "location",
        type: "string",
        description: "The city and country (e.g., 'London, UK', 'Hyderabad, India')",
        required: true,
      },
    ],
    handler: async ({ location }) => {
      if (!isAppEnabled("get_weather")) {
        return "Weather tool is currently disabled. Enable it in the Apps tab.";
      }
      console.log("Getting weather for:", location);
      return await callMCPTool("get_weather", { location });
    },
    render: ({ args, result }) => {
      if (!isAppEnabled("get_weather")) {
        return <DisabledToolMessage toolName="Weather" />;
      }
      return (
        <McpAppHost
          toolName="get_weather"
          toolInput={{ location: args.location }}
          toolResult={result}
          height={280}
        />
      );
    },
  });

  // Calculator tool with interactive MCP App UI
  useCopilotAction({
    name: "calculate",
    description: "Perform a mathematical calculation. Use this for any math operations like addition, subtraction, multiplication, division.",
    parameters: [
      {
        name: "expression",
        type: "string",
        description: "The mathematical expression to evaluate (e.g., '2 + 2 * 3', '25 * 4')",
        required: true,
      },
    ],
    handler: async ({ expression }) => {
      if (!isAppEnabled("calculate")) {
        return "Calculator tool is currently disabled. Enable it in the Apps tab.";
      }
      console.log("Calculating:", expression);
      return await callMCPTool("calculate", { expression });
    },
    render: ({ args, result }) => {
      if (!isAppEnabled("calculate")) {
        return <DisabledToolMessage toolName="Calculator" />;
      }
      return (
        <McpAppHost
          toolName="calculate"
          toolInput={{ expression: args.expression }}
          toolResult={result}
          height={450}
        />
      );
    },
  });

  // Time tool
  useCopilotAction({
    name: "get_time",
    description: "Get the current time for a timezone. Use this when the user asks about time.",
    parameters: [
      {
        name: "timezone",
        type: "string",
        description: "The timezone (e.g., 'America/New_York', 'Europe/London', 'Asia/Kolkata')",
        required: true,
      },
    ],
    handler: async ({ timezone }) => {
      if (!isAppEnabled("get_time")) {
        return "Time tool is currently disabled. Enable it in the Apps tab.";
      }
      console.log("Getting time for:", timezone);
      return await callMCPTool("get_time", { timezone });
    },
    render: ({ args, result }) => {
      if (!isAppEnabled("get_time")) {
        return <DisabledToolMessage toolName="World Clock" />;
      }
      if (!result) return <div className="text-gray-500">Getting time...</div>;
      return <TimeCard timezone={args.timezone || ""} time={result} />;
    },
  });

  // UUID tool
  useCopilotAction({
    name: "generate_uuid",
    description: "Generate a random UUID. Use this when the user asks for a unique identifier or UUID.",
    parameters: [],
    handler: async () => {
      if (!isAppEnabled("generate_uuid")) {
        return "UUID tool is currently disabled. Enable it in the Apps tab.";
      }
      console.log("Generating UUID");
      return await callMCPTool("generate_uuid", {});
    },
    render: ({ result }) => {
      if (!isAppEnabled("generate_uuid")) {
        return <DisabledToolMessage toolName="UUID Generator" />;
      }
      if (!result) return <div className="text-gray-500">Generating UUID...</div>;
      return <UUIDCard uuid={result} />;
    },
  });

  // Word count tool
  useCopilotAction({
    name: "word_count",
    description: "Count words, characters, and lines in text.",
    parameters: [
      {
        name: "text",
        type: "string",
        description: "The text to analyze",
        required: true,
      },
    ],
    handler: async ({ text }) => {
      if (!isAppEnabled("word_count")) {
        return "Word count tool is currently disabled. Enable it in the Apps tab.";
      }
      console.log("Counting words in text");
      return await callMCPTool("word_count", { text });
    },
    render: ({ result }) => {
      if (!isAppEnabled("word_count")) {
        return <DisabledToolMessage toolName="Word Counter" />;
      }
      if (!result) return <div className="text-gray-500">Counting words...</div>;
      return <WordCountCard data={result} />;
    },
  });

  return null;
}

// Main content component
function MainContent() {
  const [activeTab, setActiveTab] = useState<TabType>("chat");

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Tool Registration */}
      <DynamicToolRegistration />

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Tab Navigation */}
          <div className="mb-6">
            <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Tab Content */}
          <div className="min-h-[calc(100vh-150px)]">
            {activeTab === "chat" && <ChatTab />}
            {activeTab === "apps" && <AppsTab />}
            {activeTab === "architecture" && <ArchitectureTab />}
          </div>
        </div>
      </main>

      {/* CopilotKit Sidebar */}
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          title: "AI Copilot",
          initial: "Hi! I'm your AI assistant. How can I help you today? I can get weather info, do calculations, check time, and more!",
        }}
      />
    </div>
  );
}

// Root component with providers
export default function Home() {
  return (
    <AppSettingsProvider>
      <MainContent />
    </AppSettingsProvider>
  );
}
