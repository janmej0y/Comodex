import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/70 bg-white/85 p-4 shadow-soft backdrop-blur-sm transition duration-300 hover:-translate-y-[1px] hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/75 sm:p-5",
        className
      )}
      {...props}
    />
  );
}
