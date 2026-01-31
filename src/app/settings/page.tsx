"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { usePL } from "@/lib/pl-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Copy,
  CheckCircle2,
  XCircle,
  Webhook,
  Database,
  Share2,
  Lightbulb,
  Link2,
  ArrowRight,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { generateExcel } from "@/lib/pl-excel-export";

// GHL Custom Fields for P&L data
const ghlCustomFields = [
  { name: "pl_company_name", label: "Company Name", description: "Business name from P&L model", synced: false },
  { name: "pl_total_revenue_y1", label: "Year 1 Revenue", description: "Total revenue for year 1", synced: false },
  { name: "pl_net_income_y1", label: "Year 1 Net Income", description: "Net income for year 1", synced: false },
  { name: "pl_mrr_ending", label: "Ending MRR", description: "Monthly Recurring Revenue at end of projection", synced: false },
  { name: "pl_arr_ending", label: "Ending ARR", description: "Annual Recurring Revenue at end of projection", synced: false },
  { name: "pl_profit_margin", label: "Profit Margin", description: "Overall 3-year profit margin %", synced: false },
  { name: "pl_monthly_expenses", label: "Monthly Expenses", description: "Average monthly operating expenses", synced: false },
  { name: "pl_break_even_month", label: "Break-Even Month", description: "Month when cumulative net income turns positive", synced: false },
];

// Connected Apps in Master's Edge Ecosystem
const connectedApps = [
  {
    name: "Brand Book Creator",
    description: "Uses brand voice in financial reports",
    status: "ready",
    color: "purple"
  },
  {
    name: "CEO Dashboard",
    description: "Revenue and margin tracking from P&L",
    status: "ready",
    color: "emerald"
  },
  {
    name: "Hiring Oracle",
    description: "Budget availability from P&L data",
    status: "coming",
    color: "rose"
  },
  {
    name: "SOP Factory",
    description: "Cost analysis for process optimization",
    status: "coming",
    color: "blue"
  },
];

export default function SettingsPage() {
  const { model } = usePL();
  const [webhookUrl] = useState("https://p-l-creation-system.vercel.app/api/webhooks/ghl");
  const [copied, setCopied] = useState(false);
  const [ghlApiKey, setGhlApiKey] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadExcel = async () => {
    setIsExporting(true);
    try {
      const blob = await generateExcel(model);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${model.companyName.replace(/\s+/g, "_")}_Financial_Model.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Failed to generate Excel file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure integrations, export options, and ecosystem connections.
          </p>
        </div>

        <Tabs defaultValue="ghl" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ghl">Go High Level</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="apps">Connected Apps</TabsTrigger>
            <TabsTrigger value="fields">Custom Fields</TabsTrigger>
          </TabsList>

          {/* Go High Level Tab */}
          <TabsContent value="ghl" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-blue-500" />
                  Webhook Configuration
                </CardTitle>
                <CardDescription>
                  Add this webhook URL to your GHL workflows to sync P&L data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Webhook URL</label>
                  <div className="flex gap-2">
                    <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                    <Button variant="outline" onClick={copyWebhook} className="gap-2 shrink-0">
                      {copied ? (
                        <><CheckCircle2 className="h-4 w-4 text-green-500" /> Copied!</>
                      ) : (
                        <><Copy className="h-4 w-4" /> Copy</>
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium">GHL API Key (Optional)</label>
                  <p className="text-xs text-muted-foreground">For pushing P&L data TO GHL custom fields.</p>
                  <Input
                    type="password"
                    value={ghlApiKey}
                    onChange={(e) => setGhlApiKey(e.target.value)}
                    placeholder="Enter your GHL API key..."
                  />
                </div>

                <div className="flex items-start gap-2 rounded-md bg-blue-50 dark:bg-blue-950/30 p-4">
                  <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <div className="text-xs text-blue-800 dark:text-blue-200 space-y-2">
                    <p className="font-semibold">How to set up in GHL:</p>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>Go to GHL &rarr; Automation &rarr; Workflows</li>
                      <li>Create a new workflow (or edit existing)</li>
                      <li>Add a &ldquo;Webhook&rdquo; action</li>
                      <li>Paste the webhook URL above</li>
                      <li>Map your custom fields (see Custom Fields tab)</li>
                      <li>Save and activate the workflow</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            {/* Download Excel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  Download Excel
                </CardTitle>
                <CardDescription>
                  Download your P&L as an Excel file with real cascading formulas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Real Excel formulas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Yellow editable cells</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>All 7 sheets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Works in Excel & Google Sheets</span>
                  </div>
                </div>

                <Button
                  onClick={handleDownloadExcel}
                  className="gap-2 w-full"
                  disabled={isExporting}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  {isExporting ? "Generating..." : "Download .xlsx"}
                </Button>
              </CardContent>
            </Card>

            {/* Download PDF */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  Download PDF
                </CardTitle>
                <CardDescription>
                  Print-ready PDF of your financial projections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="gap-2 w-full"
                >
                  <FileText className="h-4 w-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            {/* Share Link (Coming Soon) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-blue-500" />
                  Share Link
                  <Badge variant="secondary">Coming Soon</Badge>
                </CardTitle>
                <CardDescription>
                  Publish your P&L as a shareable webpage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Soon you&apos;ll be able to share a live, interactive P&L dashboard with investors,
                  partners, or your team. Stay tuned!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connected Apps Tab */}
          <TabsContent value="apps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-blue-500" />
                  Master&apos;s Edge Ecosystem
                </CardTitle>
                <CardDescription>
                  Your P&L data flows into these companion apps through GHL custom fields.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {connectedApps.map((app) => (
                    <div key={app.name} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-${app.color}-100 dark:bg-${app.color}-900/30 flex items-center justify-center`}>
                          <ArrowRight className={`h-5 w-5 text-${app.color}-600 dark:text-${app.color}-400`} />
                        </div>
                        <div>
                          <p className="font-medium">{app.name}</p>
                          <p className="text-sm text-muted-foreground">{app.description}</p>
                        </div>
                      </div>
                      <Badge variant={app.status === "ready" ? "default" : "secondary"}>
                        {app.status === "ready" ? "Ready" : "Coming Soon"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Fields Tab */}
          <TabsContent value="fields" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  GHL Custom Fields
                </CardTitle>
                <CardDescription>
                  Create these custom fields in GHL to store P&L data. Other Master&apos;s Edge apps will read these fields.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ghlCustomFields.map((field) => (
                    <div key={field.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {field.synced ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{field.label}</p>
                          <p className="text-xs text-muted-foreground">
                            Field: <code className="bg-muted px-1 rounded">{field.name}</code> — {field.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant={field.synced ? "default" : "secondary"}>
                        {field.synced ? "Synced" : "Not Set"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
