"use client";

import { Download, WifiOff } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/lib/toast-context";
import { Role } from "@/types/auth";

export default function PwaPage() {
  const { pushToast } = useToast();

  return (
    <ProtectedRoute roles={[Role.MANAGER, Role.STORE_KEEPER]}>
      <AppShell>
        <Card>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">PWA & Offline Readiness</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Installable app shell with offline-friendly UX states.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>Manifest configured</Badge>
            <Badge>Offline status banner</Badge>
          </div>
        </Card>

        <Card className="space-y-3">
          <Button className="w-full sm:w-auto" onClick={() => pushToast({ title: "Install prompt unavailable", message: "Use browser install option for now.", tone: "info" })}>
            <Download className="h-4 w-4" />
            Install App
          </Button>
          <p className="text-sm text-slate-500 dark:text-slate-400">Use browser menu to install now; service worker can be plugged in next.</p>
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><WifiOff className="h-4 w-4" />Offline mode currently provides graceful UI fallback.</p>
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}
