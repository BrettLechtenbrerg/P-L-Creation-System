"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { usePL } from "@/lib/pl-context";
import {
  calculateAllScenarios,
  formatCurrency,
  formatPercent,
} from "@/lib/pl-calculations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GitCompareArrows,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Target,
} from "lucide-react";

export default function ComparisonPage() {
  const { model } = usePL();
  const scenarios = calculateAllScenarios(model);

  const conservative = scenarios.conservative;
  const moderate = scenarios.moderate;
  const aggressive = scenarios.aggressive;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-3 text-white shadow-lg">
            <GitCompareArrows className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Scenario Comparison</h1>
            <p className="text-muted-foreground mt-1">
              All values automatically update from your assumptions and scenario data
            </p>
          </div>
        </div>

        {/* Visual Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Conservative */}
          <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-700 dark:text-green-400">Conservative</CardTitle>
                <Badge variant="outline" className="border-green-600 text-green-700 dark:text-green-400">
                  Safe Growth
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">3-Year Revenue</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(conservative.totals.totalRevenue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">3-Year Net Income</p>
                <p className={`text-2xl font-bold ${conservative.totals.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(conservative.totals.netIncome)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ending MRR</p>
                <p className="text-xl font-semibold text-green-700 dark:text-green-400">
                  {formatCurrency(conservative.totals.endingMRR)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-xl font-semibold text-green-700 dark:text-green-400">
                  {formatPercent(conservative.totals.profitMargin)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Moderate */}
          <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-amber-700 dark:text-amber-400">Moderate</CardTitle>
                <Badge variant="outline" className="border-amber-600 text-amber-700 dark:text-amber-400">
                  Balanced Growth
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">3-Year Revenue</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                  {formatCurrency(moderate.totals.totalRevenue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">3-Year Net Income</p>
                <p className={`text-2xl font-bold ${moderate.totals.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(moderate.totals.netIncome)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ending MRR</p>
                <p className="text-xl font-semibold text-amber-700 dark:text-amber-400">
                  {formatCurrency(moderate.totals.endingMRR)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-xl font-semibold text-amber-700 dark:text-amber-400">
                  {formatPercent(moderate.totals.profitMargin)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Aggressive */}
          <Card className="border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-rose-700 dark:text-rose-400">Aggressive</CardTitle>
                <Badge variant="outline" className="border-rose-600 text-rose-700 dark:text-rose-400">
                  Ambitious Growth
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">3-Year Revenue</p>
                <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">
                  {formatCurrency(aggressive.totals.totalRevenue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">3-Year Net Income</p>
                <p className={`text-2xl font-bold ${aggressive.totals.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(aggressive.totals.netIncome)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ending MRR</p>
                <p className="text-xl font-semibold text-rose-700 dark:text-rose-400">
                  {formatCurrency(aggressive.totals.endingMRR)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-xl font-semibold text-rose-700 dark:text-rose-400">
                  {formatPercent(aggressive.totals.profitMargin)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3-Year Totals */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle>3-Year Totals</CardTitle>
            </div>
            <CardDescription>Cumulative performance across all 36 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Metric</th>
                    <th className="text-right py-3 px-4 font-semibold text-green-700 dark:text-green-400">
                      Conservative
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-amber-700 dark:text-amber-400">
                      Moderate
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-rose-700 dark:text-rose-400">
                      Aggressive
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-3 px-4 font-medium">Total Revenue</td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(conservative.totals.totalRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(moderate.totals.totalRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(aggressive.totals.totalRevenue)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Total Expenses</td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(conservative.totals.totalExpenses)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(moderate.totals.totalExpenses)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(aggressive.totals.totalExpenses)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Net Income</td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${conservative.totals.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(conservative.totals.netIncome)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${moderate.totals.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(moderate.totals.netIncome)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${aggressive.totals.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(aggressive.totals.netIncome)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Ending Metrics (Month 36) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Ending Metrics (Month 36)</CardTitle>
            </div>
            <CardDescription>Final month performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Metric</th>
                    <th className="text-right py-3 px-4 font-semibold text-green-700 dark:text-green-400">
                      Conservative
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-amber-700 dark:text-amber-400">
                      Moderate
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-rose-700 dark:text-rose-400">
                      Aggressive
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-3 px-4 font-medium">Final Month MRR</td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(conservative.totals.endingMRR)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(moderate.totals.endingMRR)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(aggressive.totals.endingMRR)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Annual Run Rate (ARR)</td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(conservative.totals.endingARR)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(moderate.totals.endingARR)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(aggressive.totals.endingARR)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Year-Over-Year Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Year-Over-Year Breakdown</CardTitle>
            </div>
            <CardDescription>Annual performance comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Metric</th>
                    <th className="text-right py-3 px-4 font-semibold text-green-700 dark:text-green-400">
                      Conservative
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-amber-700 dark:text-amber-400">
                      Moderate
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-rose-700 dark:text-rose-400">
                      Aggressive
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="bg-muted/50">
                    <td className="py-3 px-4 font-bold">Year 1 ({conservative.year1.year})</td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4"></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 pl-8">Revenue</td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(conservative.year1.totalRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(moderate.year1.totalRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(aggressive.year1.totalRevenue)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 pl-8">Net Income</td>
                    <td className={`py-3 px-4 text-right font-mono ${conservative.year1.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(conservative.year1.netIncome)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono ${moderate.year1.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(moderate.year1.netIncome)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono ${aggressive.year1.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(aggressive.year1.netIncome)}
                    </td>
                  </tr>

                  <tr className="bg-muted/50">
                    <td className="py-3 px-4 font-bold">Year 2 ({conservative.year2.year})</td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4"></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 pl-8">Revenue</td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(conservative.year2.totalRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(moderate.year2.totalRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(aggressive.year2.totalRevenue)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 pl-8">Net Income</td>
                    <td className={`py-3 px-4 text-right font-mono ${conservative.year2.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(conservative.year2.netIncome)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono ${moderate.year2.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(moderate.year2.netIncome)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono ${aggressive.year2.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(aggressive.year2.netIncome)}
                    </td>
                  </tr>

                  <tr className="bg-muted/50">
                    <td className="py-3 px-4 font-bold">Year 3 ({conservative.year3.year})</td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4"></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 pl-8">Revenue</td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(conservative.year3.totalRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(moderate.year3.totalRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(aggressive.year3.totalRevenue)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 pl-8">Net Income</td>
                    <td className={`py-3 px-4 text-right font-mono ${conservative.year3.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(conservative.year3.netIncome)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono ${moderate.year3.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(moderate.year3.netIncome)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono ${aggressive.year3.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(aggressive.year3.netIncome)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Profitability Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Profitability Analysis</CardTitle>
            </div>
            <CardDescription>Key financial health indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Metric</th>
                    <th className="text-right py-3 px-4 font-semibold text-green-700 dark:text-green-400">
                      Conservative
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-amber-700 dark:text-amber-400">
                      Moderate
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-rose-700 dark:text-rose-400">
                      Aggressive
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-3 px-4 font-medium">3-Year Profit Margin</td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatPercent(conservative.totals.profitMargin)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatPercent(moderate.totals.profitMargin)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatPercent(aggressive.totals.profitMargin)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Average Monthly Revenue</td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(conservative.totals.averageMonthlyRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(moderate.totals.averageMonthlyRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(aggressive.totals.averageMonthlyRevenue)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Cumulative Net Income</td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${conservative.months[35].cumulativeNetIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(conservative.months[35].cumulativeNetIncome)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${moderate.months[35].cumulativeNetIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(moderate.months[35].cumulativeNetIncome)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${aggressive.months[35].cumulativeNetIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(aggressive.months[35].cumulativeNetIncome)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Note:</strong> Edit the Assumptions page to change pricing, expenses, starting
              values, and churn rates. Edit client acquisition numbers on the Scenarios page. All
              calculations use real formulas - changes automatically cascade.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
