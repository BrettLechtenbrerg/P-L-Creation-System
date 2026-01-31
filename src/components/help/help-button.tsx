"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  HelpCircle,
  LayoutDashboard,
  Building2,
  SlidersHorizontal,
  BarChart3,
  GitCompareArrows,
  Settings,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  AlertTriangle,
  Shield,
  DollarSign,
} from "lucide-react";

const steps = [
  {
    icon: LayoutDashboard,
    color: "from-blue-500 to-indigo-500",
    title: "Step 1: Dashboard",
    subtitle: "See where you stand at a glance",
    description:
      "Your command center showing Year 1 revenue, net income, expense totals, and 3-year projections from your moderate scenario. All numbers update automatically as you edit.",
    tip: "Dashboard pulls from your Moderate scenario by default. Edit scenarios first to see meaningful numbers.",
  },
  {
    icon: Building2,
    color: "from-emerald-500 to-teal-500",
    title: "Step 2: Company Setup",
    subtitle: "Define your revenue and cost structure",
    description:
      "Enter your company name, start date, and build out your revenue streams (one-time and recurring) plus expense categories with line items. This is the foundation for all financial projections.",
    tip: "Mark streams as 'recurring' for subscription revenue with churn modeling, or 'one-time' for project-based revenue.",
  },
  {
    icon: SlidersHorizontal,
    color: "from-amber-500 to-orange-500",
    title: "Step 3: Assumptions",
    subtitle: "Review your pricing and costs",
    description:
      "View and verify all your pricing tables, expense amounts, starting client counts for recurring streams, and monthly churn rate. Everything here feeds directly into the scenario calculations.",
    tip: "Set your churn rate carefully. Even 5% monthly churn compounds fast over 36 months.",
  },
  {
    icon: BarChart3,
    color: "from-purple-500 to-violet-500",
    title: "Step 4: Scenarios",
    subtitle: "Model three growth paths",
    description:
      "The heart of the system. Edit monthly client acquisition numbers for each revenue stream across Conservative, Moderate, and Aggressive scenarios. The grid auto-calculates revenue, expenses, and net income for all 36 months.",
    tip: "Start with Moderate as your realistic target. Conservative is your safety net. Aggressive is your stretch goal.",
  },
  {
    icon: GitCompareArrows,
    color: "from-teal-500 to-cyan-500",
    title: "Step 5: Comparison",
    subtitle: "See all three scenarios side-by-side",
    description:
      "Compare Conservative vs Moderate vs Aggressive across Year 1, Year 2, Year 3, and 3-year totals. Instantly see the revenue gap between playing it safe and going all-in.",
    tip: "Use comparison view when pitching investors or partners. The visual gap between scenarios tells a powerful story.",
  },
  {
    icon: Settings,
    color: "from-slate-500 to-gray-500",
    title: "Step 6: Settings & Export",
    subtitle: "Export and connect your data",
    description:
      "Export your complete P&L to a professional Excel workbook with real formulas (not just static numbers). Connect to Go High Level via webhook, or print as PDF for board meetings and investor decks.",
    tip: "The Excel export has 8 sheets with cascading formulas. Change one assumption and the entire workbook recalculates.",
  },
];

export function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
        title="Getting Started Guide"
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Help</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              P&amp;L Creation System Guide
            </DialogTitle>
            <DialogDescription>
              Build professional 3-year financial projections in 6 steps. Each page builds on the last.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 -mx-6 px-6 space-y-4 py-4">
            {/* Why P&L Matters */}
            <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-slate-50 dark:from-emerald-950/40 dark:to-slate-950/40 border border-emerald-200 dark:border-emerald-800 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold text-lg text-emerald-900 dark:text-emerald-100">
                  Why Financial Projections Change Everything
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Businesses that create detailed financial projections are <strong className="text-foreground">2.5x more likely to secure funding</strong> and grow 30% faster than those flying blind. A P&amp;L isn&apos;t just numbers on a spreadsheet &mdash; it&apos;s the financial blueprint that tells you exactly when you&apos;ll be profitable, how much runway you have, and what growth rate you need to hit your goals.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Think of it as <strong className="text-foreground">your business&apos;s financial GPS</strong> &mdash; showing you where you are, where you&apos;re headed, and every scenario in between.
              </p>
            </div>

            {/* Relatable Example */}
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                  Sound Familiar?
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                &ldquo;You know you made money last month, but you have no idea if you can afford that new hire. Your accountant sends you a spreadsheet that&apos;s 6 months old. A potential investor asks &apos;What&apos;s your 3-year projection?&apos; and you start sweating. Your partner asks &apos;Can we afford to expand?&apos; and you honestly don&apos;t know.&rdquo;
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Without projections, every financial decision is a guess. With them, <strong className="text-foreground">you know exactly what&apos;s possible</strong> &mdash; and you can model it before spending a dime.
              </p>
            </div>

            {/* What This Tool Does */}
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  What This Tool Does
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The P&amp;L Creation System lets you model <strong className="text-foreground">3 growth scenarios</strong> (Conservative, Moderate, Aggressive) across 36 months with real revenue streams, expense categories, and churn modeling. When you&apos;re done, export a professional Excel workbook with <strong className="text-foreground">real cascading formulas</strong> &mdash; not static numbers &mdash; that recalculates when you change any assumption.
              </p>
            </div>

            {/* Section Divider */}
            <div className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">The 6 Steps</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {steps.map((step, index) => (
              <div
                key={index}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0`}
                  >
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 p-3">
                  <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    {step.tip}
                  </p>
                </div>
              </div>
            ))}

            {/* Cross-app integration note */}
            <div className="rounded-lg border-2 border-dashed border-emerald-200 dark:border-emerald-800 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
                  Connects to Your Other Apps
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your P&amp;L data feeds into the entire Master&apos;s Edge ecosystem:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" />
                  <span><strong>Hiring Oracle</strong> uses your budget to determine when you can afford new hires</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" />
                  <span><strong>CEO Dashboard</strong> pulls real-time KPIs that map to your projections</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" />
                  <span><strong>Delegation Engine</strong> factors cost-of-time into delegation decisions</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button onClick={() => setOpen(false)} className="w-full">
              Got it, let&apos;s build projections!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
