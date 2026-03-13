"use client";

import { Link2, RefreshCcw } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/lib/toast-context";
import { Role } from "@/types/auth";

const providers = ["SAP ERP", "Zoho Books", "Shiprocket", "Slack", "Power BI"];

export default function IntegrationsPage() {
  const { pushToast } = useToast();

  return (
    <ProtectedRoute roles={[Role.MANAGER]}>
      <AppShell>
        <Card>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Integration Marketplace</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Connect ERP, accounting, shipping, and BI providers.</p>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <Card key={provider}>
              <p className="font-medium text-slate-900 dark:text-slate-100">{provider}</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Button className="w-full sm:w-auto" onClick={() => pushToast({ title: `${provider} connected`, message: "OAuth handshake simulated", tone: "success" })}>
                  <Link2 className="h-4 w-4" />
                  Connect
                </Button>
                <Button className="w-full sm:w-auto" variant="secondary" onClick={() => pushToast({ title: `${provider} sync started`, message: "Background sync queued", tone: "info" })}>
                  <RefreshCcw className="h-4 w-4" />
                  Sync
                </Button>
              </div>
              <div className="mt-2"><Badge>Not Connected</Badge></div>
            </Card>
          ))}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
