"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { BellRing, Mail, Smartphone, Webhook } from "lucide-react";
import AppShell from "@/components/AppShell";
import ErrorAlert from "@/components/ErrorAlert";
import PageHeader from "@/components/PageHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/lib/auth-context";
import { GET_ALERTS, SAVE_ALERT_RULE } from "@/lib/graphql";
import { useToast } from "@/lib/toast-context";
import { Role } from "@/types/auth";
import { AlertRule, LowStockAlert } from "@/types/product";

interface AlertsResponse {
  alertRules: AlertRule[];
  lowStockAlerts: LowStockAlert[];
}

export default function AlertsPage() {
  const { token, isBootstrapping } = useAuth();
  const { pushToast } = useToast();
  const { data, error, refetch } = useQuery<AlertsResponse>(GET_ALERTS, {
    skip: isBootstrapping || !token
  });
  const [saveAlertRule, { loading }] = useMutation(SAVE_ALERT_RULE, {
    refetchQueries: [{ query: GET_ALERTS }]
  });

  const [rule, setRule] = useState("Low stock threshold");
  const [channel, setChannel] = useState("EMAIL");
  const [threshold, setThreshold] = useState("40");

  useEffect(() => {
    const existing = data?.alertRules?.[0];
    if (existing) {
      setRule(existing.name);
      setChannel(existing.channel);
      setThreshold(String(existing.threshold));
    }
  }, [data?.alertRules]);

  const rules = data?.alertRules ?? [];
  const lowStock = data?.lowStockAlerts ?? [];

  return (
    <ProtectedRoute roles={[Role.MANAGER, Role.STORE_KEEPER]}>
      <AppShell>
        <PageHeader title="Alerts & Notification Center" subtitle="Rules, thresholds, and live low-stock incidents across warehouses." />

        {error ? <ErrorAlert title="Could not load alerts" message="Alerts are temporarily unavailable." onRetry={() => refetch()} /> : null}

        <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
          <Card className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Rule Engine</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Configure low-stock escalation for live inventory balances.</p>
            </div>
            <Input value={rule} onChange={(e) => setRule(e.target.value)} placeholder="Rule Name" />
            <div className="grid gap-3 md:grid-cols-2">
              <Select value={channel} onChange={(e) => setChannel(e.target.value)}>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
                <option value="WEBHOOK">Webhook</option>
              </Select>
              <Input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
            </div>
            <Button
              loading={loading}
              onClick={async () => {
                await saveAlertRule({ variables: { input: { name: rule, threshold: Number(threshold), channel, isActive: true } } });
                pushToast({ title: "Alert rule saved", message: `${rule} updated`, tone: "success" });
              }}
            >
              <BellRing className="h-4 w-4" />
              Save Alert Rule
            </Button>
            <div className="grid gap-2 sm:grid-cols-3">
              {rules.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.channel}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.threshold} units</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Live Low Stock Alerts</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Triggered from real warehouse balances.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge><Mail className="mr-1 h-3 w-3" />Email</Badge>
                <Badge><Smartphone className="mr-1 h-3 w-3" />SMS</Badge>
                <Badge><Webhook className="mr-1 h-3 w-3" />Webhook</Badge>
              </div>
            </div>
            <div className="space-y-2">
              {lowStock.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No low-stock incidents right now.</p>
              ) : (
                lowStock.map((alert) => (
                  <div key={`${alert.productId}-${alert.warehouseId}`} className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{alert.productName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{alert.warehouseName}</p>
                      </div>
                      <Badge>{alert.severity}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{alert.quantity} units left · threshold {alert.threshold}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

