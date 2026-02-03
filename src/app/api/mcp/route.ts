import { NextRequest, NextResponse } from "next/server";

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:3100";

export async function POST(req: NextRequest) {
  try {
    const { toolName, args } = await req.json();

    const response = await fetch(`${MCP_SERVER_URL}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "tools/call",
        params: { name: toolName, arguments: args },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `MCP call failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Extract text content from MCP response
    if (result.content && result.content[0]?.text) {
      return NextResponse.json({ result: result.content[0].text });
    }

    return NextResponse.json({ result: JSON.stringify(result) });
  } catch (error) {
    console.error("MCP API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
