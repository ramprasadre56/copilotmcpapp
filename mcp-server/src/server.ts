import express from "express";
import cors from "cors";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to built UI apps
const DIST_DIR = path.join(__dirname, "..", "dist", "apps");
const EXT_APPS_DIR = path.join(__dirname, "..", "dist", "ext-apps");

// Tool definitions with UI metadata
const tools = [
  // ===== Original Tools =====
  {
    name: "get_weather",
    description: "Get the current weather for a location",
    inputSchema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city and country (e.g., 'London, UK')",
        },
      },
      required: ["location"],
    },
    _meta: {
      ui: {
        resourceUri: "ui://weather/app.html",
      },
    },
  },
  {
    name: "calculate",
    description: "Perform a mathematical calculation",
    inputSchema: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "The mathematical expression to evaluate (e.g., '2 + 2 * 3')",
        },
      },
      required: ["expression"],
    },
    _meta: {
      ui: {
        resourceUri: "ui://calculator/app.html",
      },
    },
  },
  {
    name: "get_time",
    description: "Get the current time for a timezone",
    inputSchema: {
      type: "object",
      properties: {
        timezone: {
          type: "string",
          description: "The timezone (e.g., 'America/New_York', 'Europe/London')",
        },
      },
      required: ["timezone"],
    },
  },
  {
    name: "generate_uuid",
    description: "Generate a random UUID",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "word_count",
    description: "Count words, characters, and lines in text",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The text to analyze",
        },
      },
      required: ["text"],
    },
  },

  // ===== Map Tools (from ext-apps/map-server) =====
  {
    name: "show_map",
    description: "Display an interactive world map zoomed to a specific bounding box. Use the geocode tool to find the bounding box of a location.",
    inputSchema: {
      type: "object",
      properties: {
        west: { type: "number", description: "Western longitude (-180 to 180)" },
        south: { type: "number", description: "Southern latitude (-90 to 90)" },
        east: { type: "number", description: "Eastern longitude (-180 to 180)" },
        north: { type: "number", description: "Northern latitude (-90 to 90)" },
        label: { type: "string", description: "Optional label to display on the map" },
      },
    },
    _meta: {
      ui: {
        resourceUri: "ui://map/app.html",
      },
    },
  },
  {
    name: "geocode",
    description: "Search for places using OpenStreetMap. Returns coordinates and bounding boxes for up to 5 matches.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Place name or address to search for (e.g., 'Paris', 'Golden Gate Bridge')",
        },
      },
      required: ["query"],
    },
  },

  // ===== Three.js Tools (from ext-apps/threejs-server) =====
  {
    name: "show_threejs_scene",
    description: "Render an interactive 3D scene with custom Three.js code. Available globals: THREE, OrbitControls, canvas, width, height.",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "JavaScript code to render the 3D scene",
        },
        height: {
          type: "number",
          description: "Height in pixels (default: 400)",
        },
      },
      required: ["code"],
    },
    _meta: {
      ui: {
        resourceUri: "ui://threejs/app.html",
      },
    },
  },

  // ===== PDF Tools (from ext-apps/pdf-server) =====
  {
    name: "display_pdf",
    description: "Display an interactive PDF viewer. Supports PDFs from arxiv.org, biorxiv.org, and other academic sources.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "PDF URL (e.g., 'https://arxiv.org/pdf/1706.03762')",
        },
        page: {
          type: "number",
          description: "Initial page number (default: 1)",
        },
      },
      required: ["url"],
    },
    _meta: {
      ui: {
        resourceUri: "ui://pdf/app.html",
      },
    },
  },

  // ===== Shadertoy Tools (from ext-apps/shadertoy-server) =====
  {
    name: "show_shader",
    description: "Render an interactive WebGL shader. Write GLSL fragment shader code with access to uniforms like iTime, iResolution, iMouse.",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "GLSL fragment shader code (mainImage function)",
        },
        height: {
          type: "number",
          description: "Height in pixels (default: 400)",
        },
      },
      required: ["code"],
    },
    _meta: {
      ui: {
        resourceUri: "ui://shadertoy/app.html",
      },
    },
  },

  // ===== Sheet Music Tools (from ext-apps/sheet-music-server) =====
  {
    name: "show_sheet_music",
    description: "Display interactive sheet music notation using ABC notation format.",
    inputSchema: {
      type: "object",
      properties: {
        abc: {
          type: "string",
          description: "ABC notation string for the music",
        },
        title: {
          type: "string",
          description: "Title of the piece",
        },
      },
      required: ["abc"],
    },
    _meta: {
      ui: {
        resourceUri: "ui://sheet-music/app.html",
      },
    },
  },

  // ===== Wiki Explorer Tools (from ext-apps/wiki-explorer-server) =====
  {
    name: "explore_wiki",
    description: "Display an interactive Wikipedia article explorer with search and navigation.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Wikipedia article title or search query",
        },
        lang: {
          type: "string",
          description: "Wikipedia language code (default: 'en')",
        },
      },
      required: ["query"],
    },
    _meta: {
      ui: {
        resourceUri: "ui://wiki/app.html",
      },
    },
  },

  // ===== Budget Allocator Tools (from ext-apps/budget-allocator-server) =====
  {
    name: "allocate_budget",
    description: "Display an interactive budget allocation tool with drag-and-drop categories and visual breakdown.",
    inputSchema: {
      type: "object",
      properties: {
        totalBudget: {
          type: "number",
          description: "Total budget amount",
        },
        categories: {
          type: "array",
          description: "Budget categories with names and initial allocations",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              amount: { type: "number" },
            },
          },
        },
        currency: {
          type: "string",
          description: "Currency symbol (default: '$')",
        },
      },
      required: ["totalBudget"],
    },
    _meta: {
      ui: {
        resourceUri: "ui://budget/app.html",
      },
    },
  },

  // ===== System Monitor Tools (from ext-apps/system-monitor-server) =====
  {
    name: "show_system_monitor",
    description: "Display an interactive system monitoring dashboard with CPU, memory, and disk usage charts.",
    inputSchema: {
      type: "object",
      properties: {
        refreshInterval: {
          type: "number",
          description: "Refresh interval in milliseconds (default: 1000)",
        },
      },
    },
    _meta: {
      ui: {
        resourceUri: "ui://system-monitor/app.html",
      },
    },
  },
  {
    name: "poll-system-stats",
    description: "Poll current system CPU and memory statistics for the system monitor.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  // ===== Transcript Tools (from ext-apps/transcript-server) =====
  {
    name: "show_transcript",
    description: "Display an interactive transcript viewer with timestamps, speaker labels, and search functionality.",
    inputSchema: {
      type: "object",
      properties: {
        transcript: {
          type: "array",
          description: "Array of transcript segments",
          items: {
            type: "object",
            properties: {
              speaker: { type: "string" },
              text: { type: "string" },
              timestamp: { type: "number" },
            },
          },
        },
        title: {
          type: "string",
          description: "Title of the transcript",
        },
      },
      required: ["transcript"],
    },
    _meta: {
      ui: {
        resourceUri: "ui://transcript/app.html",
      },
    },
  },

  // ===== Cohort Heatmap Tools (from ext-apps/cohort-heatmap-server) =====
  {
    name: "show_cohort_heatmap",
    description: "Display an interactive cohort retention heatmap showing customer retention over time by signup month.",
    inputSchema: {
      type: "object",
      properties: {
        metric: {
          type: "string",
          enum: ["retention", "revenue", "active"],
          description: "Metric type (default: 'retention')",
        },
        periodType: {
          type: "string",
          enum: ["monthly", "weekly"],
          description: "Period type (default: 'monthly')",
        },
        cohortCount: {
          type: "number",
          description: "Number of cohorts to display (default: 12)",
        },
        maxPeriods: {
          type: "number",
          description: "Maximum number of periods (default: 12)",
        },
      },
    },
    _meta: {
      ui: {
        resourceUri: "ui://cohort-heatmap/app.html",
      },
    },
  },

  // ===== Scenario Modeler Tools (from ext-apps/scenario-modeler-server) =====
  {
    name: "show_scenario_modeler",
    description: "Display an interactive SaaS business scenario modeler with financial projections and template scenarios.",
    inputSchema: {
      type: "object",
      properties: {
        startingMRR: {
          type: "number",
          description: "Starting monthly recurring revenue",
        },
        monthlyGrowthRate: {
          type: "number",
          description: "Monthly growth rate percentage",
        },
        monthlyChurnRate: {
          type: "number",
          description: "Monthly churn rate percentage",
        },
        grossMargin: {
          type: "number",
          description: "Gross margin percentage",
        },
        fixedCosts: {
          type: "number",
          description: "Monthly fixed costs",
        },
      },
    },
    _meta: {
      ui: {
        resourceUri: "ui://scenario-modeler/app.html",
      },
    },
  },

  // ===== Customer Segmentation Tools (from ext-apps/customer-segmentation-server) =====
  {
    name: "show_customer_segmentation",
    description: "Display an interactive customer segmentation explorer with scatter/bubble visualization.",
    inputSchema: {
      type: "object",
      properties: {
        customerCount: {
          type: "number",
          description: "Number of customers to generate (default: 250)",
        },
      },
    },
    _meta: {
      ui: {
        resourceUri: "ui://customer-segmentation/app.html",
      },
    },
  },
];

