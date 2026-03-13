"use client";

import { useState } from "react";
import { Bot, TrendingUp } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/lib/toast-context";
import { Role } from "@/types/auth";

const suggestions = [
  { sku: "P-103", confidence: "93%", action: "Reorder +40" },
  { sku: "P-102", confidence: "88%", action: "Reorder +20" },
  { sku: "P-104", confidence: "81%", action: "Hold purchase" }
];

export default function ForecastPage() {
  const [range, setRange] = useState("30d");
  const { pushToast } = useToast();

  return (
    <ProtectedRoute roles={[Role.MANAGER]}>
      <AppShell>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Demand Forecast & Planning</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Lead-time aware reorder recommendation engine.</p>
            </div>
            <Select value={range} onChange={(e) => setRange(e.target.value)} className="w-40">
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
            </Select>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          {suggestions.map((entry) => (
            <Card key={entry.sku}>
              <p className="text-sm text-slate-500 dark:text-slate-400">SKU</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{entry.sku}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge>{entry.confidence} confidence</Badge>
                <Badge>{range}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{entry.action}</p>
            </Card>
          ))}
        </div>

        <Card className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">What-if Simulation</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Scenario: +15% demand growth in top category.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="w-full sm:w-auto" onClick={() => pushToast({ title: "Simulation complete", message: `Scenario run for ${range}`, tone: "success" })}>
              <TrendingUp className="h-4 w-4" />
              Run Simulation
            </Button>
            <Button
              className="w-full sm:w-auto"
              variant="secondary"
              onClick={() => pushToast({ title: "Plan applied", message: "Reorder plan staged to operations", tone: "info" })}
            >
              <Bot className="h-4 w-4" />
              Auto-Apply Plan
            </Button>
          </div>
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}
