"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/lib/toast-context";
import { Role } from "@/types/auth";

export default function DesignSystemPage() {
  const [clicks, setClicks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [previewText, setPreviewText] = useState("Executive Inventory UI");
  const [density, setDensity] = useState("comfortable");
  const { pushToast } = useToast();

  const runAsyncDemo = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setLoading(false);
    setClicks((prev) => prev + 1);
    pushToast({ title: "Button action completed", message: "Design token preview updated", tone: "success" });
  };

  return (
    <ProtectedRoute roles={[Role.MANAGER]}>
      <AppShell>
        <Card className="bg-gradient-to-br from-white via-cyan-50/70 to-amber-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Design System Lab</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Interactive component playground with real button behavior.</p>
            </div>
            <Badge className="gap-1 bg-white/80 dark:bg-slate-800"><Sparkles className="h-3 w-3" />Interactive Demo</Badge>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Buttons</p>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                <Button className="w-full" onClick={() => setClicks((prev) => prev + 1)}>Primary</Button>
                <Button className="w-full" variant="secondary" onClick={() => setClicks((prev) => prev + 1)}>Secondary</Button>
                <Button className="w-full" variant="ghost" onClick={() => setClicks((prev) => prev + 1)}>Ghost</Button>
                <Button className="w-full" variant="danger" onClick={() => setClicks((prev) => prev + 1)}>Danger</Button>
                <Button className="w-full sm:col-span-2 xl:col-span-1" variant="secondary" onClick={() => pushToast({ title: "State demo", message: "All buttons are active in this lab.", tone: "info" })}>
                  State Demo
                </Button>
              </div>
            <Button onClick={runAsyncDemo} className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {loading ? "Processing..." : "Run Async Action"}
            </Button>
            <p className="text-xs text-slate-500 dark:text-slate-400">Buttons clicked: {clicks}</p>
          </Card>

          <Card className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Inputs + Theme Controls</p>
            <Input value={previewText} onChange={(e) => setPreviewText(e.target.value)} placeholder="Preview copy" />
            <Select value={density} onChange={(e) => setDensity(e.target.value)}>
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </Select>
            <div
              className={[
                "rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900",
                density === "compact" ? "space-y-1" : density === "spacious" ? "space-y-4" : "space-y-2"
              ].join(" ")}
            >
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{previewText}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Typography and spacing preview block.</p>
              <div className="flex flex-wrap gap-2">
                <Badge>brand-500</Badge>
                <Badge>radius-xl</Badge>
                <Badge>shadow-soft</Badge>
              </div>
            </div>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
