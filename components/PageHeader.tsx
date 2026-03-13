import { ReactNode } from "react";

export default function PageHeader({
  title,
  subtitle,
  actions
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      {actions ? <div className="flex w-full flex-wrap gap-2 md:w-auto md:justify-end">{actions}</div> : null}
    </div>
  );
}
