"use client";

import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { usePL } from "@/lib/pl-context";
import { calculateScenario, generateMonthLabels, formatCurrency, formatPercent } from "@/lib/pl-calculations";
import { ScenarioType } from "@/lib/pl-types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, DollarSign, Users } from "lucide-react";

export default function ScenariosPage() {
  const { model, updateClientAcquisition } = usePL();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Scenarios
          </h1>
          <p className="text-muted-foreground mt-1">
            Interactive monthly P&amp;L grids for Conservative, Moderate, and Aggressive scenarios. Edit client acquisition numbers to model different growth paths.
          </p>
        </div>

        {/* Scenario Tabs */}
        <Tabs defaultValue="moderate" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="conservative" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900 dark:data-[state=active]:bg-green-900/30 dark:data-[state=active]:text-green-100">
              Conservative
            </TabsTrigger>
            <TabsTrigger value="moderate" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/30 dark:data-[state=active]:text-amber-100">
              Moderate
            </TabsTrigger>
            <TabsTrigger value="aggressive" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-900 dark:data-[state=active]:bg-red-900/30 dark:data-[state=active]:text-red-100">
              Aggressive
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conservative">
            <ScenarioView scenarioType="conservative" model={model} updateClientAcquisition={updateClientAcquisition} />
          </TabsContent>

          <TabsContent value="moderate">
            <ScenarioView scenarioType="moderate" model={model} updateClientAcquisition={updateClientAcquisition} />
          </TabsContent>

          <TabsContent value="aggressive">
            <ScenarioView scenarioType="aggressive" model={model} updateClientAcquisition={updateClientAcquisition} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

interface ScenarioViewProps {
  scenarioType: ScenarioType;
  model: any;
  updateClientAcquisition: (scenario: ScenarioType, streamId: string, monthIndex: number, value: number) => void;
}

function ScenarioView({ scenarioType, model, updateClientAcquisition }: ScenarioViewProps) {
  const [selectedYear, setSelectedYear] = useState(1);

  // Calculate scenario data (memoized for performance)
  const scenarioResult = useMemo(
    () => calculateScenario(model, scenarioType),
    [model, scenarioType]
  );

  const monthLabels = useMemo(
    () => generateMonthLabels(model.startDate),
    [model.startDate]
  );

  const startYear = new Date(model.startDate + "T00:00:00").getFullYear();
  const oneTimeStreams = model.revenueStreams.filter((s: any) => s.type === "one-time");
  const recurringStreams = model.revenueStreams.filter((s: any) => s.type === "recurring");

  // Get the 12 months for the selected year
  const startMonth = (selectedYear - 1) * 12;
  const endMonth = startMonth + 12;
  const monthsToShow = scenarioResult.months.slice(startMonth, endMonth);
  const monthLabelsToShow = monthLabels.slice(startMonth, endMonth);

  // Calculate totals for the TOTAL column
  const yearTotals = useMemo(() => {
    const totals: any = {
      newClients: {},
      oneTimeRevenue: {},
      recurringRevenue: {},
      totalOneTimeRevenue: 0,
      totalRecurringRevenue: 0,
      totalRevenue: 0,
      expenseBreakdown: {},
      totalExpenses: 0,
      netIncome: 0,
    };

    monthsToShow.forEach((month) => {
      // Sum new clients
      Object.keys(month.newClients).forEach((streamId) => {
        totals.newClients[streamId] = (totals.newClients[streamId] || 0) + month.newClients[streamId];
      });

      // Sum one-time revenue
      Object.keys(month.oneTimeRevenue).forEach((streamId) => {
        totals.oneTimeRevenue[streamId] = (totals.oneTimeRevenue[streamId] || 0) + month.oneTimeRevenue[streamId];
      });

      // Sum recurring revenue
      Object.keys(month.recurringRevenue).forEach((streamId) => {
        totals.recurringRevenue[streamId] = (totals.recurringRevenue[streamId] || 0) + month.recurringRevenue[streamId];
      });

      totals.totalOneTimeRevenue += month.totalOneTimeRevenue;
      totals.totalRecurringRevenue += month.totalRecurringRevenue;
      totals.totalRevenue += month.totalRevenue;

      // Sum expenses
      Object.keys(month.expenseBreakdown).forEach((catId) => {
        totals.expenseBreakdown[catId] = (totals.expenseBreakdown[catId] || 0) + month.expenseBreakdown[catId];
      });

      totals.totalExpenses += month.totalExpenses;
      totals.netIncome += month.netIncome;
    });

    // Get ending values from last month
    const lastMonth = monthsToShow[monthsToShow.length - 1];
    totals.cumulativeNetIncome = lastMonth?.cumulativeNetIncome || 0;
    totals.mrr = lastMonth?.mrr || 0;
    totals.arr = lastMonth?.arr || 0;
    totals.grossMargin = totals.totalRevenue > 0 ? totals.netIncome / totals.totalRevenue : 0;

    return totals;
  }, [monthsToShow]);

  const handleClientAcquisitionChange = (streamId: string, monthIndex: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const globalMonthIndex = startMonth + monthIndex;
    updateClientAcquisition(scenarioType, streamId, globalMonthIndex, numValue);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl capitalize flex items-center gap-2">
              {scenarioType} Scenario
              <Badge variant="outline" className="ml-2">
                {selectedYear === 1 ? `Year 1 (${startYear})` : selectedYear === 2 ? `Year 2 (${startYear + 1})` : `Year 3 (${startYear + 2})`}
              </Badge>
            </CardTitle>
            <CardDescription>
              Monthly P&amp;L with editable client acquisition (yellow cells)
            </CardDescription>
          </div>

          {/* Year Selector */}
          <div className="flex gap-2">
            <Button
              variant={selectedYear === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedYear(1)}
            >
              Year 1 ({startYear})
            </Button>
            <Button
              variant={selectedYear === 2 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedYear(2)}
            >
              Year 2 ({startYear + 1})
            </Button>
            <Button
              variant={selectedYear === 3 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedYear(3)}
            >
              Year 3 ({startYear + 2})
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-[1400px]">
            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              {/* Header Row */}
              <div className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] bg-muted/50 border-b text-xs font-medium sticky top-0">
                <div className="p-2 border-r font-semibold">Category</div>
                {monthLabelsToShow.map((label, i) => (
                  <div key={i} className="p-2 border-r text-center">
                    {label}
                  </div>
                ))}
                <div className="p-2 text-center font-bold">TOTAL</div>
              </div>

              {/* CLIENT ACQUISITION Section */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border-b">
                <div className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] border-b bg-amber-100 dark:bg-amber-900/30">
                  <div className="p-2 border-r font-semibold text-xs flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    CLIENT ACQUISITION
                  </div>
                  <div className="col-span-13"></div>
                </div>

                {model.revenueStreams.map((stream: any) => (
                  <div key={stream.id} className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] border-b">
                    <div className="p-2 border-r text-xs text-muted-foreground">
                      {stream.name}
                    </div>
                    {monthsToShow.map((month, i) => (
                      <div key={i} className="p-1 border-r flex items-center justify-center">
                        <Input
                          type="number"
                          min="0"
                          value={month.newClients[stream.id] || 0}
                          onChange={(e) => handleClientAcquisitionChange(stream.id, i, e.target.value)}
                          className="w-16 h-7 text-xs text-right bg-white dark:bg-gray-900 border-amber-300 dark:border-amber-700"
                        />
                      </div>
                    ))}
                    <div className="p-2 text-xs text-right font-medium">
                      {yearTotals.newClients[stream.id] || 0}
                    </div>
                  </div>
                ))}
              </div>

              {/* REVENUE Section */}
              <div className="border-b">
                <div className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] border-b bg-muted/30">
                  <div className="p-2 border-r font-semibold text-xs flex items-center gap-2">
                    <DollarSign className="w-3 h-3" />
                    REVENUE
                  </div>
                  <div className="col-span-13"></div>
                </div>

                {/* One-Time Revenue */}
                {oneTimeStreams.length > 0 && (
                  <>
                    <div className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] bg-muted/10">
                      <div className="p-2 border-r text-xs font-medium italic">One-Time Revenue</div>
                      <div className="col-span-13"></div>
                    </div>

                    {oneTimeStreams.map((stream: any) => (
                      <div key={stream.id} className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] border-b">
                        <div className="p-2 border-r text-xs pl-4 text-muted-foreground">
                          {stream.name}
                        </div>
                        {monthsToShow.map((month, i) => (
                          <div key={i} className="p-2 border-r text-xs text-right">
                            {formatCurrency(month.oneTimeRevenue[stream.id] || 0)}
                          </div>
                        ))}
                        <div className="p-2 text-xs text-right font-medium">
                          {formatCurrency(yearTotals.oneTimeRevenue[stream.id] || 0)}
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] border-b bg-muted/10">
                      <div className="p-2 border-r text-xs font-semibold pl-4">One-Time Total</div>
                      {monthsToShow.map((month, i) => (
                        <div key={i} className="p-2 border-r text-xs text-right font-medium">
                          {formatCurrency(month.totalOneTimeRevenue)}
                        </div>
                      ))}
                      <div className="p-2 text-xs text-right font-bold">
                        {formatCurrency(yearTotals.totalOneTimeRevenue)}
                      </div>
                    </div>
                  </>
                )}

                {/* Recurring Revenue */}
                {recurringStreams.length > 0 && (
                  <>
                    <div className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] bg-muted/10">
                      <div className="p-2 border-r text-xs font-medium italic">Recurring Revenue (MRR)</div>
                      <div className="col-span-13"></div>
                    </div>

                    {recurringStreams.map((stream: any) => (
                      <div key={stream.id} className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] border-b">
                        <div className="p-2 border-r text-xs pl-4 text-muted-foreground">
                          {stream.name}
                        </div>
                        {monthsToShow.map((month, i) => (
                          <div key={i} className="p-2 border-r text-xs text-right">
                            <div className="text-[10px] text-muted-foreground">
                              {month.activeClients[stream.id] || 0} clients
                            </div>
                            <div>{formatCurrency(month.recurringRevenue[stream.id] || 0)}</div>
                          </div>
                        ))}
                        <div className="p-2 text-xs text-right font-medium">
                          {formatCurrency(yearTotals.recurringRevenue[stream.id] || 0)}
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] border-b bg-muted/10">
                      <div className="p-2 border-r text-xs font-semibold pl-4">Recurring Total</div>
                      {monthsToShow.map((month, i) => (
                        <div key={i} className="p-2 border-r text-xs text-right font-medium">
                          {formatCurrency(month.totalRecurringRevenue)}
                        </div>
                      ))}
                      <div className="p-2 text-xs text-right font-bold">
                        {formatCurrency(yearTotals.totalRecurringRevenue)}
                      </div>
                    </div>
                  </>
                )}

                {/* Total Revenue */}
                <div className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] border-b bg-blue-50 dark:bg-blue-900/20">
                  <div className="p-2 border-r text-xs font-bold">TOTAL REVENUE</div>
                  {monthsToShow.map((month, i) => (
                    <div key={i} className="p-2 border-r text-xs text-right font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(month.totalRevenue)}
                    </div>
                  ))}
                  <div className="p-2 text-xs text-right font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(yearTotals.totalRevenue)}
                  </div>
                </div>
              </div>

              {/* EXPENSES Section */}
              <div className="border-b">
                <div className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] border-b bg-muted/30">
                  <div className="p-2 border-r font-semibold text-xs flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    EXPENSES
                  </div>
                  <div className="col-span-13"></div>
                </div>

                {model.expenseCategories.map((category: any) => (
                  <div key={category.id} className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] border-b">
                    <div className="p-2 border-r text-xs text-muted-foreground">
                      {category.name}
                    </div>
                    {monthsToShow.map((month, i) => (
                      <div key={i} className="p-2 border-r text-xs text-right">
                        {formatCurrency(month.expenseBreakdown[category.id] || 0)}
                      </div>
                    ))}
                    <div className="p-2 text-xs text-right font-medium">
                      {formatCurrency(yearTotals.expenseBreakdown[category.id] || 0)}
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] border-b bg-red-50 dark:bg-red-900/20">
                  <div className="p-2 border-r text-xs font-bold">TOTAL EXPENSES</div>
                  {monthsToShow.map((month, i) => (
                    <div key={i} className="p-2 border-r text-xs text-right font-bold text-red-700 dark:text-red-300">
                      {formatCurrency(month.totalExpenses)}
                    </div>
                  ))}
                  <div className="p-2 text-xs text-right font-bold text-red-700 dark:text-red-300">
                    {formatCurrency(yearTotals.totalExpenses)}
                  </div>
                </div>
              </div>

              {/* NET INCOME */}
              <div className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] border-b bg-muted/50">
                <div className="p-2 border-r text-xs font-bold">NET INCOME / (LOSS)</div>
                {monthsToShow.map((month, i) => (
                  <div
                    key={i}
                    className={`p-2 border-r text-xs text-right font-bold ${
                      month.netIncome >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(month.netIncome)}
                  </div>
                ))}
                <div
                  className={`p-2 text-xs text-right font-bold ${
                    yearTotals.netIncome >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(yearTotals.netIncome)}
                </div>
              </div>

              {/* CUMULATIVE NET INCOME */}
              <div className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] border-b">
                <div className="p-2 border-r text-xs font-semibold">CUMULATIVE NET INCOME</div>
                {monthsToShow.map((month, i) => (
                  <div
                    key={i}
                    className={`p-2 border-r text-xs text-right font-medium ${
                      month.cumulativeNetIncome >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(month.cumulativeNetIncome)}
                  </div>
                ))}
                <div
                  className={`p-2 text-xs text-right font-bold ${
                    yearTotals.cumulativeNetIncome >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(yearTotals.cumulativeNetIncome)}
                </div>
              </div>

              {/* KEY METRICS */}
              <div className="bg-muted/30">
                <div className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] border-b bg-muted/50">
                  <div className="p-2 border-r font-semibold text-xs">KEY METRICS</div>
                  <div className="col-span-13"></div>
                </div>

                <div className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] border-b">
                  <div className="p-2 border-r text-xs text-muted-foreground">Monthly Recurring Revenue (MRR)</div>
                  {monthsToShow.map((month, i) => (
                    <div key={i} className="p-2 border-r text-xs text-right">
                      {formatCurrency(month.mrr)}
                    </div>
                  ))}
                  <div className="p-2 text-xs text-right font-medium">
                    {formatCurrency(yearTotals.mrr)}
                  </div>
                </div>

                <div className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)] border-b">
                  <div className="p-2 border-r text-xs text-muted-foreground">Annual Run Rate (ARR)</div>
                  {monthsToShow.map((month, i) => (
                    <div key={i} className="p-2 border-r text-xs text-right">
                      {formatCurrency(month.arr)}
                    </div>
                  ))}
                  <div className="p-2 text-xs text-right font-medium">
                    {formatCurrency(yearTotals.arr)}
                  </div>
                </div>

                <div className="grid grid-cols-[200px_repeat(12,minmax(90px,1fr))_minmax(100px,1fr)]">
                  <div className="p-2 border-r text-xs text-muted-foreground">Gross Margin %</div>
                  {monthsToShow.map((month, i) => (
                    <div key={i} className="p-2 border-r text-xs text-right">
                      {formatPercent(month.grossMargin)}
                    </div>
                  ))}
                  <div className="p-2 text-xs text-right font-medium">
                    {formatPercent(yearTotals.grossMargin)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
