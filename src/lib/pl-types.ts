// ============================================================
// P&L Creation System — Core Types
// ============================================================

export interface RevenueStream {
  id: string;
  name: string;
  type: "one-time" | "recurring";
  price: number;
  unit: string; // "per hour", "per project", "per client/mo", etc.
}

export interface ExpenseItem {
  id: string;
  name: string;
  monthlyCost: number;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  items: ExpenseItem[];
}

export interface StartingValue {
  streamId: string; // references a recurring RevenueStream.id
  count: number;
}

export type ScenarioType = "conservative" | "moderate" | "aggressive";

export interface ScenarioData {
  // streamId -> array of 36 monthly values (new clients/units that month)
  clientAcquisition: Record<string, number[]>;
}

export interface PLModel {
  companyName: string;
  startDate: string; // "YYYY-MM-DD"
  revenueStreams: RevenueStream[];
  expenseCategories: ExpenseCategory[];
  startingValues: StartingValue[];
  monthlyChurnRate: number; // 0.05 = 5%
  scenarios: Record<ScenarioType, ScenarioData>;
}

// ============================================================
// Computed / Derived Types (output of calculation engine)
// ============================================================

export interface MonthlyData {
  monthIndex: number; // 0-35
  monthLabel: string; // "Jan 2026"
  // New clients acquired this month, per stream
  newClients: Record<string, number>;
  // Active recurring clients (cumulative - churn + new)
  activeClients: Record<string, number>;
  // Revenue
  oneTimeRevenue: Record<string, number>;
  recurringRevenue: Record<string, number>;
  totalOneTimeRevenue: number;
  totalRecurringRevenue: number;
  totalRevenue: number;
  // Expenses
  expenseBreakdown: Record<string, number>; // category id -> subtotal
  totalExpenses: number;
  // Bottom line
  netIncome: number;
  cumulativeNetIncome: number;
  // Key metrics
  mrr: number;
  arr: number;
  grossMargin: number;
}

export interface YearSummary {
  year: number;
  totalRevenue: number;
  totalOneTimeRevenue: number;
  totalRecurringRevenue: number;
  totalExpenses: number;
  netIncome: number;
  endingMRR: number;
  endingARR: number;
  averageMonthlyRevenue: number;
  profitMargin: number;
}

export interface ScenarioResult {
  type: ScenarioType;
  months: MonthlyData[];
  year1: YearSummary;
  year2: YearSummary;
  year3: YearSummary;
  totals: YearSummary;
}

export interface ComparisonData {
  conservative: ScenarioResult;
  moderate: ScenarioResult;
  aggressive: ScenarioResult;
}

// ============================================================
// Supabase / Persistence Types
// ============================================================

export interface SavedPLModel {
  id: string;
  slug: string;
  company_name: string;
  data: PLModel;
  is_published: boolean;
  is_password_protected: boolean;
  share_password: string | null;
  created_at: string;
  updated_at: string;
}
