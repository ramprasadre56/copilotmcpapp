"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotAction } from "@copilotkit/react-core";
import { McpAppHost } from "@/components/McpAppHost";

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

// UI Components for tool results
function WeatherCard({ location, data }: { location: string; data: string | object }) {
  let weatherInfo: { location?: string; temperature?: number; condition?: string; humidity?: number; windSpeed?: number };

  if (typeof data === "object") {
    weatherInfo = data as typeof weatherInfo;
  } else {
    try {
      weatherInfo = JSON.parse(data);
    } catch {
      return <div className="p-4 bg-blue-50 rounded-lg text-gray-700">{data}</div>;
    }
  }

  return (
    <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl text-white shadow-lg max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{weatherInfo.location || location}</h3>
        <span className="text-3xl">
          {weatherInfo.condition === "Sunny" ? "☀️" :
           weatherInfo.condition === "Cloudy" ? "☁️" :
           weatherInfo.condition === "Rainy" ? "🌧️" : "⛅"}
        </span>
      </div>
      <div className="text-4xl font-bold mb-2">{weatherInfo.temperature}°C</div>
      <div className="text-sm opacity-90">{weatherInfo.condition}</div>
      <div className="flex gap-4 mt-3 text-sm">
        <span>💧 {weatherInfo.humidity}%</span>
        <span>💨 {weatherInfo.windSpeed} km/h</span>
      </div>
    </div>
  );
}

function CalculatorCard({ expression, result }: { expression: string; result: string | object }) {
  const displayResult = typeof result === "object" ? JSON.stringify(result) : result;
  return (
    <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white shadow-lg max-w-sm">
      <div className="text-sm opacity-80 mb-1">Calculator</div>
      <div className="text-lg font-mono bg-white/20 rounded px-3 py-2 mb-2">{expression}</div>
      <div className="text-3xl font-bold">{displayResult}</div>
    </div>
  );
}

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

export default function Home() {
  // Register MCP tools as CopilotKit actions with UI rendering
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
      console.log("Getting weather for:", location);
      return await callMCPTool("get_weather", { location });
    },
    render: ({ args, result }) => {
      // Use interactive MCP App for weather
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
      console.log("Calculating:", expression);
      return await callMCPTool("calculate", { expression });
    },
    render: ({ args, result }) => {
      // Use interactive MCP App for calculator
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
      console.log("Getting time for:", timezone);
      return await callMCPTool("get_time", { timezone });
    },
    render: ({ args, result }) => {
      if (!result) return <div className="text-gray-500">Getting time...</div>;
      return <TimeCard timezone={args.timezone || ""} time={result} />;
    },
  });

  useCopilotAction({
    name: "generate_uuid",
    description: "Generate a random UUID. Use this when the user asks for a unique identifier or UUID.",
    parameters: [],
    handler: async () => {
      console.log("Generating UUID");
      return await callMCPTool("generate_uuid", {});
    },
    render: ({ result }) => {
      if (!result) return <div className="text-gray-500">Generating UUID...</div>;
      return <UUIDCard uuid={result} />;
    },
  });

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
      console.log("Counting words in text");
      return await callMCPTool("word_count", { text });
    },
    render: ({ result }) => {
      if (!result) return <div className="text-gray-500">Counting words...</div>;
      return <WordCountCard data={result} />;
    },
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              CopilotKit MCP Apps
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Interactive AI-powered applications with Model Context Protocol
            </p>
          </header>

          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">
              Getting Started
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Open the chat sidebar on the right to interact with your AI copilot.
              The copilot can help you with various tasks and has access to MCP tools.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureCard
                title="MCP Integration"
                description="Connect to MCP servers to extend your AI's capabilities with custom tools."
              />
              <FeatureCard
                title="Generative UI"
                description="AI can generate interactive UI components directly in the chat."
              />
              <FeatureCard
                title="Real-time Streaming"
                description="Get instant responses with streaming AI completions."
              />
              <FeatureCard
                title="Tool Execution"
                description="Execute tools and see results rendered in the chat interface."
              />
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">
              Available Tools
            </h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
              <li><strong>get_weather</strong> - Get weather for any city</li>
              <li><strong>calculate</strong> - Perform math calculations</li>
              <li><strong>get_time</strong> - Get current time in any timezone</li>
              <li><strong>generate_uuid</strong> - Generate unique identifiers</li>
              <li><strong>word_count</strong> - Count words in text</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">
              How It Works
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-slate-600 dark:text-slate-300">
              <li>Configure your MCP server URL in the environment variables</li>
              <li>Start your MCP server that provides tools and capabilities</li>
              <li>Open the chat sidebar and start interacting with your copilot</li>
              <li>The AI will use MCP tools to assist you with tasks</li>
            </ol>
          </section>
        </div>
      </main>

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

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
      <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm">
        {description}
      </p>
    </div>
  );
}
