import { NextResponse } from "next/server";

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:3100";

export async function GET() {
  // Try to fetch from MCP server
  let healthCheck = { status: "unknown", error: null as string | null };
  
  try {
    const response = await fetch(`${MCP_SERVER_URL}/health`, {
      cache: "no-store",
    });
    healthCheck = {
      status: response.ok ? "ok" : "failed",
      error: response.ok ? null : `Status: ${response.status}`,
    };
  } catch (error) {
    healthCheck = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
  
  return NextResponse.json({
    mcpServerUrl: MCP_SERVER_URL,
    nodeEnv: process.env.NODE_ENV,
    healthCheck,
    timestamp: new Date().toISOString(),
  });
}
