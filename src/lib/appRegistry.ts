import { AppConfig, DiagramNode } from "./types";

export const appRegistry: AppConfig[] = [
  // ===== Original Tools =====
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

  // ===== Map Tools (from ext-apps) =====
  {
    id: "show_map",
    name: "Interactive Map",
    description: "Display an interactive 3D globe map. Search locations using geocode first, then visualize on the map.",
    icon: "globe",
    category: "data",
    toolName: "show_map",
    hasUI: true,
    parameters: [
      {
        name: "west",
        type: "number",
        description: "Western longitude (-180 to 180)",
        required: false,
      },
      {
        name: "south",
        type: "number",
        description: "Southern latitude (-90 to 90)",
        required: false,
      },
      {
        name: "east",
        type: "number",
        description: "Eastern longitude (-180 to 180)",
        required: false,
      },
      {
        name: "north",
        type: "number",
        description: "Northern latitude (-90 to 90)",
        required: false,
      },
      {
        name: "label",
        type: "string",
        description: "Optional label to display on the map",
        required: false,
      },
    ],
  },
  {
    id: "geocode",
    name: "Geocoder",
    description: "Search for places using OpenStreetMap. Returns coordinates and bounding boxes for locations.",
    icon: "search",
    category: "data",
    toolName: "geocode",
    hasUI: false,
    parameters: [
      {
        name: "query",
        type: "string",
        description: "Place name or address to search",
        required: true,
      },
    ],
  },

  // ===== Three.js Tools (from ext-apps) =====
  {
    id: "show_threejs_scene",
    name: "3D Scene Viewer",
    description: "Render interactive 3D scenes with Three.js. Create custom visualizations with JavaScript code.",
    icon: "cube",
    category: "ai",
    toolName: "show_threejs_scene",
    hasUI: true,
    parameters: [
      {
        name: "code",
        type: "string",
        description: "JavaScript code to render the 3D scene",
        required: true,
      },
      {
        name: "height",
        type: "number",
        description: "Height in pixels (default: 400)",
        required: false,
      },
    ],
  },

  // ===== PDF Tools (from ext-apps) =====
  {
    id: "display_pdf",
    name: "PDF Viewer",
    description: "Display interactive PDF documents. Supports academic sources like arxiv.org, biorxiv.org.",
    icon: "file-text",
    category: "data",
    toolName: "display_pdf",
    hasUI: true,
    parameters: [
      {
        name: "url",
        type: "string",
        description: "PDF URL (e.g., 'https://arxiv.org/pdf/1706.03762')",
        required: true,
      },
      {
        name: "page",
        type: "number",
        description: "Initial page number (default: 1)",
        required: false,
      },
    ],
  },

  // ===== Shadertoy Tools (from ext-apps) =====
  {
    id: "show_shader",
    name: "Shader Playground",
    description: "Render interactive WebGL shaders. Write GLSL code with access to uniforms like iTime, iResolution.",
    icon: "layers",
    category: "ai",
    toolName: "show_shader",
    hasUI: true,
    parameters: [
      {
        name: "code",
        type: "string",
        description: "GLSL fragment shader code",
        required: true,
      },
      {
        name: "height",
        type: "number",
        description: "Height in pixels (default: 400)",
        required: false,
      },
    ],
  },

  // ===== Sheet Music Tools (from ext-apps) =====
  {
    id: "show_sheet_music",
    name: "Sheet Music",
    description: "Display interactive sheet music notation using ABC notation format. Play and view music scores.",
    icon: "music",
    category: "ai",
    toolName: "show_sheet_music",
    hasUI: true,
    parameters: [
      {
        name: "abc",
        type: "string",
        description: "ABC notation string for the music",
        required: true,
      },
      {
        name: "title",
        type: "string",
        description: "Title of the piece",
        required: false,
      },
    ],
  },

  // ===== Wiki Explorer Tools (from ext-apps) =====
  {
    id: "explore_wiki",
    name: "Wikipedia Explorer",
    description: "Interactive Wikipedia article explorer with search and navigation capabilities.",
    icon: "book-open",
    category: "data",
    toolName: "explore_wiki",
    hasUI: true,
    parameters: [
      {
        name: "query",
        type: "string",
        description: "Wikipedia article title or search query",
        required: true,
      },
      {
        name: "lang",
        type: "string",
        description: "Wikipedia language code (default: 'en')",
        required: false,
      },
    ],
  },

  // ===== Budget Allocator Tools (from ext-apps) =====
  {
    id: "allocate_budget",
    name: "Budget Allocator",
    description: "Interactive budget allocation tool with drag-and-drop categories and visual breakdown charts.",
    icon: "dollar-sign",
    category: "utility",
    toolName: "allocate_budget",
    hasUI: true,
    parameters: [
      {
        name: "totalBudget",
        type: "number",
        description: "Total budget amount",
        required: true,
      },
      {
        name: "currency",
        type: "string",
        description: "Currency symbol (default: '$')",
        required: false,
      },
    ],
  },

  // ===== System Monitor Tools (from ext-apps) =====
  {
    id: "show_system_monitor",
    name: "System Monitor",
    description: "Interactive system monitoring dashboard with CPU, memory, and disk usage charts.",
    icon: "activity",
    category: "integration",
    toolName: "show_system_monitor",
    hasUI: true,
    parameters: [
      {
        name: "refreshInterval",
        type: "number",
        description: "Refresh interval in milliseconds (default: 1000)",
        required: false,
      },
    ],
  },

  // ===== Transcript Tools (from ext-apps) =====
  {
    id: "show_transcript",
    name: "Transcript Viewer",
    description: "Interactive transcript viewer with timestamps, speaker labels, and search functionality.",
    icon: "message-square",
    category: "data",
    toolName: "show_transcript",
    hasUI: true,
    parameters: [
      {
        name: "title",
        type: "string",
        description: "Title of the transcript",
        required: false,
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
      "Weather, Calculator, Clock",
      "Map & Geocoder",
      "3D Viewer & Shaders",
      "PDF & Wiki Explorer",
      "Budget & System Monitor",
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
