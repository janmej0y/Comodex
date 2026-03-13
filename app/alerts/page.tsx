"use client";

import { useState } from "react";
import { BellRing, Mail, Smartphone, Webhook } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/lib/toast-context";
import { Role } from "@/types/auth";

export default function AlertsPage() {
  const [rule, setRule] = useState("Low stock threshold");
  const [condition, setCondition] = useState("quantity_lt");
  const [threshold, setThreshold] = useState("40");
  const { pushToast } = useToast();

  return (
    <ProtectedRoute roles={[Role.MANAGER, Role.STORE_KEEPER]}>
      <AppShell>
        <Card>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Alerts & Notification Center</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create rule-based alerts and route events to channels.</p>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Rule Engine</h3>
            <Input value={rule} onChange={(e) => setRule(e.target.value)} placeholder="Rule Name" />
            <div className="grid gap-3 md:grid-cols-2">
              <Select value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="quantity_lt">Quantity below threshold</option>
                <option value="price_spike">Price spike %</option>
                <option value="expiry">Expiry window</option>
              </Select>
              <Input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
            </div>
            <Button
              onClick={() =>
                pushToast({
                  title: "Alert rule saved",
                  message: `${rule} (${condition}) @ ${threshold}`,
                  tone: "success"
                })
              }
            >
              <BellRing className="h-4 w-4" />
              Save Alert Rule
            </Button>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Notification Channels</h3>
            <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email Digest</p>
              <p className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> SMS Escalation</p>
              <p className="flex items-center gap-2"><Webhook className="h-4 w-4" /> Webhook Integration</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>17 active alerts</Badge>
              <Badge>3 critical</Badge>
            </div>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
