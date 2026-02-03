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

  // ===== EXT-APPS TOOLS =====

  // Interactive Map tool
  useCopilotAction({
    name: "show_map",
    description: "Display an interactive 3D globe map. Use geocode first to get coordinates, then visualize on the map.",
    parameters: [
      { name: "west", type: "number", description: "Western longitude (-180 to 180)", required: false },
      { name: "south", type: "number", description: "Southern latitude (-90 to 90)", required: false },
      { name: "east", type: "number", description: "Eastern longitude (-180 to 180)", required: false },
      { name: "north", type: "number", description: "Northern latitude (-90 to 90)", required: false },
      { name: "label", type: "string", description: "Optional label to display on the map", required: false },
    ],
    handler: async ({ west, south, east, north, label }) => {
      if (!isAppEnabled("show_map")) {
        return "Map tool is currently disabled. Enable it in the Apps tab.";
      }
      console.log("Showing map");
      return await callMCPTool("show_map", { west, south, east, north, label });
    },
    render: ({ args, result }) => {
      if (!isAppEnabled("show_map")) {
        return <DisabledToolMessage toolName="Interactive Map" />;
      }
      return (
        <McpAppHost
          toolName="show_map"
          toolInput={args}
          toolResult={result}
          height={400}
        />
      );
    },
  });

  // Geocoder tool
  useCopilotAction({
    name: "geocode",
    description: "Search for places using OpenStreetMap. Returns coordinates and bounding boxes for locations.",
    parameters: [
      { name: "query", type: "string", description: "Place name or address to search", required: true },
    ],
    handler: async ({ query }) => {
      if (!isAppEnabled("geocode")) {
        return "Geocoder tool is currently disabled. Enable it in the Apps tab.";
      }
      console.log("Geocoding:", query);
      return await callMCPTool("geocode", { query });
    },
    render: ({ result }) => {
      if (!isAppEnabled("geocode")) {
        return <DisabledToolMessage toolName="Geocoder" />;
      }
      if (!result) return <div className="text-gray-500">Searching location...</div>;
      return (
        <div className="p-4 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl text-white shadow-lg max-w-md">
          <div className="text-sm opacity-80 mb-2">📍 Geocode Result</div>
          <pre className="text-xs bg-white/20 rounded p-2 overflow-auto max-h-40">{result}</pre>
        </div>
      );
    },
  });

  // 3D Scene Viewer tool
  useCopilotAction({
    name: "show_threejs_scene",
    description: "Render interactive 3D scenes with Three.js. Create custom visualizations with JavaScript code.",
    parameters: [
      { name: "code", type: "string", description: "JavaScript code to render the 3D scene", required: true },
      { name: "height", type: "number", description: "Height in pixels (default: 400)", required: false },
    ],
    handler: async ({ code, height }) => {
      if (!isAppEnabled("show_threejs_scene")) {
        return "3D Scene tool is currently disabled. Enable it in the Apps tab.";
      }
      console.log("Showing 3D scene");
      return await callMCPTool("show_threejs_scene", { code, height });
    },
    render: ({ args, result }) => {
      if (!isAppEnabled("show_threejs_scene")) {
        return <DisabledToolMessage toolName="3D Scene Viewer" />;
      }
      return (
        <McpAppHost
          toolName="show_threejs_scene"
          toolInput={args}
          toolResult={result}
          height={args.height || 400}
        />
      );
    },
  });

  // PDF Viewer tool
  useCopilotAction({
    name: "display_pdf",
    description: "Display interactive PDF documents. Supports academic sources like arxiv.org, biorxiv.org.",
    parameters: [
      { name: "url", type: "string", description: "PDF URL (e.g., 'https://arxiv.org/pdf/1706.03762')", required: true },
      { name: "page", type: "number", description: "Initial page number (default: 1)", required: false },
    ],
    handler: async ({ url, page }) => {
      if (!isAppEnabled("display_pdf")) {
        return "PDF Viewer tool is currently disabled. Enable it in the Apps tab.";
      }
      console.log("Displaying PDF:", url);
      return await callMCPTool("display_pdf", { url, page });
    },
    render: ({ args, result }) => {
      if (!isAppEnabled("display_pdf")) {
        return <DisabledToolMessage toolName="PDF Viewer" />;
      }
      return (
        <McpAppHost
          toolName="display_pdf"
          toolInput={args}
          toolResult={result}
          height={500}
        />
      );
    },
  });

  // Shader Playground tool
  useCopilotAction({
    name: "show_shader",
    description: "Render interactive WebGL shaders. Write GLSL code with access to uniforms like iTime, iResolution.",
    parameters: [
      { name: "code", type: "string", description: "GLSL fragment shader code", required: true },
      { name: "height", type: "number", description: "Height in pixels (default: 400)", required: false },
    ],
    handler: async ({ code, height }) => {
      if (!isAppEnabled("show_shader")) {
        return "Shader tool is currently disabled. Enable it in the Apps tab.";
      }
      console.log("Showing shader");
      return await callMCPTool("show_shader", { code, height });
    },
    render: ({ args, result }) => {
      if (!isAppEnabled("show_shader")) {
        return <DisabledToolMessage toolName="Shader Playground" />;
      }
      return (
        <McpAppHost
          toolName="show_shader"
          toolInput={args}
          toolResult={result}
          height={args.height || 400}
        />
      );
    },
  });

  // Sheet Music tool
  useCopilotAction({
    name: "show_sheet_music",
    description: "Display interactive sheet music notation using ABC notation format. Play and view music scores.",
    parameters: [
      { name: "abc", type: "string", description: "ABC notation string for the music", required: true },
      { name: "title", type: "string", description: "Title of the piece", required: false },
    ],
    handler: async ({ abc, title }) => {
      if (!isAppEnabled("show_sheet_music")) {
        return "Sheet Music tool is currently disabled. Enable it in the Apps tab.";
      }
      console.log("Showing sheet music");
      return await callMCPTool("show_sheet_music", { abc, title });
    },
    render: ({ args, result }) => {
      if (!isAppEnabled("show_sheet_music")) {
        return <DisabledToolMessage toolName="Sheet Music" />;
      }
      return (
        <McpAppHost
          toolName="show_sheet_music"
          toolInput={args}
          toolResult={result}
          height={400}
        />
      );
    },
  });

  // Wikipedia Explorer tool
  useCopilotAction({
    name: "explore_wiki",
    description: "Interactive Wikipedia article explorer with search and navigation. Use this when users ask about topics that would benefit from Wikipedia information.",
    parameters: [
      { name: "query", type: "string", description: "Wikipedia article title or search query", required: true },
      { name: "lang", type: "string", description: "Wikipedia language code (default: 'en')", required: false },
    ],
    handler: async ({ query, lang }) => {
      if (!isAppEnabled("explore_wiki")) {
        return "Wikipedia Explorer tool is currently disabled. Enable it in the Apps tab.";
      }
      console.log("Exploring Wikipedia:", query);
      return await callMCPTool("explore_wiki", { query, lang });
    },
    render: ({ args, result }) => {
      if (!isAppEnabled("explore_wiki")) {
        return <DisabledToolMessage toolName="Wikipedia Explorer" />;
      }
      return (
        <McpAppHost
          toolName="explore_wiki"
          toolInput={args}
          toolResult={result}
          height={500}
        />
      );
    },
  });

  // Budget Allocator tool
  useCopilotAction({
    name: "allocate_budget",
    description: "Interactive budget allocation tool with drag-and-drop categories and visual breakdown charts.",
    parameters: [
      { name: "totalBudget", type: "number", description: "Total budget amount", required: true },
      { name: "currency", type: "string", description: "Currency symbol (default: '$')", required: false },
    ],
    handler: async ({ totalBudget, currency }) => {
      if (!isAppEnabled("allocate_budget")) {
        return "Budget Allocator tool is currently disabled. Enable it in the Apps tab.";
      }
      console.log("Allocating budget:", totalBudget);
      return await callMCPTool("allocate_budget", { totalBudget, currency });
    },
    render: ({ args, result }) => {
      if (!isAppEnabled("allocate_budget")) {
        return <DisabledToolMessage toolName="Budget Allocator" />;
      }
      return (
        <McpAppHost
          toolName="allocate_budget"
          toolInput={args}
          toolResult={result}
          height={500}
        />
      );
    },
  });

  // System Monitor tool
  useCopilotAction({
    name: "show_system_monitor",
    description: "Interactive system monitoring dashboard with CPU, memory, and disk usage charts.",
    parameters: [
      { name: "refreshInterval", type: "number", description: "Refresh interval in milliseconds (default: 1000)", required: false },
    ],
    handler: async ({ refreshInterval }) => {
      if (!isAppEnabled("show_system_monitor")) {
        return "System Monitor tool is currently disabled. Enable it in the Apps tab.";
      }
      console.log("Showing system monitor");
      return await callMCPTool("show_system_monitor", { refreshInterval });
    },
    render: ({ args, result }) => {
      if (!isAppEnabled("show_system_monitor")) {
        return <DisabledToolMessage toolName="System Monitor" />;
      }
      return (
        <McpAppHost
          toolName="show_system_monitor"
          toolInput={args}
          toolResult={result}
          height={400}
        />
      );
    },
  });

  // Transcript Viewer tool
  useCopilotAction({
    name: "show_transcript",
    description: "Interactive transcript viewer with timestamps, speaker labels, and search functionality.",
    parameters: [
      { name: "title", type: "string", description: "Title of the transcript", required: false },
    ],
    handler: async ({ title }) => {
      if (!isAppEnabled("show_transcript")) {
        return "Transcript Viewer tool is currently disabled. Enable it in the Apps tab.";
      }
      console.log("Showing transcript");
      return await callMCPTool("show_transcript", { title });
    },
    render: ({ args, result }) => {
      if (!isAppEnabled("show_transcript")) {
        return <DisabledToolMessage toolName="Transcript Viewer" />;
      }
      return (
        <McpAppHost
          toolName="show_transcript"
          toolInput={args}
          toolResult={result}
          height={400}
        />
      );
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
