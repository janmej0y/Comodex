import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.35rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.92))] p-3.5 shadow-[0_28px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-md transition duration-300 hover:-translate-y-[2px] hover:shadow-[0_32px_80px_-38px_rgba(14,165,233,0.28)] dark:border-slate-800/90 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.92))] sm:rounded-[1.5rem] sm:p-5",
        className
      )}
      {...props}
    />
  );
}
