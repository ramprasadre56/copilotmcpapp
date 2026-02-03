"use client";

import { ArchitectureDiagram } from "@/components/architecture/ArchitectureDiagram";

export function ArchitectureTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          System Architecture
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">
          Interactive diagram showing data flow through the MCP system
        </p>
      </div>

      {/* Diagram */}
      <ArchitectureDiagram />

      {/* Legend */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
          Data Flow Explained
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h3 className="font-medium text-slate-700 dark:text-slate-200">Request Flow</h3>
            <ol className="space-y-1 text-slate-600 dark:text-slate-300 list-decimal list-inside">
              <li>User types a message in the chat</li>
              <li>CopilotKit sends request to Next.js API</li>
              <li>API calls Google Gemini for AI response</li>
              <li>AI decides which tool to call (if any)</li>
              <li>Tool call is forwarded to MCP Server</li>
            </ol>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-slate-700 dark:text-slate-200">Response Flow</h3>
            <ol className="space-y-1 text-slate-600 dark:text-slate-300 list-decimal list-inside">
              <li>MCP Server executes the tool handler</li>
              <li>Tool returns structured data</li>
              <li>Response flows back through API</li>
              <li>CopilotKit renders the result UI</li>
              <li>User sees interactive tool output</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
