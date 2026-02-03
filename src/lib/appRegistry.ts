import { AppConfig, DiagramNode } from "./types";

export const appRegistry: AppConfig[] = [
  {
    id: "get_weather",
    name: "Weather",
    description: "Get current weather for any city worldwide. Shows temperature, conditions, humidity, and wind speed.",
    icon: "sun",
    category: "data",
    toolName: "get_weather",
    hasUI: true,
    parameters: [
      {
        name: "location",
        type: "string",
        description: "The city and country (e.g., 'London, UK')",
        required: true,
      },
    ],
  },
  {
    id: "calculate",
    name: "Calculator",
    description: "Perform mathematical calculations. Supports addition, subtraction, multiplication, division, and more.",
    icon: "calculator",
    category: "utility",
    toolName: "calculate",
    hasUI: true,
    parameters: [
      {
        name: "expression",
        type: "string",
        description: "The mathematical expression to evaluate",
        required: true,
      },
    ],
  },
  {
    id: "get_time",
    name: "World Clock",
    description: "Get the current time for any timezone around the world.",
    icon: "clock",
    category: "utility",
    toolName: "get_time",
    hasUI: false,
    parameters: [
      {
        name: "timezone",
        type: "string",
        description: "The timezone (e.g., 'America/New_York')",
        required: true,
      },
    ],
  },
  {
    id: "generate_uuid",
    name: "UUID Generator",
    description: "Generate random unique identifiers (UUIDs) for your applications.",
    icon: "key",
    category: "utility",
    toolName: "generate_uuid",
    hasUI: false,
    parameters: [],
  },
  {
    id: "word_count",
    name: "Word Counter",
    description: "Count words, characters, and lines in any text. Useful for writing analysis.",
    icon: "file-text",
    category: "utility",
    toolName: "word_count",
    hasUI: false,
    parameters: [
      {
        name: "text",
        type: "string",
        description: "The text to analyze",
        required: true,
      },
    ],
  },
];

export const architectureNodes: DiagramNode[] = [
  {
    id: "user",
    label: "User",
    icon: "user",
    description: "Browser Client",
    details: [
      "Interacts with chat interface",
      "Sends natural language queries",
      "Receives AI responses and tool results",
    ],
  },
  {
    id: "copilotkit",
    label: "CopilotKit",
    icon: "message-square",
    description: "AI Chat Interface",
    details: [
      "React components for chat UI",
      "useCopilotAction hooks for tools",
      "Streaming AI responses",
      "Tool execution rendering",
    ],
  },
  {
    id: "nextjs",
    label: "Next.js API",
    icon: "server",
    description: "API Routes",
    details: [
      "/api/copilotkit - AI runtime",
      "/api/mcp - Tool execution",
      "/api/mcp-resource - UI loading",
      "Google Gemini integration",
    ],
  },
  {
    id: "mcp",
    label: "MCP Server",
    icon: "database",
    description: "Express Server :3100",
    details: [
      "Tool definitions & handlers",
      "Resource serving (HTML UIs)",
      "MCP protocol implementation",
      "Structured data responses",
    ],
  },
  {
    id: "tools",
    label: "Tools",
    icon: "wrench",
    description: "Available MCP Tools",
    details: [
      "get_weather - Weather data",
      "calculate - Math operations",
      "get_time - Timezone info",
      "generate_uuid - ID generation",
      "word_count - Text analysis",
    ],
  },
];

export function getAppById(id: string): AppConfig | undefined {
  return appRegistry.find((app) => app.id === id);
}

export function getAppsByCategory(category: AppConfig["category"]): AppConfig[] {
  return appRegistry.filter((app) => app.category === category);
}

export function getAllAppIds(): string[] {
  return appRegistry.map((app) => app.id);
}
