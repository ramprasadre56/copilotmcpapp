"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface McpAppHostProps {
  toolName: string;
  toolInput?: Record<string, unknown>;
  toolResult?: string | object;
  height?: number;
}

export function McpAppHost({
  toolName,
  toolInput,
  toolResult,
  height = 300,
}: McpAppHostProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAppReady, setIsAppReady] = useState(false);
  const pendingResultRef = useRef<string | object | null>(null);
  const resultSentRef = useRef(false);

  // Load the UI resource HTML
  useEffect(() => {
    const loadResource = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch the HTML from the MCP server
        const response = await fetch(`/api/mcp-resource?tool=${toolName}`);
        if (!response.ok) {
          throw new Error(`Failed to load UI: ${response.statusText}`);
        }

        const html = await response.text();

        // Create a blob URL for the HTML
        const blob = new Blob([html], { type: "text/html" });
        const blobUrl = URL.createObjectURL(blob);

        if (iframeRef.current) {
          iframeRef.current.src = blobUrl;
        }

        // Clean up blob URL after iframe loads
        return () => URL.revokeObjectURL(blobUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load UI");
        setIsLoading(false);
      }
    };

    loadResource();
  }, [toolName]);

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Only accept messages from our iframe
      if (event.source !== iframeRef.current?.contentWindow) return;

      const { method, params, id } = event.data || {};

      if (method === "ui/notifications/app-initialized") {
        console.log("App initialized, isAppReady = true");
        setIsAppReady(true);
        setIsLoading(false);

        // Send pending result if we have one
        if (pendingResultRef.current && !resultSentRef.current) {
          setTimeout(() => {
            if (pendingResultRef.current) {
              const result = pendingResultRef.current;
              const resultData = typeof result === "string" ? result : JSON.stringify(result);
              const structuredContent = typeof result === "object" ? result : tryParseJSON(resultData);

              iframeRef.current?.contentWindow?.postMessage(
                {
                  jsonrpc: "2.0",
                  method: "ui/notifications/tool-result",
                  params: {
                    content: [{ type: "text", text: resultData }],
                    structuredContent,
                  },
                },
                "*"
              );
              resultSentRef.current = true;
              console.log("Sent pending result on app init");
            }
          }, 100);
        }
      }

      // Handle tool calls from the iframe
      if (method === "tools/call") {
        try {
          const response = await fetch("/api/mcp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              toolName: params.name,
              args: params.arguments,
            }),
          });

          const data = await response.json();

          // Send result back to iframe
          iframeRef.current?.contentWindow?.postMessage(
            {
              jsonrpc: "2.0",
              method: "ui/notifications/tool-result",
              params: {
                content: [{ type: "text", text: data.result }],
                structuredContent: tryParseJSON(data.result),
              },
            },
            "*"
          );
        } catch (err) {
          console.error("Tool call error:", err);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Send tool input when app is ready
  useEffect(() => {
    if (isAppReady && toolInput && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          jsonrpc: "2.0",
          method: "ui/notifications/tool-input",
          params: {
            arguments: toolInput,
          },
        },
        "*"
      );
    }
  }, [isAppReady, toolInput]);

  // Helper to send tool result to iframe
  const sendToolResult = useCallback((result: string | object) => {
    if (!iframeRef.current?.contentWindow) return;

    const resultData = typeof result === "string" ? result : JSON.stringify(result);
    const structuredContent = typeof result === "object" ? result : tryParseJSON(resultData);

    console.log("Sending tool result to iframe:", { resultData, structuredContent });

    iframeRef.current.contentWindow.postMessage(
      {
        jsonrpc: "2.0",
        method: "ui/notifications/tool-result",
        params: {
          content: [{ type: "text", text: resultData }],
          structuredContent,
        },
      },
      "*"
    );
    resultSentRef.current = true;
  }, []);

  // Send tool result when available and app is ready
  useEffect(() => {
    // Store result for later if app isn't ready yet
    if (toolResult) {
      pendingResultRef.current = toolResult;
    }

    // Send result if app is ready and we have a result we haven't sent
    if (isAppReady && toolResult && !resultSentRef.current) {
      sendToolResult(toolResult);
    }
  }, [isAppReady, toolResult, sendToolResult]);

  // Also send pending result when app becomes ready
  useEffect(() => {
    if (isAppReady && pendingResultRef.current && !resultSentRef.current) {
      sendToolResult(pendingResultRef.current);
    }
  }, [isAppReady, sendToolResult]);

  // Send host context (theme)
  const sendHostContext = useCallback(() => {
    if (!iframeRef.current?.contentWindow) return;

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    iframeRef.current.contentWindow.postMessage(
      {
        jsonrpc: "2.0",
        method: "ui/notifications/host-context-changed",
        params: {
          theme: isDark ? "dark" : "light",
        },
      },
      "*"
    );
  }, []);

  // Watch for theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => sendHostContext();

    mediaQuery.addEventListener("change", handleChange);

    // Send initial theme when app is ready
    if (isAppReady) {
      sendHostContext();
    }

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [isAppReady, sendHostContext]);

  if (error) {
    return (
      <div
        style={{
          padding: "16px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          color: "#dc2626",
        }}
      >
        <strong>Error loading UI:</strong> {error}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#f8fafc",
      }}
    >
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8fafc",
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: "center", color: "#64748b" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                border: "3px solid #e2e8f0",
                borderTopColor: "#3b82f6",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 8px",
              }}
            />
            Loading {toolName} UI...
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        title={`${toolName} MCP App`}
        sandbox="allow-scripts allow-same-origin"
        style={{
          width: "100%",
          height: `${height}px`,
          border: "none",
          display: "block",
        }}
        onLoad={() => {
          // The app will notify us when it's truly ready via postMessage
        }}
      />
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

// Helper to try parsing JSON, returns null if invalid
function tryParseJSON(str: string): object | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
