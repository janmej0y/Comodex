"use client";

import { useState } from "react";
import { ArrowRightLeft, Building2, MapPin } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/lib/toast-context";
import { Role } from "@/types/auth";

const branches = ["Mumbai Central", "Delhi North", "Bangalore Hub", "Kolkata Port"];

export default function WarehousesPage() {
  const [from, setFrom] = useState(branches[0]);
  const [to, setTo] = useState(branches[1]);
  const [sku, setSku] = useState("P-101");
  const [qty, setQty] = useState("20");
  const { pushToast } = useToast();

  return (
    <ProtectedRoute roles={[Role.MANAGER]}>
      <AppShell>
        <Card className="bg-gradient-to-br from-white to-sky-50 dark:from-slate-900 dark:to-slate-900">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Multi-Warehouse Control</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Location-aware stock and transfer orchestration.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {branches.map((branch) => (
              <Badge key={branch} className="gap-1">
                <MapPin className="h-3 w-3" />
                {branch}
              </Badge>
            ))}
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-4">
          {branches.map((branch, i) => (
            <Card key={branch}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{branch}</p>
                <Building2 className="h-4 w-4 text-slate-500" />
              </div>
              <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{(1200 - i * 160).toLocaleString()}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Units in stock</p>
            </Card>
          ))}
        </div>

        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Inter-Warehouse Transfer</h3>
          <div className="grid gap-3 md:grid-cols-4">
            <Select value={from} onChange={(e) => setFrom(e.target.value)}>
              {branches.map((branch) => (
                <option key={branch}>{branch}</option>
              ))}
            </Select>
            <Select value={to} onChange={(e) => setTo(e.target.value)}>
              {branches.map((branch) => (
                <option key={branch}>{branch}</option>
              ))}
            </Select>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU" />
            <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Quantity" />
          </div>
          <Button
            onClick={() =>
              pushToast({
                title: "Transfer queued",
                message: `${qty} units of ${sku} from ${from} to ${to}`,
                tone: "success"
              })
            }
          >
            <ArrowRightLeft className="h-4 w-4" />
            Initiate Transfer
          </Button>
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}