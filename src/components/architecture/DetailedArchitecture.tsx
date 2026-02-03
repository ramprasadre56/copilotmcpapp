"use client";

export function DetailedArchitecture() {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 overflow-x-auto">
      <h3 className="text-xl font-semibold text-slate-100 mb-6">Architecture</h3>

      <div className="min-w-[600px] space-y-4 font-mono text-sm">
        {/* CopilotKit Frontend Box */}
        <div className="border-2 border-amber-500/70 rounded-lg p-4">
          <div className="text-amber-400 text-center mb-4 text-base">CopilotKit Frontend</div>

          <div className="flex gap-4">
            {/* Left Side - CopilotSidebar */}
            <div className="flex-1 border-2 border-amber-500/50 rounded p-3">
              <div className="text-amber-300 text-center mb-2">CopilotSidebar</div>
              <div className="border border-amber-500/40 rounded p-2 text-amber-200/80 text-xs">
                useCopilotAction ─→
              </div>
            </div>

            {/* Right Side - McpAppHost */}
            <div className="flex-1 border-2 border-amber-500/50 rounded p-3">
              <div className="text-amber-300 text-center mb-2">McpAppHost</div>
              <div className="border border-amber-500/40 rounded p-2">
                <div className="text-amber-200/80 text-xs mb-1">Sandboxed iframe</div>
                <div className="text-amber-400/60 text-xs">(Weather/Calc UI App)</div>
              </div>
            </div>
          </div>

          {/* AppBridge */}
          <div className="mt-4 flex justify-center">
            <div className="border border-amber-500/50 rounded px-4 py-1">
              <span className="text-amber-300 text-xs">▲ AppBridge</span>
            </div>
          </div>
        </div>

        {/* Connection Arrow */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center text-amber-400/70">
            <div className="h-4 border-l-2 border-amber-500/50"></div>
            <div className="text-xs">postMessage</div>
            <div className="h-4 border-l-2 border-amber-500/50"></div>
            <div className="text-lg">▼</div>
          </div>
        </div>

        {/* MCP Server Box */}
        <div className="border-2 border-amber-500/70 rounded-lg p-4">
          <div className="text-amber-400 text-center mb-4 text-base">MCP Server (port 3100)</div>

          <div className="flex gap-4">
            {/* registerAppTool */}
            <div className="flex-1 border border-amber-500/50 rounded p-3">
              <div className="text-amber-300 text-sm mb-2">registerAppTool</div>
              <ul className="text-amber-200/70 text-xs space-y-1">
                <li>- get_weather</li>
                <li>- calculate</li>
                <li>- get_time</li>
                <li>- generate_uuid</li>
                <li>- word_count</li>
              </ul>
            </div>

            {/* registerAppResource */}
            <div className="flex-1 border border-amber-500/50 rounded p-3">
              <div className="text-amber-300 text-sm mb-2">registerAppResource</div>
              <ul className="text-amber-200/70 text-xs space-y-1">
                <li>- ui://weather/app.html</li>
                <li>- ui://calculator/app.html</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Flow Legend */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="text-slate-400 text-xs mb-2">Data Flow:</div>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-slate-300">User Input</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-slate-300">Tool Execution</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-slate-300">UI Resource</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-slate-300">postMessage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
