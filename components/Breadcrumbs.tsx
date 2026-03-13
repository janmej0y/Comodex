"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function segmentLabel(value: string) {
  return value
    .replace(/\[|\]/g, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-xs text-slate-500 dark:text-slate-400">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link className="hover:text-slate-900 dark:hover:text-slate-100" href={segments.length ? "/products" : "/"}>
            Home
          </Link>
        </li>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;

          return (
            <li key={href} className="flex items-center gap-2">
              <span>/</span>
              {isLast ? (
                <span className="font-medium text-slate-700 dark:text-slate-200">{segmentLabel(segment)}</span>
              ) : (
                <Link className="hover:text-slate-900 dark:hover:text-slate-100" href={href}>
                  {segmentLabel(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}