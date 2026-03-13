"use client";

import { useState } from "react";
import { QrCode, ScanLine } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/lib/toast-context";
import { Role } from "@/types/auth";

export default function ScanPage() {
  const [code, setCode] = useState("P-101");
  const { pushToast } = useToast();

  return (
    <ProtectedRoute roles={[Role.MANAGER, Role.STORE_KEEPER]}>
      <AppShell>
        <Card>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Barcode / QR Scanner</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Fast picking and receiving flow for mobile operators.</p>
        </Card>

        <Card className="space-y-3">
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Scan or enter code" />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="w-full sm:w-auto" onClick={() => pushToast({ title: "Item detected", message: code, tone: "success" })}>
              <ScanLine className="h-4 w-4" />
              Scan Item
            </Button>
            <Button className="w-full sm:w-auto" variant="secondary" onClick={() => pushToast({ title: "Label generated", message: `QR created for ${code}`, tone: "info" })}>
              <QrCode className="h-4 w-4" />
              Generate Label
            </Button>
          </div>
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}
