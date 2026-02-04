/**
 * @file Data generator for cohort heatmap
 */
import type { CohortData, CohortRow, CohortCell, MetricType, RetentionParams } from "./types";
import { RETENTION_PARAMS } from "./types";

// Retention curve generator using exponential decay
function generateRetention(period: number, params: RetentionParams): number {
  if (period === 0) return 1.0;

  const { baseRetention, decayRate, floor, noise } = params;
  const base = baseRetention * Math.exp(-decayRate * (period - 1)) + floor;
  const variation = (Math.random() - 0.5) * 2 * noise;

  return Math.max(0, Math.min(1, base + variation));
}

// Generate cohort data
export function generateCohortData(
  metric: MetricType = "retention",
  periodType: string = "monthly",
  cohortCount: number = 12,
  maxPeriods: number = 12
): CohortData {
  const now = new Date();
  const cohorts: CohortRow[] = [];
  const periods: string[] = [];
  const periodLabels: string[] = [];

  // Generate period headers
  for (let i = 0; i < maxPeriods; i++) {
    periods.push(`M${i}`);
    periodLabels.push(i === 0 ? "Month 0" : `Month ${i}`);
  }

  const params = RETENTION_PARAMS[metric] ?? RETENTION_PARAMS.retention;

  // Generate cohorts (oldest first)
  for (let c = 0; c < cohortCount; c++) {
    const cohortDate = new Date(now);
    cohortDate.setMonth(cohortDate.getMonth() - (cohortCount - 1 - c));

    const cohortId = `${cohortDate.getFullYear()}-${String(cohortDate.getMonth() + 1).padStart(2, "0")}`;
    const cohortLabel = cohortDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    // Random cohort size: 1000-5000 users
    const originalUsers = Math.floor(1000 + Math.random() * 4000);

    // Number of periods this cohort has data for (newer cohorts have fewer periods)
    const periodsAvailable = cohortCount - c;

    const cells: CohortCell[] = [];
    let previousRetention = 1.0;

    for (let p = 0; p < Math.min(periodsAvailable, maxPeriods); p++) {
      // Retention must decrease or stay same (with small exceptions for noise)
      let retention = generateRetention(p, params);
      retention = Math.min(retention, previousRetention + 0.02);
      previousRetention = retention;

      cells.push({
        cohortIndex: c,
        periodIndex: p,
        retention,
        usersRetained: Math.round(originalUsers * retention),
        usersOriginal: originalUsers,
      });
    }

    cohorts.push({ cohortId, cohortLabel, originalUsers, cells });
  }

  return {
    cohorts,
    periods,
    periodLabels,
    metric,
    periodType,
    generatedAt: new Date().toISOString(),
  };
}

export function formatCohortSummary(data: CohortData): string {
  const avgRetention = data.cohorts
    .flatMap((c) => c.cells)
    .filter((cell) => cell.periodIndex > 0)
    .reduce((sum, cell, _, arr) => sum + cell.retention / arr.length, 0);

  return `Cohort Analysis: ${data.cohorts.length} cohorts, ${data.periods.length} periods
Average retention: ${(avgRetention * 100).toFixed(1)}%
Metric: ${data.metric}, Period: ${data.periodType}`;
}
