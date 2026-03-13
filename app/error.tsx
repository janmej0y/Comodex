"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { reportError } from "@/lib/error-utils";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [errorId, setErrorId] = useState("ERR-UNKNOWN");

  useEffect(() => {
    const normalized = reportError(error, "global_boundary");
    setErrorId(normalized.id);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 dark:bg-slate-950">
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <AlertTriangle className="mx-auto mb-3 h-7 w-7 text-amber-500" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">An unexpected UI error occurred. Retry this view.</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Reference: {errorId}</p>
        <Button onClick={reset} className="mt-4">
          Try again
        </Button>
      </div>
    </div>
  );
}