// Nominatim rate limiting
let lastNominatimRequest = 0;
const NOMINATIM_RATE_LIMIT_MS = 1100;

// Tool handlers
async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<{
  content: Array<{ type: string; text: string }>;
  structuredContent?: unknown;
  isError?: boolean;
  _meta?: Record<string, unknown>;
}> {
  switch (name) {
    case "get_weather": {
      const weatherData = {
        location: args.location as string,
        temperature: Math.round(Math.random() * 30 + 5),
        condition: ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"][
          Math.floor(Math.random() * 4)
        ],
        humidity: Math.round(Math.random() * 50 + 30),
        windSpeed: Math.round(Math.random() * 30 + 5),
      };
      return {
        content: [{ type: "text", text: JSON.stringify(weatherData, null, 2) }],
        structuredContent: weatherData,
      };
    }

    case "calculate": {
      try {
        const expression = (args.expression as string).replace(
          /[^0-9+\-*/().%\s]/g,
          ""
        );
        const result = Function(`"use strict"; return (${expression})`)();
        return {
          content: [{ type: "text", text: `Result: ${result}` }],
          structuredContent: { expression, result },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : "Invalid expression"}`,
            },
          ],
          isError: true,
        };
      }
    }

    case "get_time": {
      try {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
          timeZone: args.timezone as string,
          dateStyle: "full",
          timeStyle: "long",
        };
        const timeString = now.toLocaleString("en-US", options);
        return {
          content: [
            {
              type: "text",
              text: `Current time in ${args.timezone}: ${timeString}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : "Invalid timezone"}`,
            },
          ],
          isError: true,
        };
      }
    }

    case "generate_uuid": {
      const uuid = crypto.randomUUID();
      return {
        content: [{ type: "text", text: `Generated UUID: ${uuid}` }],
      };
    }

    case "word_count": {
      const text = (args.text as string) || "";
      const words = text
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length;
      const stats = {
        words,
        characters: text.length,
        lines: text.split(/\n/).length,
      };
      return {
        content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
        structuredContent: stats,
      };
    }

    // ===== Map Tools =====
    case "show_map": {
      const west = (args.west as number) ?? -0.5;
      const south = (args.south as number) ?? 51.3;
      const east = (args.east as number) ?? 0.3;
      const north = (args.north as number) ?? 51.7;
      const label = args.label as string | undefined;

      return {
        content: [
          {
            type: "text",
            text: `Displaying map at: W:${west.toFixed(4)}, S:${south.toFixed(4)}, E:${east.toFixed(4)}, N:${north.toFixed(4)}${label ? ` (${label})` : ""}`,
          },
        ],
        structuredContent: { west, south, east, north, label },
        _meta: { viewUUID: crypto.randomUUID() },
      };
    }

    case "geocode": {
      try {
        // Rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - lastNominatimRequest;
        if (timeSinceLastRequest < NOMINATIM_RATE_LIMIT_MS) {
          await new Promise((resolve) =>
            setTimeout(resolve, NOMINATIM_RATE_LIMIT_MS - timeSinceLastRequest)
          );
        }
        lastNominatimRequest = Date.now();

        const query = args.query as string;
        const params = new URLSearchParams({
          q: query,
          format: "json",
          limit: "5",
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          {
            headers: {
              "User-Agent": "MCP-CopilotKit-App/1.0",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Nominatim API error: ${response.status}`);
        }

        const results = await response.json() as Array<{
          display_name: string;
          lat: string;
          lon: string;
          boundingbox: [string, string, string, string];
          type: string;
          importance: number;
        }>;

        if (results.length === 0) {
          return {
            content: [{ type: "text", text: `No results found for "${query}"` }],
          };
        }

        const formattedResults = results.map((r) => ({
          displayName: r.display_name,
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon),
          boundingBox: {
            south: parseFloat(r.boundingbox[0]),
            north: parseFloat(r.boundingbox[1]),
            west: parseFloat(r.boundingbox[2]),
            east: parseFloat(r.boundingbox[3]),
          },
          type: r.type,
          importance: r.importance,
        }));

        const textContent = formattedResults
          .map(
            (r, i) =>
              `${i + 1}. ${r.displayName}\n   Coordinates: ${r.lat.toFixed(6)}, ${r.lon.toFixed(6)}\n   Bounding box: W:${r.boundingBox.west.toFixed(4)}, S:${r.boundingBox.south.toFixed(4)}, E:${r.boundingBox.east.toFixed(4)}, N:${r.boundingBox.north.toFixed(4)}`
          )
          .join("\n\n");

        return {
          content: [{ type: "text", text: textContent }],
          structuredContent: { results: formattedResults },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Geocoding error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }

    // ===== Three.js Tools =====
    case "show_threejs_scene": {
      const code = (args.code as string) || "";
      const height = (args.height as number) || 400;
      return {
        content: [{ type: "text", text: "Three.js scene rendered" }],
        structuredContent: { code, height, success: true },
        _meta: { viewUUID: crypto.randomUUID() },
      };
    }

    // ===== PDF Tools =====
    case "display_pdf": {
      const url = (args.url as string) || "https://arxiv.org/pdf/1706.03762";
      const page = (args.page as number) || 1;

      // Normalize arxiv URLs
      const normalizedUrl = url.replace("/abs/", "/pdf/").replace(/\.pdf$/, "");

      return {
        content: [{ type: "text", text: `Displaying PDF: ${normalizedUrl}` }],
        structuredContent: { url: normalizedUrl, initialPage: page },
        _meta: { viewUUID: crypto.randomUUID() },
      };
    }

    // ===== Shadertoy Tools =====
    case "show_shader": {
      const code = (args.code as string) || "";
      const height = (args.height as number) || 400;
      return {
        content: [{ type: "text", text: "Shader rendered" }],
        structuredContent: { code, height, success: true },
        _meta: { viewUUID: crypto.randomUUID() },
      };
    }

    // ===== Sheet Music Tools =====
    case "show_sheet_music": {
      const abc = (args.abc as string) || "";
      const title = (args.title as string) || "Untitled";
      return {
        content: [{ type: "text", text: `Displaying sheet music: ${title}` }],
        structuredContent: { abc, title },
        _meta: { viewUUID: crypto.randomUUID() },
      };
    }

    // ===== Wiki Explorer Tools =====
    case "explore_wiki": {
      const query = (args.query as string) || "";
      const lang = (args.lang as string) || "en";
      return {
        content: [{ type: "text", text: `Exploring Wikipedia: ${query}` }],
        structuredContent: { query, lang },
        _meta: { viewUUID: crypto.randomUUID() },
      };
    }

    // ===== Budget Allocator Tools =====
    case "allocate_budget": {
      const totalBudget = (args.totalBudget as number) || 10000;
      const categories = (args.categories as Array<{ name: string; amount: number }>) || [
        { name: "Marketing", amount: 3000 },
        { name: "Development", amount: 4000 },
        { name: "Operations", amount: 2000 },
        { name: "Other", amount: 1000 },
      ];
      const currency = (args.currency as string) || "$";
      return {
        content: [{ type: "text", text: `Budget allocator loaded with ${currency}${totalBudget}` }],
        structuredContent: { totalBudget, categories, currency },
        _meta: { viewUUID: crypto.randomUUID() },
      };
    }

    // ===== System Monitor Tools =====
    case "show_system_monitor": {
      // Return static system info for the UI
      const cpus = os.cpus();
      const systemInfo = {
        hostname: os.hostname(),
        platform: `${os.type()} ${os.release()}`,
        arch: os.arch(),
        cpu: {
          model: cpus[0]?.model || "Unknown",
          count: cpus.length,
        },
        memory: {
          totalBytes: os.totalmem(),
        },
      };
      return {
        content: [{ type: "text", text: "System monitor started" }],
        structuredContent: systemInfo,
        _meta: { viewUUID: crypto.randomUUID() },
      };
    }

    case "poll-system-stats": {
      // Return dynamic CPU and memory stats
      const cpuInfo = os.cpus();
      const cores = cpuInfo.map((cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        return { idle: cpu.times.idle, total };
      });
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      return {
        content: [{ type: "text", text: "System stats polled" }],
        structuredContent: {
          cpu: { cores },
          memory: {
            usedBytes: usedMem,
            usedPercent: Math.round((usedMem / totalMem) * 100),
            freeBytes: freeMem,
          },
          uptime: { seconds: Math.floor(os.uptime()) },
          timestamp: new Date().toISOString(),
        },
      };
    }

    // ===== Transcript Tools =====
    case "show_transcript": {
      const transcript = (args.transcript as Array<{ speaker: string; text: string; timestamp: number }>) || [];
      const title = (args.title as string) || "Transcript";
      return {
        content: [{ type: "text", text: `Displaying transcript: ${title}` }],
        structuredContent: { transcript, title },
        _meta: { viewUUID: crypto.randomUUID() },
      };
    }

    // ===== Cohort Heatmap Tools =====
    case "show_cohort_heatmap": {
      const metric = (args.metric as string) || "retention";
      const periodType = (args.periodType as string) || "monthly";
      const cohortCount = (args.cohortCount as number) || 12;
      const maxPeriods = (args.maxPeriods as number) || 12;
      return {
        content: [{ type: "text", text: `Displaying cohort heatmap: ${metric} over ${periodType} periods` }],
        structuredContent: { metric, periodType, cohortCount, maxPeriods },
        _meta: { viewUUID: crypto.randomUUID() },
      };
    }

    // ===== Scenario Modeler Tools =====
    case "show_scenario_modeler": {
      const startingMRR = (args.startingMRR as number) || 50000;
      const monthlyGrowthRate = (args.monthlyGrowthRate as number) || 5;
      const monthlyChurnRate = (args.monthlyChurnRate as number) || 3;
      const grossMargin = (args.grossMargin as number) || 80;
      const fixedCosts = (args.fixedCosts as number) || 30000;
      return {
        content: [{ type: "text", text: `SaaS Scenario Modeler loaded with $${startingMRR} MRR` }],
        structuredContent: { startingMRR, monthlyGrowthRate, monthlyChurnRate, grossMargin, fixedCosts },
        _meta: { viewUUID: crypto.randomUUID() },
      };
    }

    // ===== Customer Segmentation Tools =====
    case "show_customer_segmentation": {
      const customerCount = (args.customerCount as number) || 250;
      return {
        content: [{ type: "text", text: `Customer Segmentation Explorer loaded with ${customerCount} customers` }],
        structuredContent: { customerCount },
        _meta: { viewUUID: crypto.randomUUID() },
      };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
}

