// ============================================================
// P&L Calculation Engine
// All calculations cascade from assumptions + scenario data
// ============================================================

import {
  PLModel,
  ScenarioType,
  ScenarioResult,
  MonthlyData,
  YearSummary,
  ComparisonData,
} from "./pl-types";

/**
 * Generate month labels from a start date for 36 months
 */
export function generateMonthLabels(startDate: string): string[] {
  const date = new Date(startDate + "T00:00:00");
  const labels: string[] = [];
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  for (let i = 0; i < 36; i++) {
    const d = new Date(date.getFullYear(), date.getMonth() + i, 1);
    labels.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
  }
  return labels;
}

/**
 * Calculate the total monthly expense from all categories
 */
function calculateTotalMonthlyExpenses(model: PLModel): {
  breakdown: Record<string, number>;
  total: number;
} {
  const breakdown: Record<string, number> = {};
  let total = 0;

  for (const category of model.expenseCategories) {
    let subtotal = 0;
    for (const item of category.items) {
      subtotal += item.monthlyCost;
    }
    // Add payroll tax estimate (20%) for personnel category
    if (category.name.toLowerCase().includes("personnel")) {
      const taxable = subtotal;
      const tax = Math.round(taxable * 0.2);
      subtotal += tax;
    }
    breakdown[category.id] = subtotal;
    total += subtotal;
  }

  return { breakdown, total };
}

/**
 * Calculate a full scenario (36 months)
 */
export function calculateScenario(
  model: PLModel,
  scenarioType: ScenarioType
): ScenarioResult {
  const scenario = model.scenarios[scenarioType];
  const monthLabels = generateMonthLabels(model.startDate);
  const { breakdown: expenseBreakdown, total: monthlyExpenses } =
    calculateTotalMonthlyExpenses(model);

  const oneTimeStreams = model.revenueStreams.filter((s) => s.type === "one-time");
  const recurringStreams = model.revenueStreams.filter((s) => s.type === "recurring");

  // Build starting value lookup
  const startingValueMap: Record<string, number> = {};
  for (const sv of model.startingValues) {
    startingValueMap[sv.streamId] = sv.count;
  }

  const months: MonthlyData[] = [];
  let cumulativeNetIncome = 0;

  // Track active clients for recurring streams
  const activeClientTracker: Record<string, number> = {};
  for (const stream of recurringStreams) {
    activeClientTracker[stream.id] = startingValueMap[stream.id] || 0;
  }

  for (let i = 0; i < 36; i++) {
    const newClients: Record<string, number> = {};
    const activeClients: Record<string, number> = {};
    const oneTimeRevenue: Record<string, number> = {};
    const recurringRevenue: Record<string, number> = {};

    // Get new client counts from scenario data
    for (const stream of model.revenueStreams) {
      const acq = scenario.clientAcquisition[stream.id];
      newClients[stream.id] = acq ? acq[i] || 0 : 0;
    }

    // Calculate one-time revenue
    let totalOneTimeRevenue = 0;
    for (const stream of oneTimeStreams) {
      const rev = newClients[stream.id] * stream.price;
      oneTimeRevenue[stream.id] = rev;
      totalOneTimeRevenue += rev;
    }

    // Calculate recurring revenue (with churn)
    let totalRecurringRevenue = 0;
    for (const stream of recurringStreams) {
      // Apply churn to existing clients, then add new
      if (i > 0) {
        const churned = Math.floor(
          activeClientTracker[stream.id] * model.monthlyChurnRate
        );
        activeClientTracker[stream.id] = Math.max(
          0,
          activeClientTracker[stream.id] - churned
        );
      }
      activeClientTracker[stream.id] += newClients[stream.id];
      activeClients[stream.id] = activeClientTracker[stream.id];

      const rev = activeClients[stream.id] * stream.price;
      recurringRevenue[stream.id] = rev;
      totalRecurringRevenue += rev;
    }

    const totalRevenue = totalOneTimeRevenue + totalRecurringRevenue;
    const netIncome = totalRevenue - monthlyExpenses;
    cumulativeNetIncome += netIncome;

    months.push({
      monthIndex: i,
      monthLabel: monthLabels[i],
      newClients,
      activeClients: { ...activeClients },
      oneTimeRevenue,
      recurringRevenue,
      totalOneTimeRevenue,
      totalRecurringRevenue,
      totalRevenue,
      expenseBreakdown: { ...expenseBreakdown },
      totalExpenses: monthlyExpenses,
      netIncome,
      cumulativeNetIncome,
      mrr: totalRecurringRevenue,
      arr: totalRecurringRevenue * 12,
      grossMargin: totalRevenue > 0 ? (totalRevenue - monthlyExpenses) / totalRevenue : 0,
    });
  }

  // Build year summaries
  const year1 = buildYearSummary(months.slice(0, 12), 1, model.startDate);
  const year2 = buildYearSummary(months.slice(12, 24), 2, model.startDate);
  const year3 = buildYearSummary(months.slice(24, 36), 3, model.startDate);
  const totals = buildTotalSummary(months, model.startDate);

  return { type: scenarioType, months, year1, year2, year3, totals };
}

