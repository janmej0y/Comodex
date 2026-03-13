"use client";

import { useQuery } from "@apollo/client";
import AppShell from "@/components/AppShell";
import ErrorAlert from "@/components/ErrorAlert";
import PageHeader from "@/components/PageHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { GET_AUDIT_TRAIL } from "@/lib/graphql";
import { dateFormatter } from "@/lib/utils";
import { Role } from "@/types/auth";
import { AuditEvent } from "@/types/product";

interface AuditResponse {
  auditTrail: AuditEvent[];
}

export default function AuditPage() {
  const { token, isBootstrapping } = useAuth();
  const { data, error, refetch } = useQuery<AuditResponse>(GET_AUDIT_TRAIL, {
    variables: { limit: 24 },
    skip: isBootstrapping || !token
  });

  const logs = data?.auditTrail ?? [];

  return (
    <ProtectedRoute roles={[Role.MANAGER]}>
      <AppShell>
        <PageHeader title="Audit & Compliance" subtitle="Immutable history for auth, inventory, transfers, procurement, and alerts." />
        {error ? <ErrorAlert title="Could not load audit trail" message="Audit data is unavailable." onRetry={() => refetch()} /> : null}

        <Card className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{log.action}</p>
                <Badge>{dateFormatter.format(new Date(log.createdAt))}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{log.entityType} · {log.entityId}</p>
              {log.metadata ? <p className="mt-2 break-all text-xs text-slate-500 dark:text-slate-400">{log.metadata}</p> : null}
            </div>
          ))}
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}

