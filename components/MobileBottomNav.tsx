"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/navigation";
import { Role } from "@/types/auth";

export default function MobileBottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role)).slice(0, 5);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 xl:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex flex-col items-center justify-center rounded-lg px-1 py-1.5 text-[10px] font-medium",
                active ? "bg-brand-600 text-white" : "text-slate-600 dark:text-slate-300"
              ].join(" ")}
            >
              <Icon className="mb-0.5 h-3.5 w-3.5" />
              {item.label.slice(0, 8)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}