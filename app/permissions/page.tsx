"use client";

import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Role } from "@/types/auth";

const permissions = [
  { feature: "Inventory Edit", manager: true, keeper: true },
  { feature: "Dashboard KPI", manager: true, keeper: false },
  { feature: "Release Controls", manager: true, keeper: false },
  { feature: "CSV Export", manager: true, keeper: true }
];

export default function PermissionsPage() {
  return (
    <ProtectedRoute roles={[Role.MANAGER]}>
      <AppShell>
        <Card>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Permission Matrix</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Granular role capability controls.</p>
        </Card>

        <Card className="space-y-2">
          {permissions.map((row) => (
            <div key={row.feature} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between dark:border-slate-800">
              <p className="text-sm text-slate-900 dark:text-slate-100">{row.feature}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className={row.manager ? "" : "opacity-50"}>Manager {row.manager ? "Allow" : "Deny"}</Badge>
                <Badge className={row.keeper ? "" : "opacity-50"}>Store Keeper {row.keeper ? "Allow" : "Deny"}</Badge>
              </div>
            </div>
          ))}
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}
