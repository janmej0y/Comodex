export default function ProductsLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-4">
      <div className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
      <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
    </div>
  );
}