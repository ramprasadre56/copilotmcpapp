"use client";

import { useState } from "react";
import { architectureNodes } from "@/lib/appRegistry";
import { DiagramNode } from "./DiagramNode";
import { AnimatedConnection } from "./AnimatedConnection";
import { useAppSettings } from "@/context/AppSettingsContext";
import { Icon } from "@/components/ui/Icons";

const nodeColors = [
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-green-500 to-green-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
];

export function ArchitectureDiagram() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { enabledApps } = useAppSettings();

  const selectedNodeData = selectedNode
    ? architectureNodes.find((n) => n.id === selectedNode)
    : null;

  // Update tools node details dynamically
  const nodesWithDynamicData = architectureNodes.map((node) => {
    if (node.id === "tools") {
      return {
        ...node,
        description: `${enabledApps.length} Active Tools`,
      };
    }
    return node;
  });

  return (
    <div className="card-glass rounded-2xl p-6 overflow-x-auto">
      {/* Diagram */}
      <div className="flex items-center justify-center gap-2 min-w-max py-8">
        {nodesWithDynamicData.map((node, index) => (
          <div key={node.id} className="flex items-center">
            <DiagramNode
              node={node}
              isSelected={selectedNode === node.id}
              onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
              color={nodeColors[index]}
            />
            {index < nodesWithDynamicData.length - 1 && (
              <AnimatedConnection className="mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Details Panel */}
      {selectedNodeData && (
        <div className="mt-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  bg-gradient-to-br ${nodeColors[architectureNodes.findIndex((n) => n.id === selectedNode)]}
                  text-white
                `}
              >
                <Icon name={selectedNodeData.icon} className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {selectedNodeData.label}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedNodeData.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400"
            >
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>

          <ul className="space-y-2">
            {selectedNodeData.details.map((detail, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
              >
                <Icon name="chevron-right" className="w-4 h-4 mt-0.5 text-blue-500" />
                {detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
