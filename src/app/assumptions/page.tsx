"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { usePL } from "@/lib/pl-context";
import { formatCurrency, formatPercent } from "@/lib/pl-calculations";
import {
  SlidersHorizontal,
  DollarSign,
  Users,
  Percent,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function AssumptionsPage() {
  const { model, updateStartingValue, updateChurnRate } = usePL();

  // Separate revenue streams by type
  const oneTimeStreams = model.revenueStreams.filter((s) => s.type === "one-time");
  const recurringStreams = model.revenueStreams.filter((s) => s.type === "recurring");

  // Calculate total monthly expenses with breakdown
  const expenseBreakdown = model.expenseCategories.map((category) => {
    const categoryTotal = category.items.reduce((sum, item) => sum + item.monthlyCost, 0);
    // Add 20% for personnel
    const isPersonnel = category.name.toLowerCase().includes("personnel");
    const tax = isPersonnel ? categoryTotal * 0.2 : 0;
    return {
      category,
      subtotal: categoryTotal,
      tax,
      total: categoryTotal + tax,
    };
  });

  const totalMonthlyExpenses = expenseBreakdown.reduce((sum, cat) => sum + cat.total, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Assumptions</h1>
            <Badge variant="outline" className="ml-auto">
              Mirrors Excel Assumptions Sheet
            </Badge>
          </div>
          <p className="text-muted-foreground">
            All editable inputs that cascade through your projections
          </p>
        </div>

        {/* Service Pricing Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <CardTitle>Service Pricing</CardTitle>
            </div>
            <CardDescription>
              Revenue stream pricing structure{" "}
              <Link href="/setup" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                Edit on Setup page <ExternalLink className="w-3 h-3" />
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* One-Time Services */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                One-Time Services
              </h3>
              {oneTimeStreams.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No one-time services configured</p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Service Name</th>
                        <th className="text-right p-3 font-medium">Price</th>
                        <th className="text-left p-3 font-medium">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {oneTimeStreams.map((stream) => (
                        <tr key={stream.id}>
                          <td className="p-3">{stream.name}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(stream.price)}</td>
                          <td className="p-3 text-muted-foreground">{stream.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <Separator />

            {/* Recurring Services */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Recurring Services
              </h3>
              {recurringStreams.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No recurring services configured</p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Service Name</th>
                        <th className="text-right p-3 font-medium">Price</th>
                        <th className="text-left p-3 font-medium">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {recurringStreams.map((stream) => (
                        <tr key={stream.id}>
                          <td className="p-3">{stream.name}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(stream.price)}</td>
                          <td className="p-3 text-muted-foreground">{stream.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Expenses Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-600" />
              <CardTitle>Monthly Expenses</CardTitle>
            </div>
            <CardDescription>
              Fixed operating costs per month{" "}
              <Link href="/setup" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                Edit on Setup page <ExternalLink className="w-3 h-3" />
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {model.expenseCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No expense categories configured</p>
            ) : (
              <>
                {expenseBreakdown.map(({ category, subtotal, tax, total }) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        {category.name}
                      </h3>
                      <span className="text-sm font-medium">{formatCurrency(total)}</span>
                    </div>
                    {category.items.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic pl-4">No items</p>
                    ) : (
                      <div className="space-y-1 pl-4">
                        {category.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.name}</span>
                            <span>{formatCurrency(item.monthlyCost)}</span>
                          </div>
                        ))}
                        {tax > 0 && (
                          <div className="flex justify-between text-sm border-t pt-1">
                            <span className="text-muted-foreground">Payroll taxes & benefits (20%)*</span>
                            <span>{formatCurrency(tax)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-medium border-t pt-1">
                          <span>Category Subtotal</span>
                          <span>{formatCurrency(total)}</span>
                        </div>
                      </div>
                    )}
                    <Separator className="mt-3" />
                  </div>
                ))}

                <div className="flex justify-between items-center pt-2 border-t-2 border-foreground/20">
                  <span className="font-bold text-lg">TOTAL MONTHLY EXPENSES</span>
                  <span className="font-bold text-lg">{formatCurrency(totalMonthlyExpenses)}</span>
                </div>

                {expenseBreakdown.some((cat) => cat.tax > 0) && (
                  <p className="text-xs text-muted-foreground">
                    * Plus ~20% payroll taxes & benefits applied to personnel costs
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Starting Values Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <CardTitle>Starting Values</CardTitle>
            </div>
            <CardDescription>
              Current client counts for recurring revenue streams (editable)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recurringStreams.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No recurring revenue streams configured. Add recurring services on the Setup page.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recurringStreams.map((stream) => {
                  const startingValue = model.startingValues.find((sv) => sv.streamId === stream.id);
                  const count = startingValue?.count ?? 0;

                  return (
                    <div
                      key={stream.id}
                      className="p-4 border-2 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800 rounded-lg space-y-2"
                    >
                      <Label htmlFor={`starting-${stream.id}`} className="text-sm font-medium">
                        {stream.name}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`starting-${stream.id}`}
                          type="number"
                          min="0"
                          value={count}
                          onChange={(e) => updateStartingValue(stream.id, parseInt(e.target.value) || 0)}
                          className="max-w-[120px] bg-white dark:bg-gray-950"
                        />
                        <span className="text-sm text-muted-foreground">existing clients</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Monthly revenue: {formatCurrency(count * stream.price)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Churn Rate Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-orange-600" />
              <CardTitle>Churn Rate</CardTitle>
            </div>
            <CardDescription>
              Monthly percentage of recurring clients lost (editable)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border-2 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800 rounded-lg space-y-3">
              <Label htmlFor="churn-rate" className="text-sm font-medium">
                Monthly Churn Rate
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="churn-rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={(model.monthlyChurnRate * 100).toFixed(1)}
                  onChange={(e) => updateChurnRate(parseFloat(e.target.value) / 100 || 0)}
                  className="max-w-[120px] bg-white dark:bg-gray-950"
                />
                <span className="text-sm font-medium">%</span>
                <Badge variant="secondary">{formatPercent(model.monthlyChurnRate)}</Badge>
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> Industry average for SaaS is 5-7% monthly. Lower is better.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Assumptions Drive Everything</h3>
                <p className="text-sm text-muted-foreground">
                  Changes to assumptions cascade through all scenarios automatically, just like the Excel
                  version. Edit pricing and expenses on the{" "}
                  <Link href="/setup" className="text-blue-600 hover:underline font-medium">
                    Setup page
                  </Link>
                  . Starting values and churn rate are editable above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
