"use client";

import { useState, useEffect } from "react";
import { TabType } from "@/lib/types";

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string }[] = [
  { id: "chat", label: "Overview" },
  { id: "apps", label: "Apps" },
  { id: "architecture", label: "Architecture" },
];

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/mcp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolName: "generate_uuid", args: {} }),
        });
        setIsConnected(response.ok);
      } catch {
        setIsConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--glass-border)] bg-[var(--bg-secondary)]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-[var(--text-primary)]">
              MCP Apps
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[var(--bg-primary)] p-1 rounded-full">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    px-5 py-2 text-sm font-medium rounded-full transition-all duration-200
                    ${isActive
                      ? "bg-white text-[var(--text-primary)] shadow-md"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }
                  `}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Status */}
          <div className="flex items-center gap-4">
            <div className={`status-live text-sm font-medium ${isConnected ? 'text-[var(--accent-success)]' : 'text-[var(--text-muted)]'}`}>
              {isChecking ? 'Connecting...' : isConnected ? 'Connected' : 'Offline'}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all
                  ${isActive
                    ? "bg-white text-[var(--text-primary)] shadow-md"
                    : "text-[var(--text-secondary)] bg-[var(--bg-primary)]"
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