// Resource URI to file path mapping
const resourceMapping: Record<string, { dir: string; file: string }> = {
  "ui://weather/app.html": { dir: DIST_DIR, file: "weather/index.html" },
  "ui://calculator/app.html": { dir: DIST_DIR, file: "calculator/index.html" },
  "ui://map/app.html": { dir: DIST_DIR, file: "map/index.html" },
  "ui://threejs/app.html": { dir: DIST_DIR, file: "threejs/index.html" },
  "ui://pdf/app.html": { dir: DIST_DIR, file: "pdf/index.html" },
  "ui://shadertoy/app.html": { dir: DIST_DIR, file: "shadertoy/index.html" },
  "ui://sheet-music/app.html": { dir: DIST_DIR, file: "sheet-music/index.html" },
  "ui://wiki/app.html": { dir: DIST_DIR, file: "wiki/index.html" },
  "ui://budget/app.html": { dir: DIST_DIR, file: "budget/index.html" },
  "ui://system-monitor/app.html": { dir: DIST_DIR, file: "system-monitor/index.html" },
  "ui://transcript/app.html": { dir: DIST_DIR, file: "transcript/index.html" },
  "ui://cohort-heatmap/app.html": { dir: DIST_DIR, file: "cohort-heatmap/index.html" },
  "ui://scenario-modeler/app.html": { dir: DIST_DIR, file: "scenario-modeler/index.html" },
  "ui://customer-segmentation/app.html": { dir: DIST_DIR, file: "customer-segmentation/index.html" },
};

