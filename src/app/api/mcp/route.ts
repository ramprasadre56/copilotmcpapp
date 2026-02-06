import { NextRequest, NextResponse } from "next/server";

// Build timestamp: 2026-02-06T17:40:00Z - Force fresh deploy
// Read env var at runtime, not build time
function getMcpServerUrl() {
  return process.env.MCP_SERVER_URL || "http://localhost:3100";
}

export async function POST(req: NextRequest) {
  const MCP_SERVER_URL = getMcpServerUrl();
  console.log("MCP API called, MCP_SERVER_URL:", MCP_SERVER_URL);
  
  try {
    const body = await req.json();
    const { toolName, args } = body;
    
    console.log("Calling tool:", toolName, "with args:", JSON.stringify(args));

    const response = await fetch(`${MCP_SERVER_URL}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "tools/call",
        params: { name: toolName, arguments: args },
      }),
    });

    console.log("MCP server response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MCP call failed:", errorText);
      return NextResponse.json(
        { error: `MCP call failed: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Return both text content and structured content for MCP apps
    const textResult = result.content?.[0]?.text || JSON.stringify(result);
    
    return NextResponse.json({ 
      result: textResult,
      structuredContent: result.structuredContent,
      _meta: result._meta,
    });
  } catch (error) {
    console.error("MCP API error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error",
        mcpServerUrl: MCP_SERVER_URL,
      },
      { status: 500 }
    );
  }
}

