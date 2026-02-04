/**
 * @file Cohort Retention Heatmap - interactive visualization
 */
import "./global.css";
import "./mcp-app.css";
import type { CohortData, MetricType, PeriodType, TooltipData } from "./types";
import { generateCohortData } from "./data-generator";

// DOM elements
const metricSelect = document.getElementById("metric-select") as HTMLSelectElement;
const periodSelect = document.getElementById("period-select") as HTMLSelectElement;
const heatmapGrid = document.getElementById("heatmap-grid")!;
const tooltipEl = document.getElementById("tooltip")!;

// App state
interface AppState {
  data: CohortData | null;
  selectedMetric: MetricType;
  selectedPeriodType: PeriodType;
  highlightedCohort: number | null;
  highlightedPeriod: number | null;
}

const state: AppState = {
  data: null,
  selectedMetric: "retention",
  selectedPeriodType: "monthly",
  highlightedCohort: null,
  highlightedPeriod: null,
};

// Color scale function: Green (high) -> Yellow (medium) -> Red (low)
function getRetentionColor(retention: number): string {
  const hue = retention * 120; // 0-120 range (red to green)
  const saturation = 70;
  const lightness = 45 + (1 - retention) * 15;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Format number with commas
function formatNumber(n: number): string {
  return n.toLocaleString();
}

// Render the heatmap grid
function renderHeatmap(): void {
  if (!state.data) return;

  const { cohorts, periods, periodLabels } = state.data;
  
  // Set grid columns
  heatmapGrid.style.gridTemplateColumns = `120px repeat(${periods.length}, 44px)`;
  
  let html = '';
  
  // Header row: empty corner + period labels
  html += '<div class="header-corner"></div>';
  for (let i = 0; i < periods.length; i++) {
    const highlighted = state.highlightedPeriod === i ? ' highlighted' : '';
    html += `<div class="header-period${highlighted}">${periods[i]}</div>`;
  }
  
  // Data rows
  for (let cohortIndex = 0; cohortIndex < cohorts.length; cohortIndex++) {
    const cohort = cohorts[cohortIndex];
    const isRowHighlighted = state.highlightedCohort === cohortIndex;
    const labelClass = isRowHighlighted ? ' highlighted' : '';
    
    // Cohort label
    html += `
      <div class="cohort-label${labelClass}">
        <span class="cohort-name">${cohort.cohortLabel}</span>
        <span class="cohort-size">${formatNumber(cohort.originalUsers)}</span>
      </div>
    `;
    
    // Cells for each period
    for (let p = 0; p < periods.length; p++) {
      const cellData = cohort.cells.find(c => c.periodIndex === p);
      const isCellHighlighted = isRowHighlighted || state.highlightedPeriod === p;
      
      if (!cellData) {
        html += '<div class="cell-empty"></div>';
      } else {
        const bgColor = getRetentionColor(cellData.retention);
        const highlightedClass = isCellHighlighted ? ' highlighted' : '';
        const retentionPct = Math.round(cellData.retention * 100);
        
        html += `
          <div class="cell${highlightedClass}" 
               style="background-color: ${bgColor}"
               data-cohort="${cohortIndex}"
               data-period="${p}"
               data-label="${cohort.cohortLabel}"
               data-period-label="${periodLabels[p]}"
               data-retention="${cellData.retention}"
               data-retained="${cellData.usersRetained}"
               data-original="${cellData.usersOriginal}">
            ${retentionPct}
          </div>
        `;
      }
    }
  }
  
  heatmapGrid.innerHTML = html;
  addCellEventListeners();
}

// Add event listeners to cells
function addCellEventListeners(): void {
  const cells = heatmapGrid.querySelectorAll('.cell');
  
  cells.forEach(cell => {
    cell.addEventListener('mouseenter', (e) => {
      const target = e.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      
      showTooltip({
        x: rect.right + 8,
        y: rect.top,
        cohortLabel: target.dataset.label!,
        periodLabel: target.dataset.periodLabel!,
        retention: parseFloat(target.dataset.retention!),
        usersRetained: parseInt(target.dataset.retained!),
        usersOriginal: parseInt(target.dataset.original!),
      });
    });
    
    cell.addEventListener('mouseleave', hideTooltip);
    
    cell.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      state.highlightedCohort = parseInt(target.dataset.cohort!);
      state.highlightedPeriod = parseInt(target.dataset.period!);
      renderHeatmap();
    });
  });
}

// Show tooltip
function showTooltip(data: TooltipData): void {
  let left = data.x;
  if (left + 200 > window.innerWidth) {
    left = data.x - 216;
  }
  
  tooltipEl.innerHTML = `
    <div class="tooltip-header">${data.cohortLabel} — ${data.periodLabel}</div>
    <div class="tooltip-row">
      <span class="tooltip-label">Retention:</span>
      <span class="tooltip-value">${(data.retention * 100).toFixed(1)}%</span>
    </div>
    <div class="tooltip-row">
      <span class="tooltip-label">Users:</span>
      <span class="tooltip-value">${formatNumber(data.usersRetained)} / ${formatNumber(data.usersOriginal)}</span>
    </div>
  `;
  
  tooltipEl.style.left = `${left}px`;
  tooltipEl.style.top = `${data.y}px`;
  tooltipEl.style.display = 'block';
}

// Hide tooltip
function hideTooltip(): void {
  tooltipEl.style.display = 'none';
}

// Fetch/generate data
function fetchData(): void {
  // Check if data is provided via window (from tool result)
  const windowData = (window as { __TOOL_DATA__?: CohortData }).__TOOL_DATA__;
  
  if (windowData) {
    state.data = windowData;
  } else {
    // Generate data locally for standalone testing
    state.data = generateCohortData(state.selectedMetric, state.selectedPeriodType, 12, 12);
  }
  
  renderHeatmap();
  console.log(`Loaded ${state.data?.cohorts.length} cohorts`);
}

// Event handlers
metricSelect.addEventListener("change", () => {
  state.selectedMetric = metricSelect.value as MetricType;
  state.highlightedCohort = null;
  state.highlightedPeriod = null;
  fetchData();
});

periodSelect.addEventListener("change", () => {
  state.selectedPeriodType = periodSelect.value as PeriodType;
  state.highlightedCohort = null;
  state.highlightedPeriod = null;
  fetchData();
});

// Clear selection when clicking outside grid
document.addEventListener("click", (e) => {
  if (!(e.target as HTMLElement).closest(".heatmap-wrapper")) {
    state.highlightedCohort = null;
    state.highlightedPeriod = null;
    renderHeatmap();
  }
});

// Initialize
fetchData();
