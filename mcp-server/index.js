import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import cors from "cors";

// Create MCP Server
const server = new Server(
  {
    name: "demo-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
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

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "get_weather": {
      // Simulated weather data
      const weatherData = {
        location: args.location,
        temperature: Math.round(Math.random() * 30 + 5),
        condition: ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"][
          Math.floor(Math.random() * 4)
        ],
        humidity: Math.round(Math.random() * 50 + 30),
        windSpeed: Math.round(Math.random() * 30 + 5),
      };
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(weatherData, null, 2),
          },
        ],
      };
    }

    case "calculate": {
      try {
        // Safe evaluation (basic)
        const expression = args.expression.replace(/[^0-9+\-*/().%\s]/g, "");
        const result = Function(`"use strict"; return (${expression})`)();
        return {
          content: [
            {
              type: "text",
              text: `Result: ${result}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Invalid expression - ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }

    case "get_time": {
      try {
        const now = new Date();
        const options = {
          timeZone: args.timezone,
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
              text: `Error: Invalid timezone - ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }

    case "generate_uuid": {
      const uuid = crypto.randomUUID();
      return {
        content: [
          {
            type: "text",
            text: `Generated UUID: ${uuid}`,
          },
        ],
      };
    }

    case "word_count": {
      const text = args.text || "";
      const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
      const characters = text.length;
      const lines = text.split(/\n/).length;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { words, characters, lines },
              null,
              2
            ),
          },
        ],
      };
    }

    default:
      return {
        content: [
          {
            type: "text",
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
  }
});

// Option 1: Run as stdio server (for CLI usage)
async function runStdio() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

// Option 2: Run as HTTP server (for web usage)
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
        const result = await handleToolCall(params.name, params.arguments);
        res.json(result);
      } else {
        res.status(400).json({ error: "Unknown method" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok", server: "demo-mcp-server" });
  });

  app.listen(PORT, () => {
    console.log(`MCP HTTP Server running on http://localhost:${PORT}`);
    console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
  });
}

// Tool call handler for HTTP mode
async function handleToolCall(name, args) {
  switch (name) {
    case "get_weather": {
      const weatherData = {
        location: args.location,
        temperature: Math.round(Math.random() * 30 + 5),
        condition: ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"][
          Math.floor(Math.random() * 4)
        ],
        humidity: Math.round(Math.random() * 50 + 30),
        windSpeed: Math.round(Math.random() * 30 + 5),
      };
      return { content: [{ type: "text", text: JSON.stringify(weatherData, null, 2) }] };
    }

    case "calculate": {
      try {
        const expression = args.expression.replace(/[^0-9+\-*/().%\s]/g, "");
        const result = Function(`"use strict"; return (${expression})`)();
        return { content: [{ type: "text", text: `Result: ${result}` }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }

    case "get_time": {
      try {
        const now = new Date();
        const options = { timeZone: args.timezone, dateStyle: "full", timeStyle: "long" };
        const timeString = now.toLocaleString("en-US", options);
        return { content: [{ type: "text", text: `Current time in ${args.timezone}: ${timeString}` }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }

    case "generate_uuid": {
      return { content: [{ type: "text", text: `Generated UUID: ${crypto.randomUUID()}` }] };
    }

    case "word_count": {
      const text = args.text || "";
      const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
      return { content: [{ type: "text", text: JSON.stringify({ words, characters: text.length, lines: text.split(/\n/).length }, null, 2) }] };
    }

    default:
      return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
  }
}

// Run HTTP server by default
runHttp();
