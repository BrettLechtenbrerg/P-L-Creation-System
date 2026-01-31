// ============================================================
// P&L Default Data — TSAI Example & Empty Template
// ============================================================

import { v4 as uuid } from "uuid";
import { PLModel, ExpenseCategory, RevenueStream, StartingValue, ScenarioData } from "./pl-types";

// ============================================================
// TSAI Example Data (from the original P&L prompt)
// ============================================================

function createTSAIRevenueStreams(): RevenueStream[] {
  return [
    // One-Time Services
    { id: uuid(), name: "Basic Consulting (hourly)", type: "one-time", price: 500, unit: "per hour" },
    { id: uuid(), name: "Website Build - Down Payment", type: "one-time", price: 2500, unit: "per project" },
    { id: uuid(), name: "Website Build - Completion", type: "one-time", price: 2500, unit: "per project" },
    { id: uuid(), name: "Prototype MVP - Down Payment", type: "one-time", price: 5000, unit: "per project" },
    { id: uuid(), name: "Custom Software Project", type: "one-time", price: 15000, unit: "per project" },
    { id: uuid(), name: "AI Voice Agents - Setup", type: "one-time", price: 1499, unit: "per client" },
    { id: uuid(), name: "SEO & Blogging - Setup", type: "one-time", price: 799, unit: "per client" },
    { id: uuid(), name: "Database Reactivation - Setup", type: "one-time", price: 997, unit: "per client" },
    { id: uuid(), name: "Social Media - Setup", type: "one-time", price: 497, unit: "per client" },
    // Recurring Services
    { id: uuid(), name: "AI Voice Agents - Monthly", type: "recurring", price: 597, unit: "per client/mo" },
    { id: uuid(), name: "SEO & Blogging - Monthly", type: "recurring", price: 597, unit: "per client/mo" },
    { id: uuid(), name: "Database Reactivation - Monthly", type: "recurring", price: 397, unit: "per client/mo" },
    { id: uuid(), name: "Social Media - Monthly", type: "recurring", price: 297, unit: "per client/mo" },
    { id: uuid(), name: "AI Lab - Basic", type: "recurring", price: 49, unit: "per member/mo" },
    { id: uuid(), name: "AI Lab - Builders", type: "recurring", price: 97, unit: "per member/mo" },
    { id: uuid(), name: "Go High Level Resale", type: "recurring", price: 97, unit: "per client/mo" },
  ];
}

function createTSAIExpenseCategories(): ExpenseCategory[] {
  return [
    {
      id: uuid(),
      name: "Personnel",
      items: [
        { id: uuid(), name: "CEO Salary", monthlyCost: 10000 },
        { id: uuid(), name: "COO Salary", monthlyCost: 10000 },
        { id: uuid(), name: "Sales/Marketing Staff", monthlyCost: 0 },
        { id: uuid(), name: "Technical Staff", monthlyCost: 0 },
        { id: uuid(), name: "Administrative Staff", monthlyCost: 0 },
        { id: uuid(), name: "Contractors", monthlyCost: 0 },
      ],
    },
    {
      id: uuid(),
      name: "Technology",
      items: [
        { id: uuid(), name: "GoHighLevel (GHL)", monthlyCost: 297 },
        { id: uuid(), name: "GitHub", monthlyCost: 10 },
        { id: uuid(), name: "Render", monthlyCost: 10 },
        { id: uuid(), name: "Railway", monthlyCost: 10 },
        { id: uuid(), name: "Text/Email Services", monthlyCost: 20 },
        { id: uuid(), name: "Claude/OpenAI API", monthlyCost: 0 },
        { id: uuid(), name: "Domain & Hosting", monthlyCost: 0 },
        { id: uuid(), name: "Other Software", monthlyCost: 0 },
      ],
    },
    {
      id: uuid(),
      name: "Marketing",
      items: [
        { id: uuid(), name: "Paid Advertising", monthlyCost: 0 },
        { id: uuid(), name: "Content Marketing", monthlyCost: 0 },
        { id: uuid(), name: "SEO Tools", monthlyCost: 0 },
        { id: uuid(), name: "Events & Networking", monthlyCost: 0 },
      ],
    },
    {
      id: uuid(),
      name: "Professional Services",
      items: [
        { id: uuid(), name: "Legal", monthlyCost: 0 },
        { id: uuid(), name: "Accounting", monthlyCost: 0 },
        { id: uuid(), name: "Insurance", monthlyCost: 0 },
        { id: uuid(), name: "Consulting", monthlyCost: 0 },
      ],
    },
    {
      id: uuid(),
      name: "Administrative",
      items: [
        { id: uuid(), name: "Office/Coworking", monthlyCost: 0 },
        { id: uuid(), name: "Travel", monthlyCost: 0 },
        { id: uuid(), name: "Equipment", monthlyCost: 0 },
        { id: uuid(), name: "Miscellaneous", monthlyCost: 0 },
      ],
    },
  ];
}

