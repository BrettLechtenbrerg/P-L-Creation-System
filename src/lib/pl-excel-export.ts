// ============================================================
// P&L Excel Export — Generates .xlsx with REAL Excel formulas
// ============================================================

import ExcelJS from "exceljs";
import { PLModel, ScenarioType } from "./pl-types";
import { generateMonthLabels } from "./pl-calculations";

const YELLOW_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFFF00" },
};

const BOLD: Partial<ExcelJS.Font> = { bold: true };
const CURRENCY_FMT = "$#,##0";
const PCT_FMT = "0.0%";

function colLetter(n: number): string {
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export async function generateExcel(model: PLModel): Promise<Blob> {
  const wb = new ExcelJS.Workbook();

  const rowMap = createAssumptionsSheet(wb, model);
  const scenarioTypes: ScenarioType[] = ["conservative", "moderate", "aggressive"];
  const scenarioRowMaps: Record<string, ReturnType<typeof createScenarioSheet>> = {};

  for (const st of scenarioTypes) {
    const label = st.charAt(0).toUpperCase() + st.slice(1);
    scenarioRowMaps[`12-${st}`] = createScenarioSheet(wb, model, st, `12-Month ${label}`, 12, rowMap);
    scenarioRowMaps[`36-${st}`] = createScenarioSheet(wb, model, st, `36-Month ${label}`, 36, rowMap);
  }

  createComparisonSheet(wb, model, scenarioRowMaps);

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

// ============================================================
// Assumptions Sheet
// ============================================================

interface AssumptionsRowMap {
  priceRows: Record<string, number>; // streamId -> row
  expenseTotalRow: number;
  startingValueRows: Record<string, number>; // streamId -> row
  churnRow: number;
  categorySubtotalRows: Record<string, number>; // categoryId -> row
}

function createAssumptionsSheet(wb: ExcelJS.Workbook, model: PLModel): AssumptionsRowMap {
  const ws = wb.addWorksheet("Assumptions");
  const oneTime = model.revenueStreams.filter((s) => s.type === "one-time");
  const recurring = model.revenueStreams.filter((s) => s.type === "recurring");
  const priceRows: Record<string, number> = {};
  const startingValueRows: Record<string, number> = {};
  const categorySubtotalRows: Record<string, number> = {};
  let r = 1;

  // Header
  ws.mergeCells(`A${r}:D${r}`);
  ws.getCell(`A${r}`).value = `${model.companyName || "Company"} - Financial Model Assumptions`;
  ws.getCell(`A${r}`).font = { bold: true, size: 14 };
  r++;
  ws.mergeCells(`A${r}:D${r}`);
  ws.getCell(`A${r}`).value = "Edit values in YELLOW cells - Changes cascade to all P&L sheets";
  ws.getCell(`A${r}`).font = { italic: true };
  r += 2;

  // SERVICE PRICING
  ws.getCell(`A${r}`).value = "SERVICE PRICING";
  ws.getCell(`A${r}`).font = { bold: true, size: 12 };
  r++;
  ws.getCell(`A${r}`).value = "Service";
  ws.getCell(`B${r}`).value = "Type";
  ws.getCell(`C${r}`).value = "Price";
  ws.getCell(`D${r}`).value = "Unit";
  for (const c of ["A", "B", "C", "D"]) ws.getCell(`${c}${r}`).font = BOLD;
  r++;

  // One-Time
  ws.getCell(`A${r}`).value = "ONE-TIME SERVICES";
  ws.getCell(`A${r}`).font = BOLD;
  r++;
  for (const s of oneTime) {
    ws.getCell(`A${r}`).value = s.name;
    ws.getCell(`B${r}`).value = "One-Time";
    ws.getCell(`C${r}`).value = s.price;
    ws.getCell(`C${r}`).numFmt = CURRENCY_FMT;
    ws.getCell(`C${r}`).fill = YELLOW_FILL;
    ws.getCell(`D${r}`).value = s.unit;
    priceRows[s.id] = r;
    r++;
  }
  r++;

  // Recurring
  ws.getCell(`A${r}`).value = "RECURRING SERVICES";
  ws.getCell(`A${r}`).font = BOLD;
  r++;
  for (const s of recurring) {
    ws.getCell(`A${r}`).value = s.name;
    ws.getCell(`B${r}`).value = "Recurring";
    ws.getCell(`C${r}`).value = s.price;
    ws.getCell(`C${r}`).numFmt = CURRENCY_FMT;
    ws.getCell(`C${r}`).fill = YELLOW_FILL;
    ws.getCell(`D${r}`).value = s.unit;
    priceRows[s.id] = r;
    r++;
  }
  r += 2;

  // MONTHLY EXPENSES
  ws.getCell(`A${r}`).value = "MONTHLY EXPENSES";
  ws.getCell(`A${r}`).font = { bold: true, size: 12 };
  r++;
  ws.getCell(`A${r}`).value = "Category";
  ws.getCell(`B${r}`).value = "Item";
  ws.getCell(`C${r}`).value = "Monthly Cost";
  for (const c of ["A", "B", "C"]) ws.getCell(`${c}${r}`).font = BOLD;
  r++;

  const allExpenseItemRows: number[] = [];

  for (const cat of model.expenseCategories) {
    ws.getCell(`A${r}`).value = cat.name.toUpperCase();
    ws.getCell(`A${r}`).font = BOLD;
    r++;
    const catItemStart = r;
    for (const item of cat.items) {
      ws.getCell(`B${r}`).value = item.name;
      ws.getCell(`C${r}`).value = item.monthlyCost;
      ws.getCell(`C${r}`).numFmt = CURRENCY_FMT;
      ws.getCell(`C${r}`).fill = YELLOW_FILL;
      allExpenseItemRows.push(r);
      r++;
    }
    // Subtotal
    if (cat.items.length > 0) {
      ws.getCell(`B${r}`).value = `${cat.name} Subtotal`;
      ws.getCell(`B${r}`).font = BOLD;
      ws.getCell(`C${r}`).value = { formula: `SUM(C${catItemStart}:C${r - 1})` } as ExcelJS.CellFormulaValue;
      ws.getCell(`C${r}`).numFmt = CURRENCY_FMT;
      ws.getCell(`C${r}`).font = BOLD;
      categorySubtotalRows[cat.id] = r;
      r++;
    }
    // Payroll tax for personnel
    if (cat.name.toLowerCase().includes("personnel") && cat.items.length > 0) {
      ws.getCell(`B${r}`).value = "Payroll Taxes & Benefits (20%)";
      ws.getCell(`C${r}`).value = { formula: `C${r - 1}*0.2` } as ExcelJS.CellFormulaValue;
      ws.getCell(`C${r}`).numFmt = CURRENCY_FMT;
      allExpenseItemRows.push(r);
      r++;
    }
    r++;
  }

  // Total Monthly Expenses
  const subtotalRefs = Object.values(categorySubtotalRows);
  const expFormula = subtotalRefs.map((row) => `C${row}`).join("+");
  ws.getCell(`A${r}`).value = "TOTAL MONTHLY EXPENSES";
  ws.getCell(`A${r}`).font = { bold: true, size: 12 };
  ws.getCell(`C${r}`).value = { formula: expFormula || "0" } as ExcelJS.CellFormulaValue;
  ws.getCell(`C${r}`).numFmt = CURRENCY_FMT;
  ws.getCell(`C${r}`).font = BOLD;
  const expenseTotalRow = r;
  r += 2;

  // STARTING VALUES
  ws.getCell(`A${r}`).value = "STARTING VALUES (Month 1)";
  ws.getCell(`A${r}`).font = { bold: true, size: 12 };
  r++;
  for (const sv of model.startingValues) {
    const stream = recurring.find((s) => s.id === sv.streamId);
    ws.getCell(`B${r}`).value = stream ? stream.name : sv.streamId;
    ws.getCell(`C${r}`).value = sv.count;
    ws.getCell(`C${r}`).fill = YELLOW_FILL;
    startingValueRows[sv.streamId] = r;
    r++;
  }
  r++;

  // CHURN RATE
  ws.getCell(`A${r}`).value = "MONTHLY CHURN RATE";
  ws.getCell(`A${r}`).font = { bold: true, size: 12 };
  r++;
  ws.getCell(`B${r}`).value = "Monthly Churn Rate (all recurring)";
  ws.getCell(`C${r}`).value = model.monthlyChurnRate;
  ws.getCell(`C${r}`).numFmt = PCT_FMT;
  ws.getCell(`C${r}`).fill = YELLOW_FILL;
  const churnRow = r;

  // Column widths
  ws.getColumn("A").width = 15;
  ws.getColumn("B").width = 30;
  ws.getColumn("C").width = 18;
  ws.getColumn("D").width = 18;

  return { priceRows, expenseTotalRow, startingValueRows, churnRow, categorySubtotalRows };
}

// ============================================================
// Scenario Sheet (12 or 36 months)
// ============================================================

interface ScenarioRowMap {
  totalRevenueRow: number;
  totalExpensesRow: number;
  netIncomeRow: number;
  cumulativeRow: number;
  mrrRow: number;
}

function createScenarioSheet(
  wb: ExcelJS.Workbook,
  model: PLModel,
  scenarioType: ScenarioType,
  sheetName: string,
  numMonths: number,
  aMap: AssumptionsRowMap
): ScenarioRowMap {
  const ws = wb.addWorksheet(sheetName);
  const labels = generateMonthLabels(model.startDate).slice(0, numMonths);
  const scenario = model.scenarios[scenarioType];
  const oneTime = model.revenueStreams.filter((s) => s.type === "one-time");
  const recurring = model.revenueStreams.filter((s) => s.type === "recurring");
  const totalCol = colLetter(numMonths + 2);
  let r = 1;

  // Headers
  ws.mergeCells(`A${r}:${colLetter(numMonths + 2)}${r}`);
  ws.getCell(`A${r}`).value = `${model.companyName || "Company"} - ${sheetName}`;
  ws.getCell(`A${r}`).font = { bold: true, size: 14 };
  r++;
  ws.getCell(`A${r}`).value = `Projections: ${labels[0]} - ${labels[labels.length - 1]} | Edit client acquisition in YELLOW cells`;
  ws.getCell(`A${r}`).font = { italic: true };
  r += 2;

  // Column headers
  const headerRow = r;
  ws.getCell(`A${r}`).value = "Category";
  ws.getCell(`A${r}`).font = BOLD;
  for (let i = 0; i < numMonths; i++) {
    const c = colLetter(i + 2);
    ws.getCell(`${c}${r}`).value = labels[i];
    ws.getCell(`${c}${r}`).font = BOLD;
  }
  ws.getCell(`${totalCol}${r}`).value = "TOTAL";
  ws.getCell(`${totalCol}${r}`).font = BOLD;
  r++;

  // CLIENT ACQUISITION
  ws.getCell(`A${r}`).value = "CLIENT ACQUISITION (Edit These)";
  ws.getCell(`A${r}`).font = { bold: true, size: 11 };
  r++;

  const acqRows: Record<string, number> = {};
  for (const stream of model.revenueStreams) {
    ws.getCell(`A${r}`).value = `  ${stream.name}`;
    const acq = scenario.clientAcquisition[stream.id] || [];
    for (let i = 0; i < numMonths; i++) {
      const c = colLetter(i + 2);
      ws.getCell(`${c}${r}`).value = acq[i] || 0;
      ws.getCell(`${c}${r}`).fill = YELLOW_FILL;
    }
    ws.getCell(`${totalCol}${r}`).value = {
      formula: `SUM(B${r}:${colLetter(numMonths + 1)}${r})`,
    } as ExcelJS.CellFormulaValue;
    acqRows[stream.id] = r;
    r++;
  }
  r++;

  // REVENUE
  ws.getCell(`A${r}`).value = "REVENUE";
  ws.getCell(`A${r}`).font = { bold: true, size: 11 };
  r++;

  // One-Time Revenue
  ws.getCell(`A${r}`).value = "  One-Time Revenue";
  ws.getCell(`A${r}`).font = BOLD;
  r++;

  const otRevRows: number[] = [];
  for (const stream of oneTime) {
    const priceRow = aMap.priceRows[stream.id];
    ws.getCell(`A${r}`).value = `    ${stream.name}`;
    for (let i = 0; i < numMonths; i++) {
      const c = colLetter(i + 2);
      ws.getCell(`${c}${r}`).value = {
        formula: `${c}${acqRows[stream.id]}*Assumptions!$C$${priceRow}`,
      } as ExcelJS.CellFormulaValue;
      ws.getCell(`${c}${r}`).numFmt = CURRENCY_FMT;
    }
    ws.getCell(`${totalCol}${r}`).value = {
      formula: `SUM(B${r}:${colLetter(numMonths + 1)}${r})`,
    } as ExcelJS.CellFormulaValue;
    ws.getCell(`${totalCol}${r}`).numFmt = CURRENCY_FMT;
    otRevRows.push(r);
    r++;
  }

  // One-Time Subtotal
  const otSubRow = r;
  ws.getCell(`A${r}`).value = "  One-Time Revenue Total";
  ws.getCell(`A${r}`).font = BOLD;
  for (let i = 0; i < numMonths; i++) {
    const c = colLetter(i + 2);
    ws.getCell(`${c}${r}`).value = {
      formula: otRevRows.length > 0 ? `SUM(${otRevRows.map((row) => `${c}${row}`).join(",")})` : "0",
    } as ExcelJS.CellFormulaValue;
    ws.getCell(`${c}${r}`).numFmt = CURRENCY_FMT;
  }
  ws.getCell(`${totalCol}${r}`).value = {
    formula: `SUM(B${r}:${colLetter(numMonths + 1)}${r})`,
  } as ExcelJS.CellFormulaValue;
  ws.getCell(`${totalCol}${r}`).numFmt = CURRENCY_FMT;
  r++;

  // Recurring Revenue
  ws.getCell(`A${r}`).value = "  Recurring Revenue (MRR)";
  ws.getCell(`A${r}`).font = BOLD;
  r++;

  const recRevRows: number[] = [];
  const activeRows: Record<string, number> = {};

  for (const stream of recurring) {
    const priceRow = aMap.priceRows[stream.id];
    const svRow = aMap.startingValueRows[stream.id];

    // Active clients row
    ws.getCell(`A${r}`).value = `    Active ${stream.name} Clients`;
    for (let i = 0; i < numMonths; i++) {
      const c = colLetter(i + 2);
      if (i === 0) {
        // First month: starting + new (no churn on starting for month 1)
        ws.getCell(`${c}${r}`).value = {
          formula: svRow
            ? `Assumptions!$C$${svRow}+${c}${acqRows[stream.id]}`
            : `${c}${acqRows[stream.id]}`,
        } as ExcelJS.CellFormulaValue;
      } else {
        const prevC = colLetter(i + 1);
        ws.getCell(`${c}${r}`).value = {
          formula: `MAX(0,ROUND(${prevC}${r}*(1-Assumptions!$C$${aMap.churnRow}),0)+${c}${acqRows[stream.id]})`,
        } as ExcelJS.CellFormulaValue;
      }
    }
    activeRows[stream.id] = r;
    r++;

    // Revenue row
    ws.getCell(`A${r}`).value = `    ${stream.name} Revenue`;
    for (let i = 0; i < numMonths; i++) {
      const c = colLetter(i + 2);
      ws.getCell(`${c}${r}`).value = {
        formula: `${c}${activeRows[stream.id]}*Assumptions!$C$${priceRow}`,
      } as ExcelJS.CellFormulaValue;
      ws.getCell(`${c}${r}`).numFmt = CURRENCY_FMT;
    }
    ws.getCell(`${totalCol}${r}`).value = {
      formula: `SUM(B${r}:${colLetter(numMonths + 1)}${r})`,
    } as ExcelJS.CellFormulaValue;
    ws.getCell(`${totalCol}${r}`).numFmt = CURRENCY_FMT;
    recRevRows.push(r);
    r++;
  }

  // Recurring Subtotal
  const recSubRow = r;
  ws.getCell(`A${r}`).value = "  Recurring Revenue Total";
  ws.getCell(`A${r}`).font = BOLD;
  for (let i = 0; i < numMonths; i++) {
    const c = colLetter(i + 2);
    ws.getCell(`${c}${r}`).value = {
      formula: recRevRows.length > 0 ? `SUM(${recRevRows.map((row) => `${c}${row}`).join(",")})` : "0",
    } as ExcelJS.CellFormulaValue;
    ws.getCell(`${c}${r}`).numFmt = CURRENCY_FMT;
  }
  ws.getCell(`${totalCol}${r}`).value = {
    formula: `SUM(B${r}:${colLetter(numMonths + 1)}${r})`,
  } as ExcelJS.CellFormulaValue;
  ws.getCell(`${totalCol}${r}`).numFmt = CURRENCY_FMT;
  r++;

  // TOTAL REVENUE
  const totalRevenueRow = r;
  ws.getCell(`A${r}`).value = "TOTAL REVENUE";
  ws.getCell(`A${r}`).font = { bold: true, size: 11 };
  for (let i = 0; i < numMonths; i++) {
    const c = colLetter(i + 2);
    ws.getCell(`${c}${r}`).value = {
      formula: `${c}${otSubRow}+${c}${recSubRow}`,
    } as ExcelJS.CellFormulaValue;
    ws.getCell(`${c}${r}`).numFmt = CURRENCY_FMT;
    ws.getCell(`${c}${r}`).font = BOLD;
  }
  ws.getCell(`${totalCol}${r}`).value = {
    formula: `SUM(B${r}:${colLetter(numMonths + 1)}${r})`,
  } as ExcelJS.CellFormulaValue;
  ws.getCell(`${totalCol}${r}`).numFmt = CURRENCY_FMT;
  ws.getCell(`${totalCol}${r}`).font = BOLD;
  r += 2;

  // EXPENSES
  ws.getCell(`A${r}`).value = "EXPENSES";
  ws.getCell(`A${r}`).font = { bold: true, size: 11 };
  r++;

  const expCatRows: number[] = [];
  for (const cat of model.expenseCategories) {
    const subRow = aMap.categorySubtotalRows[cat.id];
    if (!subRow) continue;
    ws.getCell(`A${r}`).value = `  ${cat.name}`;
    for (let i = 0; i < numMonths; i++) {
      const c = colLetter(i + 2);
      ws.getCell(`${c}${r}`).value = {
        formula: `Assumptions!$C$${subRow}`,
      } as ExcelJS.CellFormulaValue;
      ws.getCell(`${c}${r}`).numFmt = CURRENCY_FMT;
    }
    ws.getCell(`${totalCol}${r}`).value = {
      formula: `SUM(B${r}:${colLetter(numMonths + 1)}${r})`,
    } as ExcelJS.CellFormulaValue;
    ws.getCell(`${totalCol}${r}`).numFmt = CURRENCY_FMT;
    expCatRows.push(r);
    r++;
  }

  // TOTAL EXPENSES
  const totalExpensesRow = r;
  ws.getCell(`A${r}`).value = "TOTAL EXPENSES";
  ws.getCell(`A${r}`).font = { bold: true, size: 11 };
  for (let i = 0; i < numMonths; i++) {
    const c = colLetter(i + 2);
    ws.getCell(`${c}${r}`).value = {
      formula: expCatRows.length > 0 ? `SUM(${expCatRows.map((row) => `${c}${row}`).join(",")})` : "0",
    } as ExcelJS.CellFormulaValue;
    ws.getCell(`${c}${r}`).numFmt = CURRENCY_FMT;
    ws.getCell(`${c}${r}`).font = BOLD;
  }
  ws.getCell(`${totalCol}${r}`).value = {
    formula: `SUM(B${r}:${colLetter(numMonths + 1)}${r})`,
  } as ExcelJS.CellFormulaValue;
  ws.getCell(`${totalCol}${r}`).numFmt = CURRENCY_FMT;
  ws.getCell(`${totalCol}${r}`).font = BOLD;
  r += 2;

  // NET INCOME
  const netIncomeRow = r;
  ws.getCell(`A${r}`).value = "NET INCOME / (LOSS)";
  ws.getCell(`A${r}`).font = { bold: true, size: 12 };
  for (let i = 0; i < numMonths; i++) {
    const c = colLetter(i + 2);
    ws.getCell(`${c}${r}`).value = {
      formula: `${c}${totalRevenueRow}-${c}${totalExpensesRow}`,
    } as ExcelJS.CellFormulaValue;
    ws.getCell(`${c}${r}`).numFmt = CURRENCY_FMT;
    ws.getCell(`${c}${r}`).font = BOLD;
  }
  ws.getCell(`${totalCol}${r}`).value = {
    formula: `SUM(B${r}:${colLetter(numMonths + 1)}${r})`,
  } as ExcelJS.CellFormulaValue;
  ws.getCell(`${totalCol}${r}`).numFmt = CURRENCY_FMT;
  ws.getCell(`${totalCol}${r}`).font = BOLD;
  r++;

  // CUMULATIVE
  const cumulativeRow = r;
  ws.getCell(`A${r}`).value = "CUMULATIVE NET INCOME";
  ws.getCell(`A${r}`).font = BOLD;
  for (let i = 0; i < numMonths; i++) {
    const c = colLetter(i + 2);
    if (i === 0) {
      ws.getCell(`${c}${r}`).value = { formula: `${c}${netIncomeRow}` } as ExcelJS.CellFormulaValue;
    } else {
      const prev = colLetter(i + 1);
      ws.getCell(`${c}${r}`).value = { formula: `${prev}${r}+${c}${netIncomeRow}` } as ExcelJS.CellFormulaValue;
    }
    ws.getCell(`${c}${r}`).numFmt = CURRENCY_FMT;
  }
  r += 2;

  // KEY METRICS
  ws.getCell(`A${r}`).value = "KEY METRICS";
  ws.getCell(`A${r}`).font = { bold: true, size: 11 };
  r++;

  const mrrRow = r;
  ws.getCell(`A${r}`).value = "Monthly Recurring Revenue (MRR)";
  for (let i = 0; i < numMonths; i++) {
    const c = colLetter(i + 2);
    ws.getCell(`${c}${r}`).value = { formula: `${c}${recSubRow}` } as ExcelJS.CellFormulaValue;
    ws.getCell(`${c}${r}`).numFmt = CURRENCY_FMT;
  }
  r++;

  ws.getCell(`A${r}`).value = "Annual Run Rate (ARR)";
  for (let i = 0; i < numMonths; i++) {
    const c = colLetter(i + 2);
    ws.getCell(`${c}${r}`).value = { formula: `${c}${mrrRow}*12` } as ExcelJS.CellFormulaValue;
    ws.getCell(`${c}${r}`).numFmt = CURRENCY_FMT;
  }
  r++;

  ws.getCell(`A${r}`).value = "Gross Margin %";
  for (let i = 0; i < numMonths; i++) {
    const c = colLetter(i + 2);
    ws.getCell(`${c}${r}`).value = {
      formula: `IF(${c}${totalRevenueRow}=0,0,(${c}${totalRevenueRow}-${c}${totalExpensesRow})/${c}${totalRevenueRow})`,
    } as ExcelJS.CellFormulaValue;
    ws.getCell(`${c}${r}`).numFmt = PCT_FMT;
  }

  // Column widths
  ws.getColumn("A").width = 32;
  for (let i = 2; i <= numMonths + 2; i++) ws.getColumn(i).width = 14;

  // Freeze panes
  ws.views = [{ state: "frozen" as const, xSplit: 1, ySplit: headerRow }];

  return { totalRevenueRow, totalExpensesRow, netIncomeRow, cumulativeRow, mrrRow };
}

// ============================================================
// Scenario Comparison Sheet
// ============================================================

function createComparisonSheet(
  wb: ExcelJS.Workbook,
  model: PLModel,
  maps: Record<string, ScenarioRowMap>
) {
  const ws = wb.addWorksheet("Scenario Comparison");
  const con36 = maps["36-conservative"];
  const mod36 = maps["36-moderate"];
  const agg36 = maps["36-aggressive"];
  const lastDataCol = colLetter(38); // column for TOTAL in 36-month sheet (36 months + 1 label + 1 total)
  const lastMonthCol = colLetter(37); // last month data column
  let r = 1;

  ws.mergeCells(`A${r}:D${r}`);
  ws.getCell(`A${r}`).value = `${model.companyName || "Company"} - 3-Year Scenario Comparison`;
  ws.getCell(`A${r}`).font = { bold: true, size: 14 };
  r++;
  ws.getCell(`A${r}`).value = "All values automatically update from individual scenario sheets and Assumptions";
  ws.getCell(`A${r}`).font = { italic: true };
  r += 2;

  // Headers
  ws.getCell(`A${r}`).value = "Metric";
  ws.getCell(`B${r}`).value = "Conservative";
  ws.getCell(`C${r}`).value = "Moderate";
  ws.getCell(`D${r}`).value = "Aggressive";
  for (const c of ["A", "B", "C", "D"]) ws.getCell(`${c}${r}`).font = BOLD;
  r++;

  // 3-YEAR TOTALS
  ws.getCell(`A${r}`).value = "3-YEAR TOTALS";
  ws.getCell(`A${r}`).font = { bold: true, size: 11 };
  r++;

  const writeRow = (label: string, rowGetter: (m: ScenarioRowMap) => number, fmt = CURRENCY_FMT) => {
    ws.getCell(`A${r}`).value = label;
    ws.getCell(`B${r}`).value = { formula: `'36-Month Conservative'!${lastDataCol}${rowGetter(con36)}` } as ExcelJS.CellFormulaValue;
    ws.getCell(`B${r}`).numFmt = fmt;
    ws.getCell(`C${r}`).value = { formula: `'36-Month Moderate'!${lastDataCol}${rowGetter(mod36)}` } as ExcelJS.CellFormulaValue;
    ws.getCell(`C${r}`).numFmt = fmt;
    ws.getCell(`D${r}`).value = { formula: `'36-Month Aggressive'!${lastDataCol}${rowGetter(agg36)}` } as ExcelJS.CellFormulaValue;
    ws.getCell(`D${r}`).numFmt = fmt;
    r++;
  };

  writeRow("Total Revenue", (m) => m.totalRevenueRow);
  writeRow("Total Expenses", (m) => m.totalExpensesRow);
  writeRow("Net Income", (m) => m.netIncomeRow);
  r++;

  // ENDING METRICS
  ws.getCell(`A${r}`).value = "ENDING METRICS (Month 36)";
  ws.getCell(`A${r}`).font = { bold: true, size: 11 };
  r++;

  ws.getCell(`A${r}`).value = "Final Month MRR";
  ws.getCell(`B${r}`).value = { formula: `'36-Month Conservative'!${lastMonthCol}${con36.mrrRow}` } as ExcelJS.CellFormulaValue;
  ws.getCell(`B${r}`).numFmt = CURRENCY_FMT;
  ws.getCell(`C${r}`).value = { formula: `'36-Month Moderate'!${lastMonthCol}${mod36.mrrRow}` } as ExcelJS.CellFormulaValue;
  ws.getCell(`C${r}`).numFmt = CURRENCY_FMT;
  ws.getCell(`D${r}`).value = { formula: `'36-Month Aggressive'!${lastMonthCol}${agg36.mrrRow}` } as ExcelJS.CellFormulaValue;
  ws.getCell(`D${r}`).numFmt = CURRENCY_FMT;
  r++;

  ws.getCell(`A${r}`).value = "Annual Run Rate (ARR)";
  ws.getCell(`B${r}`).value = { formula: `B${r - 1}*12` } as ExcelJS.CellFormulaValue;
  ws.getCell(`B${r}`).numFmt = CURRENCY_FMT;
  ws.getCell(`C${r}`).value = { formula: `C${r - 1}*12` } as ExcelJS.CellFormulaValue;
  ws.getCell(`C${r}`).numFmt = CURRENCY_FMT;
  ws.getCell(`D${r}`).value = { formula: `D${r - 1}*12` } as ExcelJS.CellFormulaValue;
  ws.getCell(`D${r}`).numFmt = CURRENCY_FMT;
  r += 2;

  // Footer
  ws.mergeCells(`A${r}:D${r}`);
  ws.getCell(`A${r}`).value = "Edit Assumptions sheet for pricing/expenses. Edit YELLOW cells on scenario sheets for client acquisition.";
  ws.getCell(`A${r}`).font = { italic: true };

  ws.getColumn("A").width = 30;
  ws.getColumn("B").width = 20;
  ws.getColumn("C").width = 20;
  ws.getColumn("D").width = 20;
}