function buildYearSummary(
  months: MonthlyData[],
  yearNum: number,
  startDate: string
): YearSummary {
  const startYear = new Date(startDate + "T00:00:00").getFullYear();
  let totalRevenue = 0;
  let totalOneTimeRevenue = 0;
  let totalRecurringRevenue = 0;
  let totalExpenses = 0;

  for (const m of months) {
    totalRevenue += m.totalRevenue;
    totalOneTimeRevenue += m.totalOneTimeRevenue;
    totalRecurringRevenue += m.totalRecurringRevenue;
    totalExpenses += m.totalExpenses;
  }

  const lastMonth = months[months.length - 1];
  const netIncome = totalRevenue - totalExpenses;

  return {
    year: startYear + yearNum - 1,
    totalRevenue,
    totalOneTimeRevenue,
    totalRecurringRevenue,
    totalExpenses,
    netIncome,
    endingMRR: lastMonth?.mrr || 0,
    endingARR: lastMonth?.arr || 0,
    averageMonthlyRevenue: totalRevenue / (months.length || 1),
    profitMargin: totalRevenue > 0 ? netIncome / totalRevenue : 0,
  };
}

function buildTotalSummary(months: MonthlyData[], startDate: string): YearSummary {
  const startYear = new Date(startDate + "T00:00:00").getFullYear();
  let totalRevenue = 0;
  let totalOneTimeRevenue = 0;
  let totalRecurringRevenue = 0;
  let totalExpenses = 0;

  for (const m of months) {
    totalRevenue += m.totalRevenue;
    totalOneTimeRevenue += m.totalOneTimeRevenue;
    totalRecurringRevenue += m.totalRecurringRevenue;
    totalExpenses += m.totalExpenses;
  }

  const lastMonth = months[months.length - 1];
  const netIncome = totalRevenue - totalExpenses;

  return {
    year: startYear,
    totalRevenue,
    totalOneTimeRevenue,
    totalRecurringRevenue,
    totalExpenses,
    netIncome,
    endingMRR: lastMonth?.mrr || 0,
    endingARR: lastMonth?.arr || 0,
    averageMonthlyRevenue: totalRevenue / (months.length || 1),
    profitMargin: totalRevenue > 0 ? netIncome / totalRevenue : 0,
  };
}

/**
 * Calculate all three scenarios and return comparison data
 */
export function calculateAllScenarios(model: PLModel): ComparisonData {
  return {
    conservative: calculateScenario(model, "conservative"),
    moderate: calculateScenario(model, "moderate"),
    aggressive: calculateScenario(model, "aggressive"),
  };
}

/**
 * Format currency
 */
export function formatCurrency(value: number): string {
  const isNegative = value < 0;
  const formatted = Math.abs(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return isNegative ? `(${formatted})` : formatted;
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
