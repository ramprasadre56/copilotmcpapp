export type AppCategory = "utility" | "data" | "ai" | "integration";

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean";
  description: string;
  required: boolean;
}

export interface AppConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AppCategory;
  toolName: string;
  hasUI: boolean; // Whether it has interactive MCP App UI
  parameters: ToolParameter[];
}

export interface AppSettings {
  enabledApps: string[];
  toggleApp: (appId: string) => void;
  isAppEnabled: (appId: string) => boolean;
  enableAll: () => void;
  disableAll: () => void;
}

export type TabType = "chat" | "apps" | "architecture";

export interface DiagramNode {
  id: string;
  label: string;
  icon: string;
  description: string;
  details: string[];
}
