"use client";

import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/lib/toast-context";
import { Role } from "@/types/auth";

export default function QualityPage() {
  const { pushToast } = useToast();

  return (
    <ProtectedRoute roles={[Role.MANAGER]}>
      <AppShell>
        <Card>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Frontend Quality Gates</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Unit/component/e2e/visual testing, a11y checks, performance budgets.</p>
        </Card>

        <Card className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge>Vitest</Badge>
            <Badge>React Testing Library</Badge>
            <Badge>Playwright</Badge>
            <Badge>Lighthouse CI</Badge>
            <Badge>axe-core</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Button className="w-full" onClick={() => pushToast({ title: "Unit tests queued", message: "Vitest run started", tone: "info" })}>Run Unit Tests</Button>
            <Button className="w-full" variant="secondary" onClick={() => pushToast({ title: "E2E suite queued", message: "Playwright run started", tone: "info" })}>
              Run E2E Suite
            </Button>
            <Button className="w-full" variant="secondary" onClick={() => pushToast({ title: "Visual diff queued", message: "Snapshot comparison started", tone: "info" })}>
              Run Visual Diff
            </Button>
          </div>
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}
