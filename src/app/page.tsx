"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePL } from "@/lib/pl-context";
import { calculateAllScenarios, formatCurrency, formatPercent } from "@/lib/pl-calculations";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ArrowRight,
  Building2,
  SlidersHorizontal,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { model } = usePL();
  const comparison = calculateAllScenarios(model);
  const moderate = comparison.moderate;

  const hasData = model.companyName && model.revenueStreams.length > 0;
  const totalRevenueStreams = model.revenueStreams.length;
  const totalExpenseItems = model.expenseCategories.reduce((acc, cat) => acc + cat.items.length, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            {model.companyName || "P&L Creation System"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {hasData
              ? "Your financial model at a glance. All numbers update in real-time."
              : "Get started by setting up your company and revenue streams."}
          </p>
        </div>

        {!hasData && (
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-3 flex-1">
                  <div>
                    <h3 className="font-semibold text-lg">Welcome to Your P&L Creator</h3>
                    <p className="text-sm text-muted-foreground">
                      Build a professional 3-year financial model with Conservative, Moderate, and Aggressive
                      scenarios. Download as Excel with real formulas or share as a web link.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/setup">
                      <Button className="gap-2">
                        <Building2 className="w-4 h-4" /> Start Setup
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {hasData && (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              Showing Moderate Scenario (realistic projection)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Year 1 Revenue</CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    {formatCurrency(moderate.year1.totalRevenue)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    MRR: {formatCurrency(moderate.year1.endingMRR)}/mo
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Year 1 Net Income</CardDescription>
                  <CardTitle className={`text-2xl flex items-center gap-2 ${moderate.year1.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {moderate.year1.netIncome >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {formatCurrency(moderate.year1.netIncome)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Margin: {formatPercent(moderate.year1.profitMargin)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>3-Year Revenue</CardDescription>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    {formatCurrency(moderate.totals.totalRevenue)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">ARR at Month 36: {formatCurrency(moderate.totals.endingARR)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>3-Year Net Income</CardDescription>
                  <CardTitle className={`text-2xl flex items-center gap-2 ${moderate.totals.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {moderate.totals.netIncome >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {formatCurrency(moderate.totals.netIncome)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Profit margin: {formatPercent(moderate.totals.profitMargin)}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Year-Over-Year Projection (Moderate)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[moderate.year1, moderate.year2, moderate.year3].map((year, i) => (
                    <div key={i} className="p-4 rounded-lg border space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Year {i + 1} ({year.year})</Badge>
                        <Badge variant={year.netIncome >= 0 ? "default" : "destructive"}>
                          {year.netIncome >= 0 ? "Profit" : "Loss"}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Revenue</span>
                          <span className="font-medium">{formatCurrency(year.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expenses</span>
                          <span className="font-medium">{formatCurrency(year.totalExpenses)}</span>
                        </div>
                        <div className="border-t pt-1 flex justify-between font-medium">
                          <span>Net Income</span>
                          <span className={year.netIncome >= 0 ? "text-green-600" : "text-red-600"}>
                            {formatCurrency(year.netIncome)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/setup" className="group">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium flex items-center gap-2">
                      Company Setup
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {model.companyName || "Set your company name"}, start date, and categories.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{totalRevenueStreams} streams</Badge>
                      <Badge variant="secondary">{totalExpenseItems} expenses</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/assumptions" className="group">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium flex items-center gap-2">
                      Assumptions
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pricing, expenses, starting values, and churn rate.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{formatPercent(model.monthlyChurnRate)} churn</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/comparison" className="group">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium flex items-center gap-2">
                      Scenario Comparison
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Side-by-side Conservative, Moderate, and Aggressive.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
