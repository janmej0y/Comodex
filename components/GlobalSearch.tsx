"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { Search } from "lucide-react";
import { GET_PRODUCTS } from "@/lib/graphql";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { Input } from "@/components/ui/Input";

interface ProductsResponse {
  products: Product[];
}

interface RecentAction {
  label: string;
  href: string;
}

export default function GlobalSearch({ className }: { className?: string }) {
  const { token, isBootstrapping } = useAuth();
  const { data } = useQuery<ProductsResponse>(GET_PRODUCTS, {
    skip: isBootstrapping || !token
  });
  const [term, setTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const recentActions = useMemo<RecentAction[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      return JSON.parse(localStorage.getItem("recent-actions") ?? "[]") as RecentAction[];
    } catch {
      return [];
    }
  }, [term]);

  const results = useMemo(() => {
    const products = data?.products ?? [];
    if (!term.trim()) {
      return products.slice(0, 4);
    }

    const normalized = term.toLowerCase();
    return products
      .filter((item) => [item.id, item.name, item.category].some((field) => field.toLowerCase().includes(normalized)))
      .slice(0, 6);
  }, [data?.products, term]);

  return (
    <div className={cn("relative w-full md:w-[380px]", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        ref={inputRef}
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "/") {
            event.preventDefault();
            inputRef.current?.focus();
          }
        }}
        placeholder="Global search products, categories, recent actions"
        className="pl-10"
        aria-label="Global search"
      />
      {(term || recentActions.length > 0) && (
        <div className="absolute left-0 right-0 top-[110%] z-20 rounded-xl border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span className="font-medium">{product.name}</span>
              <span className="ml-2 text-xs text-slate-500">{product.category}</span>
            </Link>
          ))}
          {recentActions.slice(0, 3).map((action) => (
            <Link
              key={`${action.label}-${action.href}`}
              href={action.href}
              className="block rounded-lg px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Recent: {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
