"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePL } from "@/lib/pl-context";
import {
  Building2,
  Calendar,
  Plus,
  Trash2,
  DollarSign,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Repeat,
} from "lucide-react";
import Link from "next/link";

export default function SetupPage() {
  const {
    model,
    updateCompanyName,
    updateStartDate,
    loadDemoData,
    addRevenueStream,
    removeRevenueStream,
    addExpenseItem,
    removeExpenseItem,
    addExpenseCategory,
    removeExpenseCategory,
  } = usePL();

  // Form state for adding new revenue stream
  const [newStreamName, setNewStreamName] = useState("");
  const [newStreamType, setNewStreamType] = useState<"one-time" | "recurring">("one-time");
  const [newStreamPrice, setNewStreamPrice] = useState("");
  const [newStreamUnit, setNewStreamUnit] = useState("");

  // Form state for adding expense items (per category)
  const [newExpenseItemName, setNewExpenseItemName] = useState<Record<string, string>>({});
  const [newExpenseItemCost, setNewExpenseItemCost] = useState<Record<string, string>>({});

  // Collapsible state for expense categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const handleAddRevenueStream = () => {
    if (!newStreamName || !newStreamPrice || !newStreamUnit) return;

    addRevenueStream({
      name: newStreamName,
      type: newStreamType,
      price: parseFloat(newStreamPrice),
      unit: newStreamUnit,
    });

    // Clear form
    setNewStreamName("");
    setNewStreamPrice("");
    setNewStreamUnit("");
  };

  const handleAddExpenseItem = (categoryId: string) => {
    const name = newExpenseItemName[categoryId];
    const cost = newExpenseItemCost[categoryId];

    if (!name || !cost) return;

    addExpenseItem(categoryId, {
      name,
      monthlyCost: parseFloat(cost),
    });

    // Clear form for this category
    setNewExpenseItemName((prev) => ({ ...prev, [categoryId]: "" }));
    setNewExpenseItemCost((prev) => ({ ...prev, [categoryId]: "" }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            Company Setup
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your company information, revenue streams, and expense categories.
          </p>
        </div>

        {/* Company Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Information
            </CardTitle>
            <CardDescription>Basic details about your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  value={model.companyName}
                  onChange={(e) => updateCompanyName(e.target.value)}
                  className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={model.startDate}
                  onChange={(e) => updateStartDate(e.target.value)}
                  className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                />
              </div>
            </div>
            <Separator />
            <div>
              <Button onClick={loadDemoData} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Load Demo Data (TSAI Example)
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This will replace your current data with a sample P&L model for Total Success AI
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Streams Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Revenue Streams
            </CardTitle>
            <CardDescription>
              Define how your company generates income (one-time projects or recurring subscriptions)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Revenue Streams */}
            {model.revenueStreams.length > 0 ? (
              <div className="space-y-2">
                {model.revenueStreams.map((stream) => (
                  <div
                    key={stream.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-medium">{stream.name}</span>
                        <Badge
                          variant={stream.type === "one-time" ? "default" : "secondary"}
                          className={
                            stream.type === "one-time"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }
                        >
                          {stream.type === "one-time" ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : (
                            <Repeat className="w-3 h-3 mr-1" />
                          )}
                          {stream.type === "one-time" ? "One-Time" : "Recurring"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {formatCurrency(stream.price)}
                        </span>
                        <span>{stream.unit}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRevenueStream(stream.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No revenue streams yet. Add your first one below.
              </p>
            )}

            <Separator />

            {/* Add Revenue Stream Form */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Revenue Stream
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="streamName" className="text-xs">
                    Name
                  </Label>
                  <Input
                    id="streamName"
                    placeholder="e.g., Website Build"
                    value={newStreamName}
                    onChange={(e) => setNewStreamName(e.target.value)}
                    className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="streamType" className="text-xs">
                    Type
                  </Label>
                  <Select
                    value={newStreamType}
                    onValueChange={(value) => setNewStreamType(value as "one-time" | "recurring")}
                  >
                    <SelectTrigger
                      id="streamType"
                      className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One-Time</SelectItem>
                      <SelectItem value="recurring">Recurring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="streamPrice" className="text-xs">
                    Price
                  </Label>
                  <Input
                    id="streamPrice"
                    type="number"
                    placeholder="0"
                    value={newStreamPrice}
                    onChange={(e) => setNewStreamPrice(e.target.value)}
                    className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="streamUnit" className="text-xs">
                    Unit
                  </Label>
                  <Input
                    id="streamUnit"
                    placeholder="per hour, per client/mo"
                    value={newStreamUnit}
                    onChange={(e) => setNewStreamUnit(e.target.value)}
                    className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                  />
                </div>
              </div>
              <Button onClick={handleAddRevenueStream} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Revenue Stream
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expense Categories Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Expense Categories
            </CardTitle>
            <CardDescription>
              Organize your monthly expenses by category (Personnel, Technology, Marketing, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {model.expenseCategories.map((category) => {
              const isExpanded = expandedCategories[category.id] !== false; // Default to expanded

              return (
                <div key={category.id} className="border rounded-lg overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{category.name}</h4>
                      <Badge variant="outline">{category.items.length} items</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        Total: {formatCurrency(category.items.reduce((sum, item) => sum + item.monthlyCost, 0))}/mo
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExpenseCategory(category.id);
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </button>

                  {/* Category Items (Collapsible) */}
                  {isExpanded && (
                    <div className="p-4 space-y-3 bg-card">
                      {/* Existing Items */}
                      {category.items.length > 0 ? (
                        <div className="space-y-2">
                          {category.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2 rounded border bg-background"
                            >
                              <span className="text-sm">{item.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">
                                  {formatCurrency(item.monthlyCost)}/mo
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeExpenseItem(category.id, item.id)}
                                  className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          No items yet. Add one below.
                        </p>
                      )}

                      <Separator />

                      {/* Add Item Form */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Item name"
                          value={newExpenseItemName[category.id] || ""}
                          onChange={(e) =>
                            setNewExpenseItemName((prev) => ({
                              ...prev,
                              [category.id]: e.target.value,
                            }))
                          }
                          className="flex-1 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                        />
                        <Input
                          type="number"
                          placeholder="Monthly cost"
                          value={newExpenseItemCost[category.id] || ""}
                          onChange={(e) =>
                            setNewExpenseItemCost((prev) => ({
                              ...prev,
                              [category.id]: e.target.value,
                            }))
                          }
                          className="w-32 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                        />
                        <Button onClick={() => handleAddExpenseItem(category.id)} size="icon">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <Separator />

            {/* Add Category Button */}
            <Button
              onClick={() => {
                const name = prompt("Enter new category name:");
                if (name) addExpenseCategory(name);
              }}
              variant="outline"
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Expense Category
            </Button>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-end">
          <Link href="/assumptions">
            <Button className="gap-2" size="lg">
              Next: Assumptions
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
