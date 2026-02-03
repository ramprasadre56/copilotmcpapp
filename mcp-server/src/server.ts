import express from "express";
import cors from "cors";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to built UI apps
const DIST_DIR = path.join(__dirname, "..", "dist", "apps");

// Tool definitions with UI metadata
const tools = [
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
];

// Tool handlers
async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<{
  content: Array<{ type: string; text: string }>;
  structuredContent?: unknown;
  isError?: boolean;
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

    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
}

// Read UI resource
async function readResource(uri: string): Promise<string | null> {
  // Parse uri like "ui://weather/app.html"
  const match = uri.match(/^ui:\/\/([^/]+)\/(.+)$/);
  if (!match) return null;

  const [, appName] = match;
  const filePath = path.join(DIST_DIR, `${appName}.html`);

  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    console.error(`Failed to read resource: ${filePath}`);
    return null;
  }
}

// Create Express server
async function runHttp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const PORT = process.env.PORT || 3100;

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
    const uri = `ui://${req.params.appName}/app.html`;
    const html = await readResource(uri);
    if (html) {
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } else {
      res.status(404).send("Resource not found");
    }
  });

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", server: "mcp-apps-server", version: "2.0.0" });
  });

  app.listen(PORT, () => {
    console.log(`MCP Apps Server running on http://localhost:${PORT}`);
    console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
    console.log(`Resources: http://localhost:${PORT}/resource/{appName}`);
  });
}

runHttp();
