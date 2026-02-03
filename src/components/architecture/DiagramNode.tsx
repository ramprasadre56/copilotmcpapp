"use client";

import { Icon } from "@/components/ui/Icons";
import { DiagramNode as DiagramNodeType } from "@/lib/types";

interface DiagramNodeProps {
  node: DiagramNodeType;
  isSelected: boolean;
  onClick: () => void;
  color: string;
}

export function DiagramNode({ node, isSelected, onClick, color }: DiagramNodeProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center gap-2 p-4 rounded-2xl
        transition-all duration-300 ease-out cursor-pointer
        ${
          isSelected
            ? `bg-gradient-to-br ${color} text-white shadow-lg scale-105`
            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md hover:shadow-lg hover:-translate-y-1"
        }
      `}
      style={{ minWidth: "120px" }}
    >
      {/* Pulse animation when selected */}
      {isSelected && (
        <span className="absolute inset-0 rounded-2xl animate-ping-slow bg-white/20" />
      )}

      {/* Icon */}
      <div
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          ${
            isSelected
              ? "bg-white/20"
              : `bg-gradient-to-br ${color} text-white`
          }
        `}
      >
        <Icon name={node.icon} className="w-6 h-6" />
      </div>

      {/* Label */}
      <span className="font-semibold text-sm">{node.label}</span>

      {/* Description */}
      <span
        className={`text-xs ${isSelected ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}
      >
        {node.description}
      </span>
    </button>
  );
}
