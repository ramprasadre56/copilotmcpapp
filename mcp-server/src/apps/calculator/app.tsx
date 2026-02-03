import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";

interface HistoryItem {
  expression: string;
  result: string;
}

function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(false);

  // Listen for messages from host
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { method, params } = event.data || {};

      if (method === "ui/notifications/tool-result") {
        // Received calculation result
        const content = params?.content?.[0]?.text;
        if (content) {
          // Extract result from "Result: X" format
          const match = content.match(/Result:\s*(.+)/);
          if (match) {
            setResult(match[1]);
            setHistory((prev) => [
              { expression: expression || display, result: match[1] },
              ...prev.slice(0, 9),
            ]);
          }
        }
        setLoading(false);
      }

      if (method === "ui/notifications/tool-input") {
        // Tool input received with initial expression
        const expr = params?.arguments?.expression;
        if (expr) {
          setExpression(expr);
          setDisplay(expr);
        }
        setLoading(true);
      }

      if (method === "ui/notifications/host-context-changed") {
        if (params?.theme) {
          setTheme(params.theme);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Notify host that app is ready
    window.parent.postMessage({
      jsonrpc: "2.0",
      method: "ui/notifications/app-initialized",
      params: {},
    }, "*");

    return () => window.removeEventListener("message", handleMessage);
  }, [display, expression]);

  const calculate = useCallback(async (expr: string) => {
    if (!expr || expr === "0") return;
    setLoading(true);
    setExpression(expr);

    // Call server tool to calculate
    window.parent.postMessage({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: "calculate",
        arguments: { expression: expr },
      },
    }, "*");
  }, []);

  const handleButton = (value: string) => {
    if (loading) return;

    switch (value) {
      case "C":
        setDisplay("0");
        setExpression("");
        setResult(null);
        break;
      case "=":
        calculate(display);
        break;
      case "⌫":
        setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
        setResult(null);
        break;
      default:
        setDisplay((prev) => {
          if (prev === "0" && !isNaN(Number(value))) {
            return value;
          }
          return prev + value;
        });
        setResult(null);
    }
  };

  const isDark = theme === "dark";
  const buttons = [
    ["C", "⌫", "%", "/"],
    ["7", "8", "9", "*"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  const buttonStyle = (btn: string): React.CSSProperties => {
    const isOperator = ["+", "-", "*", "/", "%"].includes(btn);
    const isEquals = btn === "=";
    const isClear = btn === "C" || btn === "⌫";

    return {
      padding: btn === "0" ? "16px 32px" : "16px",
      fontSize: "20px",
      fontWeight: 500,
      border: "none",
      borderRadius: "12px",
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.7 : 1,
      transition: "all 0.15s",
      gridColumn: btn === "0" ? "span 2" : undefined,
      background: isEquals
        ? "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
        : isOperator
        ? isDark
          ? "#4c1d95"
          : "#c4b5fd"
        : isClear
        ? isDark
          ? "#7f1d1d"
          : "#fecaca"
        : isDark
        ? "#374151"
        : "#f1f5f9",
      color: isEquals
        ? "white"
        : isOperator
        ? isDark
          ? "#c4b5fd"
          : "#6d28d9"
        : isClear
        ? isDark
          ? "#fca5a5"
          : "#dc2626"
        : isDark
        ? "#e5e7eb"
        : "#1e293b",
    };
  };

  return (
    <div
      style={{
        padding: "20px",
        background: isDark
          ? "linear-gradient(135deg, #1f2937 0%, #111827 100%)"
          : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        borderRadius: "20px",
        minWidth: "300px",
        maxWidth: "320px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxShadow: isDark
          ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          : "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Display */}
      <div
        style={{
          background: isDark ? "#111827" : "white",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px",
          textAlign: "right",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            color: isDark ? "#9ca3af" : "#64748b",
            minHeight: "20px",
            marginBottom: "4px",
          }}
        >
          {expression || "\u00A0"}
        </div>
        <div
          style={{
            fontSize: "36px",
            fontWeight: 600,
            color: isDark ? "#f9fafb" : "#1e293b",
            wordBreak: "break-all",
          }}
        >
          {result || display}
        </div>
        {loading && (
          <div
            style={{
              fontSize: "12px",
              color: "#8b5cf6",
              marginTop: "4px",
            }}
          >
            Calculating...
          </div>
        )}
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "8px",
        }}
      >
        {buttons.flat().map((btn, idx) => (
          <button
            key={idx}
            onClick={() => handleButton(btn)}
            disabled={loading}
            style={buttonStyle(btn)}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: isDark ? "#9ca3af" : "#64748b",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            History
          </div>
          <div
            style={{
              maxHeight: "120px",
              overflowY: "auto",
              background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)",
              borderRadius: "8px",
              padding: "8px",
            }}
          >
            {history.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  fontSize: "13px",
                  color: isDark ? "#d1d5db" : "#475569",
                  borderBottom:
                    idx < history.length - 1
                      ? `1px solid ${isDark ? "#374151" : "#e2e8f0"}`
                      : undefined,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setDisplay(item.expression);
                  setResult(null);
                }}
              >
                <span style={{ fontFamily: "monospace" }}>{item.expression}</span>
                <span style={{ fontWeight: 600, color: "#8b5cf6" }}>
                  = {item.result}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<CalculatorApp />);
