"use client";

import { Rocket, ShieldAlert, ToggleLeft } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/lib/toast-context";
import { Role } from "@/types/auth";

export default function ReleaseControlsPage() {
  const { pushToast } = useToast();

  return (
    <ProtectedRoute roles={[Role.MANAGER]}>
      <AppShell>
        <Card>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Release Safety Controls</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Feature flags, rollout rules, and emergency kill switches.</p>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Feature Flags</p>
            <div className="mt-2 space-y-2 text-sm">
              <p className="flex items-center gap-2"><ToggleLeft className="h-4 w-4" />`forecast-v2` enabled for managers</p>
              <p className="flex items-center gap-2"><ToggleLeft className="h-4 w-4" />`bulk-adjust` rollout 50%</p>
            </div>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Safety</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>Kill switch armed</Badge>
              <Badge>Rollback window: 30m</Badge>
            </div>
          </Card>
          <Card>
            <Button className="w-full" onClick={() => pushToast({ title: "Release promoted", message: "Rollout moved to 100%", tone: "success" })}>
              <Rocket className="h-4 w-4" />
              Promote Release
            </Button>
            <Button
              variant="danger"
              className="mt-2 w-full"
              onClick={() => pushToast({ title: "Kill switch triggered", message: "Feature traffic disabled", tone: "error" })}
            >
              <ShieldAlert className="h-4 w-4" />
              Trigger Kill Switch
            </Button>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
