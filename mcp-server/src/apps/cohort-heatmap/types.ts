/**
 * @file Types for Cohort Heatmap app
 */

export interface CohortCell {
  cohortIndex: number;
  periodIndex: number;
  retention: number;
  usersRetained: number;
  usersOriginal: number;
}

export interface CohortRow {
  cohortId: string;
  cohortLabel: string;
  originalUsers: number;
  cells: CohortCell[];
}

export interface CohortData {
  cohorts: CohortRow[];
  periods: string[];
  periodLabels: string[];
  metric: string;
  periodType: string;
  generatedAt: string;
}

export interface TooltipData {
  x: number;
  y: number;
  cohortLabel: string;
  periodLabel: string;
  retention: number;
  usersRetained: number;
  usersOriginal: number;
}

export type MetricType = "retention" | "revenue" | "active";
export type PeriodType = "monthly" | "weekly";

// Retention curve parameters
export interface RetentionParams {
  baseRetention: number;
  decayRate: number;
  floor: number;
  noise: number;
}

export const RETENTION_PARAMS: Record<MetricType, RetentionParams> = {
  retention: { baseRetention: 0.75, decayRate: 0.12, floor: 0.08, noise: 0.04 },
  revenue: { baseRetention: 0.7, decayRate: 0.1, floor: 0.15, noise: 0.06 },
  active: { baseRetention: 0.6, decayRate: 0.18, floor: 0.05, noise: 0.05 },
};
