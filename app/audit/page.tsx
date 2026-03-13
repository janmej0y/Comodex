"use client";

import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Role } from "@/types/auth";

const logs = [
  { actor: "manager@comodex.io", action: "Updated price for P-104", date: "Today 10:21" },
  { actor: "store_keeper@comodex.io", action: "Adjusted qty for P-103", date: "Today 09:02" },
  { actor: "manager@comodex.io", action: "Created PO-2210", date: "Yesterday 17:12" }
];

export default function AuditPage() {
  return (
    <ProtectedRoute roles={[Role.MANAGER]}>
      <AppShell>
        <Card>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Audit & Compliance</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Immutable history with export-ready records.</p>
        </Card>

        <Card className="space-y-3">
          {logs.map((log) => (
            <div key={`${log.actor}-${log.action}`} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{log.action}</p>
                <Badge>{log.date}</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{log.actor}</p>
            </div>
          ))}
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}