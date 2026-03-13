"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/lib/toast-context";
import { inrFormatter } from "@/lib/utils";
import { Role } from "@/types/auth";

export default function LocalizationPage() {
  const [locale, setLocale] = useState("en-IN");
  const [currency, setCurrency] = useState("INR");
  const { pushToast } = useToast();

  return (
    <ProtectedRoute roles={[Role.MANAGER]}>
      <AppShell>
        <Card>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Localization & Internationalization</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage language, locale, and formatting policies.</p>
        </Card>

        <Card className="grid gap-3 md:grid-cols-3">
          <Select value={locale} onChange={(e) => setLocale(e.target.value)}>
            <option value="en-IN">English (India)</option>
            <option value="en-US">English (US)</option>
            <option value="hi-IN">Hindi (India)</option>
          </Select>
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </Select>
          <Button className="w-full md:w-auto" onClick={() => pushToast({ title: "Locale policy updated", message: `${locale} / ${currency}`, tone: "success" })}>
            Apply Locale Policy
          </Button>
          <p className="text-sm text-slate-500 dark:text-slate-400 md:col-span-3">
            Preview: {new Intl.NumberFormat(locale, { style: "currency", currency }).format(12500)} (Default: {inrFormatter.format(12500)})
          </p>
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}
