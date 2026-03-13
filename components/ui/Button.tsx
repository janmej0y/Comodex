"use client";

import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

export function Button({ className, variant = "primary", loading = false, children, disabled, ...props }: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "border border-cyan-400/40 bg-[linear-gradient(135deg,rgba(14,165,233,1),rgba(2,132,199,1)_45%,rgba(245,158,11,0.92))] text-white shadow-[0_22px_50px_-24px_rgba(2,132,199,0.75)] hover:brightness-110 dark:border-cyan-300/20 dark:text-slate-950",
    secondary:
      "border border-slate-200/80 bg-white/90 text-slate-700 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.45)] hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-800",
    ghost: "text-slate-700 hover:bg-white/80 dark:text-slate-200 dark:hover:bg-slate-800/80",
    danger:
      "border border-rose-300/60 bg-[linear-gradient(135deg,rgba(255,241,242,1),rgba(255,228,230,1))] text-rose-700 shadow-[0_18px_38px_-24px_rgba(244,63,94,0.55)] hover:bg-rose-50 dark:border-rose-900 dark:bg-rose-950/70 dark:text-rose-200"
  };

  return (
    <button
      className={cn(
        "group relative inline-flex touch-manipulation items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-2 text-sm font-medium transition-[transform,filter,background-color,border-color,color,box-shadow] duration-120 hover:-translate-y-[1px] active:translate-y-0 outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:focus-visible:ring-cyan-400 dark:focus-visible:ring-offset-slate-950",
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.24),transparent)] opacity-0 transition duration-300 group-hover:opacity-100" />
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
}
