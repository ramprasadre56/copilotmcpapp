import { NextRequest, NextResponse } from "next/server";

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:3100";

// Map tool names to their UI resource URIs
const TOOL_RESOURCE_MAP: Record<string, string> = {
  get_weather: "ui://weather/app.html",
  calculate: "ui://calculator/app.html",
  show_map: "ui://map/app.html",
  show_threejs_scene: "ui://threejs/app.html",
  display_pdf: "ui://pdf/app.html",
  show_shader: "ui://shadertoy/app.html",
  show_sheet_music: "ui://sheet-music/app.html",
  explore_wiki: "ui://wiki/app.html",
  allocate_budget: "ui://budget/app.html",
  show_system_monitor: "ui://system-monitor/app.html",
  show_transcript: "ui://transcript/app.html",
};

export async function GET(req: NextRequest) {
  const tool = req.nextUrl.searchParams.get("tool");

  console.log("MCP_SERVER_URL:", MCP_SERVER_URL);
  console.log("Requested tool:", tool);

  if (!tool) {
    return NextResponse.json({ error: "Missing tool parameter" }, { status: 400 });
  }

  const resourceUri = TOOL_RESOURCE_MAP[tool];

  if (!resourceUri) {
    return NextResponse.json(
      { error: `No UI resource for tool: ${tool}` },
      { status: 404 }
    );
  }

  try {
    // Try direct resource endpoint first (simpler)
    const appName = resourceUri.match(/^ui:\/\/([^/]+)/)?.[1];
    const fetchUrl = `${MCP_SERVER_URL}/resource/${appName}`;
    console.log("Fetching resource from:", fetchUrl);

    if (appName) {
      const directResponse = await fetch(fetchUrl, {
        cache: "no-store",
        headers: {
          "Accept": "text/html",
        },
      });

      if (directResponse.ok) {
        const html = await directResponse.text();
        return new NextResponse(html, {
          headers: {
            "Content-Type": "text/html",
            "Cache-Control": "no-cache",
          },
        });
      }
      console.log(`Direct resource fetch failed for ${appName}: ${directResponse.status}`);
    }

    // Fallback to MCP protocol
    const response = await fetch(`${MCP_SERVER_URL}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "resources/read",
        params: { uri: resourceUri },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`MCP fallback failed: ${response.status} - ${errorText}`);
      throw new Error(`MCP server error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.contents?.[0]?.text) {
      return new NextResponse(data.contents[0].text, {
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "no-cache",
        },
      });
    }

    return NextResponse.json(
      { error: "No content in resource response" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching MCP resource:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch resource" },
      { status: 500 }
    );
  }
}
