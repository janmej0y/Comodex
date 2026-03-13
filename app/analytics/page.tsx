"use client";

import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { inrFormatter } from "@/lib/utils";
import { Role } from "@/types/auth";

const reports = [
  { name: "Category Contribution", value: 0.43 },
  { name: "Pareto Top SKUs", value: 0.68 },
  { name: "Cost-to-Value Ratio", value: 0.34 }
];

export default function AnalyticsPage() {
  return (
    <ProtectedRoute roles={[Role.MANAGER]}>
      <AppShell>
        <Card>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Advanced Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Custom widgets, period compare, and scheduled report exports.</p>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">Projected Revenue</p>
            <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{inrFormatter.format(980000)}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gross Margin</p>
            <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">28.5%</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">Report Cadence</p>
            <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Weekly</p>
          </Card>
        </div>

        <Card className="space-y-2">
          {reports.map((report) => (
            <div key={report.name} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-200">{report.name}</span>
                <Badge>{Math.round(report.value * 100)}%</Badge>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${report.value * 100}%` }} />
              </div>
            </div>
          ))}
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}