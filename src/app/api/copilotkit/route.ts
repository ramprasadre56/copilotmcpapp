import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  GoogleGenerativeAIAdapter,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

// 1. Create the service adapter for Google Gemini
const serviceAdapter = new GoogleGenerativeAIAdapter({
  model: "gemini-1.5-flash",
});

// 2. Create the runtime with MCP server configuration
const runtime = new CopilotRuntime({
  remoteEndpoints: [
    {
      url: "http://localhost:3100/mcp",
    },
  ],
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
