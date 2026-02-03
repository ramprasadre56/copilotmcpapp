import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

interface ToolResult {
  content?: Array<{ type: string; text: string }>;
  structuredContent?: WeatherData;
}

function WeatherApp() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Listen for messages from host
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { method, params } = event.data || {};

      if (method === "ui/notifications/tool-result") {
        // Received tool result
        const result = params as ToolResult;
        if (result.structuredContent) {
          setWeather(result.structuredContent);
        } else if (result.content?.[0]?.text) {
          try {
            setWeather(JSON.parse(result.content[0].text));
          } catch {
            console.error("Failed to parse weather data");
          }
        }
        setLoading(false);
      }

      if (method === "ui/notifications/tool-input") {
        // Tool input received, waiting for result
        setLoading(true);
      }

      if (method === "ui/notifications/host-context-changed") {
        // Theme changed
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
  }, []);

  const refreshWeather = useCallback(async () => {
    if (!weather) return;
    setLoading(true);

    // Call server tool to refresh weather
    window.parent.postMessage({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: "get_weather",
        arguments: { location: weather.location },
      },
    }, "*");
  }, [weather]);

  const toggleUnit = () => {
    setUnit((prev) => (prev === "C" ? "F" : "C"));
  };

  const convertTemp = (celsius: number) => {
    if (unit === "F") {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return celsius;
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case "sunny":
        return "☀️";
      case "cloudy":
        return "☁️";
      case "rainy":
        return "🌧️";
      case "partly cloudy":
        return "⛅";
      default:
        return "🌤️";
    }
  };

  const isDark = theme === "dark";

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          background: isDark ? "#1e293b" : "#f8fafc",
          color: isDark ? "#e2e8f0" : "#475569",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🌍</div>
          <div>Loading weather data...</div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div
        style={{
          padding: "20px",
          background: isDark ? "#1e293b" : "#f8fafc",
          color: isDark ? "#e2e8f0" : "#475569",
        }}
      >
        No weather data available
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        background: isDark
          ? "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)"
          : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        borderRadius: "16px",
        color: "white",
        minWidth: "280px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>
            {weather.location}
          </h2>
          <p style={{ fontSize: "12px", opacity: 0.8, margin: "4px 0 0" }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <span style={{ fontSize: "48px" }}>{getWeatherIcon(weather.condition)}</span>
      </div>

      {/* Temperature */}
      <div style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "56px", fontWeight: 700, lineHeight: 1 }}>
          {convertTemp(weather.temperature)}°
        </span>
        <span style={{ fontSize: "24px", opacity: 0.8 }}>{unit}</span>
      </div>

      {/* Condition */}
      <p style={{ fontSize: "16px", marginBottom: "16px", opacity: 0.9 }}>
        {weather.condition}
      </p>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          padding: "12px 0",
          borderTop: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>💧</span>
          <span style={{ fontSize: "14px" }}>{weather.humidity}%</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>💨</span>
          <span style={{ fontSize: "14px" }}>{weather.windSpeed} km/h</span>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "16px",
        }}
      >
        <button
          onClick={refreshWeather}
          style={{
            flex: 1,
            padding: "10px 16px",
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "8px",
            color: "white",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.3)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
        >
          🔄 Refresh
        </button>
        <button
          onClick={toggleUnit}
          style={{
            padding: "10px 16px",
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "8px",
            color: "white",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.3)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
        >
          °{unit === "C" ? "F" : "C"}
        </button>
      </div>
    </div>
  );
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<WeatherApp />);
