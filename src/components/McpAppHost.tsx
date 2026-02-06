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
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const pendingResultRef = useRef<string | object | null>(null);
  const resultSentRef = useRef(false);
  const toolInputRef = useRef(toolInput);
  toolInputRef.current = toolInput;
  // Track if this is an ext-apps based app (uses ui/initialize protocol)
  const isExtAppsRef = useRef(false);
  // Ref to track ready state for closures
  const isAppReadyRef = useRef(false);

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
        setHtmlContent(html);
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
      console.log("Received message from iframe:", { method, params, id });

      // Handle initialization REQUEST from ext-apps (ui/initialize - has id, needs response)
      // This is the official ext-apps protocol from @modelcontextprotocol/ext-apps
      if (method === "ui/initialize" && id !== undefined) {
        console.log("App requesting initialization (ext-apps protocol)");
        isExtAppsRef.current = true;

        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        // Respond to initialization request with full protocol response
        iframeRef.current?.contentWindow?.postMessage(
          {
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: "2025-01-01",
              hostCapabilities: {
                openLinks: {},
                serverTools: {},
                logging: {},
              },
              hostInfo: { name: "McpAppHost", version: "1.0.0" },
              hostContext: {
                theme: isDark ? "dark" : "light",
                platform: "web",
              },
            },
          },
          "*"
        );
        // Don't set ready yet - wait for the initialized notification
      }

      // Handle initialized NOTIFICATION from ext-apps (ui/notifications/initialized - no id)
      // This is sent by the app after it processes the initialize response
      if (method === "ui/notifications/initialized") {
        console.log("App initialized notification received (ext-apps)");
        isAppReadyRef.current = true;
        setIsAppReady(true);
        setIsLoading(false);

        // Send tool input now that app is ready
        setTimeout(() => {
          if (toolInputRef.current && iframeRef.current?.contentWindow) {
            console.log("Sending tool-input after initialized (ext-apps):", toolInputRef.current);
            iframeRef.current.contentWindow.postMessage(
              {
                jsonrpc: "2.0",
                method: "ui/notifications/tool-input",
                params: { arguments: toolInputRef.current },
              },
              "*"
            );
          }
          // Send pending result
          if (pendingResultRef.current && !resultSentRef.current) {
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
          }
        }, 50);
      }

      // Handle simple app protocol (ui/notifications/app-initialized)
      if (method === "ui/notifications/app-initialized") {
        console.log("App initialized notification received (simple protocol)");
        isAppReadyRef.current = true;
        setIsAppReady(true);
        setIsLoading(false);
      }

      // Handle tool calls from the iframe (works for both protocols)
      if (method === "tools/call" && id !== undefined) {
        try {
          const response = await fetch("/api/mcp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              method: "tools/call",
              params: {
                name: params.name,
                arguments: params.arguments,
              },
            }),
          });

          const data = await response.json();

          // Send result back to iframe
          iframeRef.current?.contentWindow?.postMessage(
            {
              jsonrpc: "2.0",
              id,
              result: data,
            },
            "*"
          );
        } catch (err) {
          console.error("Tool call error:", err);
          iframeRef.current?.contentWindow?.postMessage(
            {
              jsonrpc: "2.0",
              id,
              error: { code: -32000, message: String(err) },
            },
            "*"
          );
        }
      }

      // Handle size change notifications from app
      if (method === "ui/notifications/size-changed") {
        console.log("App size changed:", params);
        // Could adjust iframe height here if needed
      }

      // Handle ping requests
      if (method === "ping" && id !== undefined) {
        iframeRef.current?.contentWindow?.postMessage(
          {
            jsonrpc: "2.0",
            id,
            result: {},
          },
          "*"
        );
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Send tool input when app is ready
  useEffect(() => {
    if (isAppReady && toolInput && iframeRef.current?.contentWindow) {
      console.log("Sending tool-input to iframe:", toolInput);
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
        className="card-glass"
        style={{
          padding: "16px",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "var(--radius-lg)",
          color: "var(--accent-danger)",
        }}
      >
        <strong>Error loading UI:</strong> {error}
      </div>
    );
  }

  return (
    <div
      className="card-glass animate-fade-up"
      style={{
        position: "relative",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
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
            background: "var(--glass-bg)",
            backdropFilter: "blur(10px)",
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                animation: "spin 1s linear infinite",
                margin: "0 auto 12px",
                boxShadow: "0 0 20px rgba(102, 126, 234, 0.4)",
              }}
            />
            <span style={{ opacity: 0.7, fontSize: "14px" }}>Loading {toolName}...</span>
          </div>
        </div>
      )}
      {htmlContent && (
        <IframeWithDocWrite
          iframeRef={iframeRef}
          htmlContent={htmlContent}
          toolName={toolName}
          height={height}
          onContentLoaded={() => {
            console.log("Iframe content loaded, waiting for app to initialize...");
            // For simple apps that don't send any initialization message,
            // set a fallback timeout to mark as ready
            setTimeout(() => {
              if (!isAppReadyRef.current) {
                console.log("Fallback: marking app as ready after timeout");
                isAppReadyRef.current = true;
                setIsLoading(false);
                setIsAppReady(true);

                // Send tool input for simple apps that might be waiting
                if (iframeRef.current?.contentWindow && toolInputRef.current) {
                  iframeRef.current.contentWindow.postMessage(
                    {
                      jsonrpc: "2.0",
                      method: "ui/notifications/tool-input",
                      params: { arguments: toolInputRef.current },
                    },
                    "*"
                  );
                }
              }
            }, 1500);
          }}
        />
      )}
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

// Component that uses document.write instead of srcDoc for WebGL compatibility
// CesiumJS and other WebGL-based libraries don't work properly with srcDoc iframes
interface IframeWithDocWriteProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  htmlContent: string;
  toolName: string;
  height: number;
  onContentLoaded: () => void;
}

function IframeWithDocWrite({
  iframeRef,
  htmlContent,
  toolName,
  height,
  onContentLoaded,
}: IframeWithDocWriteProps) {
  const hasInjectedRef = useRef(false);

  useEffect(() => {
    if (hasInjectedRef.current) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    // Wait for iframe to be ready
    const injectContent = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          hasInjectedRef.current = true;
          doc.open();
          doc.write(htmlContent);
          doc.close();
          console.log("HTML content injected via document.write");
          onContentLoaded();
        }
      } catch (err) {
        console.error("Failed to inject HTML:", err);
      }
    };

    // If iframe is already loaded, inject immediately
    if (iframe.contentDocument?.readyState === "complete") {
      injectContent();
    } else {
      // Otherwise wait for load event
      iframe.addEventListener("load", injectContent, { once: true });
    }
  }, [htmlContent, iframeRef, onContentLoaded]);

  return (
    <iframe
      ref={iframeRef}
      title={`${toolName} MCP App`}
      sandbox="allow-scripts allow-same-origin allow-forms"
      style={{
        width: "100%",
        height: `${height}px`,
        border: "none",
        display: "block",
      }}
    />
  );
}
