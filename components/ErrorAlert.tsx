import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorAlert({
  title = "Something went wrong",
  message,
  errorId,
  onRetry
}: {
  title?: string;
  message: string;
  errorId?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/40">
      <div className="mb-1 flex items-center gap-2 text-rose-700 dark:text-rose-200">
        <AlertTriangle className="h-4 w-4" />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="text-sm text-rose-700/90 dark:text-rose-200/90">{message}</p>
      {errorId ? <p className="mt-1 text-xs text-rose-700/80 dark:text-rose-300/80">Reference: {errorId}</p> : null}
      {onRetry ? (
        <Button variant="secondary" className="mt-3" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      ) : null}
    </div>
  );
}