// Read UI resource
async function readResource(uri: string): Promise<string | null> {
  // Check mapping first
  const mapping = resourceMapping[uri];
  if (mapping) {
    const filePath = path.join(mapping.dir, mapping.file);
    try {
      return await fs.readFile(filePath, "utf-8");
    } catch {
      console.error(`Failed to read mapped resource: ${filePath}`);
    }
  }

  // Fallback: Parse uri like "ui://weather/app.html"
  const match = uri.match(/^ui:\/\/([^/]+)\/(.+)$/);
  if (!match) return null;

  const [, appName] = match;

  // Try ext-apps directory first
  const extAppsPath = path.join(EXT_APPS_DIR, `${appName}.html`);
  try {
    return await fs.readFile(extAppsPath, "utf-8");
  } catch {
    // Try original apps directory (new structure)
    const appsPath = path.join(DIST_DIR, appName, "index.html");
    try {
      return await fs.readFile(appsPath, "utf-8");
    } catch {
      console.error(`Failed to read resource: ${uri}`);
      return null;
    }
  }
}

// Create Express server
async function runHttp() {
  const app = express();
  
  // CORS configuration for production
  app.use(cors({
    origin: true, // Allow all origins for now
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));
  
  // Handle preflight requests
  app.options('*', cors());
  
  app.use(express.json());

  const PORT = process.env.PORT || 3100;
  const HOST = '0.0.0.0'; // Bind to all interfaces for Cloud Run

  // MCP endpoint
  app.post("/mcp", async (req, res) => {
    try {
      const { method, params } = req.body;

      if (method === "tools/list") {
        res.json({ tools });
      } else if (method === "tools/call") {
        const result = await handleToolCall(params.name, params.arguments || {});
        res.json(result);
      } else if (method === "resources/read") {
        const uri = params?.uri as string;
        const html = await readResource(uri);
        if (html) {
          res.json({
            contents: [
              {
                uri,
                mimeType: "text/html",
                text: html,
              },
            ],
          });
        } else {
          res.status(404).json({ error: "Resource not found" });
        }
      } else if (method === "resources/list") {
        // List available UI resources
        const resources = tools
          .filter((t) => t._meta?.ui?.resourceUri)
          .map((t) => ({
            uri: t._meta!.ui!.resourceUri,
            name: `${t.name} UI`,
            mimeType: "text/html",
          }));
        res.json({ resources });
      } else {
        res.status(400).json({ error: "Unknown method" });
      }
    } catch (error) {
      console.error("MCP error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Direct resource endpoint (for easier access)
  app.get("/resource/:appName", async (req, res) => {
    const appName = req.params.appName;

    // Try ext-apps directory first
    let html = null;
    const extAppsPath = path.join(EXT_APPS_DIR, `${appName}.html`);
    try {
      html = await fs.readFile(extAppsPath, "utf-8");
    } catch {
      // Try original apps directory
      const uri = `ui://${appName}/app.html`;
      html = await readResource(uri);
    }

    if (html) {
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Cache-Control", "no-store");
      res.send(html);
    } else {
      res.status(404).send("Resource not found");
    }
  });

  // Health check
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      server: "mcp-apps-server",
      version: "3.0.0",
      tools: tools.map(t => t.name),
    });
  });

  app.listen(PORT as number, HOST, () => {
    console.log(`MCP Apps Server running on http://${HOST}:${PORT}`);
    console.log(`MCP endpoint: http://${HOST}:${PORT}/mcp`);
    console.log(`Resources: http://${HOST}:${PORT}/resource/{appName}`);
    console.log(`Available tools: ${tools.map(t => t.name).join(", ")}`);
  });
}

runHttp();
