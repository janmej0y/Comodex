"use client";

import { useState } from "react";
import { ClipboardCheck, ShoppingCart, Truck } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/lib/toast-context";
import { Role } from "@/types/auth";

export default function OperationsPage() {
  const [mode, setMode] = useState<"PO" | "SALE" | "RECEIPT">("PO");
  const [partner, setPartner] = useState("Acme Supplier Pvt Ltd");
  const [item, setItem] = useState("Arabica Coffee Beans");
  const [qty, setQty] = useState("50");
  const { pushToast } = useToast();

  return (
    <ProtectedRoute roles={[Role.MANAGER]}>
      <AppShell>
        <Card>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Purchase & Sales Workflow</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create POs, dispatches, and receipts in one flow.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant={mode === "PO" ? "primary" : "secondary"} onClick={() => setMode("PO")}>
              <ShoppingCart className="h-4 w-4" />
              Purchase Order
            </Button>
            <Button variant={mode === "SALE" ? "primary" : "secondary"} onClick={() => setMode("SALE")}>
              <Truck className="h-4 w-4" />
              Sales Dispatch
            </Button>
            <Button variant={mode === "RECEIPT" ? "primary" : "secondary"} onClick={() => setMode("RECEIPT")}>
              <ClipboardCheck className="h-4 w-4" />
              Goods Receipt
            </Button>
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{mode} Draft</h3>
          <div className="grid gap-3 md:grid-cols-4">
            <Input value={partner} onChange={(e) => setPartner(e.target.value)} placeholder="Partner" />
            <Input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Item" />
            <Input value={qty} onChange={(e) => setQty(e.target.value)} type="number" placeholder="Quantity" />
            <Select defaultValue="Standard">
              <option>Standard</option>
              <option>Urgent</option>
              <option>Scheduled</option>
            </Select>
          </div>
          <Button
            onClick={() => pushToast({ title: `${mode} created`, message: `${qty} x ${item}`, tone: "success" })}
          >
            Save Draft
          </Button>
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}