/**
 * Generate scenario data with gradual growth for test data
 */
function generateScenarioAcquisition(
  streams: RevenueStream[],
  multiplier: number // 1 = conservative, 1.5 = moderate, 2.5 = aggressive
): ScenarioData {
  const clientAcquisition: Record<string, number[]> = {};

  for (const stream of streams) {
    const months: number[] = [];
    for (let i = 0; i < 36; i++) {
      let base: number;
      if (stream.type === "one-time") {
        // One-time services: gradual increase
        if (stream.name.includes("Consulting")) {
          base = Math.floor(2 + (i * 0.5) * multiplier);
        } else if (stream.name.includes("Website")) {
          base = Math.floor((i % 3 === 0 ? 1 : 0) * multiplier + (i > 12 ? 1 : 0));
        } else if (stream.name.includes("MVP") || stream.name.includes("Custom")) {
          base = Math.floor((i % 4 === 0 ? 1 : 0) * multiplier);
        } else {
          // Setup fees: new clients per month
          base = Math.floor((i < 6 ? 0 : 1) * multiplier + (i > 18 ? 1 : 0));
        }
      } else {
        // Recurring: new subscribers per month
        if (stream.name.includes("AI Lab - Basic")) {
          base = Math.floor(1 * multiplier + (i > 12 ? 1 : 0));
        } else if (stream.name.includes("AI Lab - Builder")) {
          base = Math.floor((i < 3 ? 0 : 1) * multiplier);
        } else if (stream.name.includes("GHL")) {
          base = Math.floor((i < 2 ? 2 : 3) * multiplier);
        } else {
          base = Math.floor((i < 6 ? 0 : 1) * multiplier);
        }
      }
      months.push(Math.max(0, base));
    }
    clientAcquisition[stream.id] = months;
  }

  return { clientAcquisition };
}

/**
 * Create the TSAI demo P&L model with test data
 */
export function createTSAIDemoModel(): PLModel {
  const revenueStreams = createTSAIRevenueStreams();
  const expenseCategories = createTSAIExpenseCategories();

  // Starting values for recurring streams
  const recurringStreams = revenueStreams.filter((s) => s.type === "recurring");
  const startingValues: StartingValue[] = recurringStreams.map((stream) => ({
    streamId: stream.id,
    count: stream.name.includes("AI Lab - Basic") ? 20 : 0,
  }));

  return {
    companyName: "Total Success AI (TSAI)",
    startDate: "2026-01-01",
    revenueStreams,
    expenseCategories,
    startingValues,
    monthlyChurnRate: 0.05,
    scenarios: {
      conservative: generateScenarioAcquisition(revenueStreams, 1),
      moderate: generateScenarioAcquisition(revenueStreams, 1.5),
      aggressive: generateScenarioAcquisition(revenueStreams, 2.5),
    },
  };
}

/**
 * Create an empty P&L model for new users
 */
export function createEmptyModel(): PLModel {
  const expenseCategories = createTSAIExpenseCategories().map((cat) => ({
    ...cat,
    items: cat.items.map((item) => ({ ...item, monthlyCost: 0 })),
  }));

  return {
    companyName: "",
    startDate: "2026-01-01",
    revenueStreams: [],
    expenseCategories,
    startingValues: [],
    monthlyChurnRate: 0.05,
    scenarios: {
      conservative: { clientAcquisition: {} },
      moderate: { clientAcquisition: {} },
      aggressive: { clientAcquisition: {} },
    },
  };
}
