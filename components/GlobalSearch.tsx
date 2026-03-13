"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { GET_PRODUCTS } from "@/lib/graphql";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
  const [isOpen, setIsOpen] = useState(false);
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
  }, [isOpen]);

  const results = useMemo(() => {
    const products = data?.products ?? [];
    if (!term.trim()) {
      return products.slice(0, 6);
    }

    const normalized = term.toLowerCase();
    return products
      .filter((item) => [item.id, item.name, item.category].some((field) => field.toLowerCase().includes(normalized)))
      .slice(0, 8);
  }, [data?.products, term]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");

      if (event.key === "/" && !typing) {
        event.preventDefault();
        setIsOpen(true);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeout = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  return (
    <>
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          type="button"
          variant="secondary"
          className="h-12 min-w-12 rounded-2xl px-3"
          onClick={() => setIsOpen(true)}
          aria-label="Open global search"
        >
          <Search className="h-4 w-4" />
        </Button>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="hidden h-12 min-w-0 flex-1 items-center rounded-2xl border border-white/80 bg-white/90 px-4 text-left text-slate-500 shadow-[0_22px_50px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl transition hover:border-brand-300 hover:text-slate-700 sm:flex dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-400 dark:hover:border-brand-700 dark:hover:text-slate-200"
        >
          <span className="truncate">Search products, categories, recent actions</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="fixed inset-x-3 top-16 z-50 mx-auto w-auto max-w-2xl overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/95 shadow-[0_36px_90px_-42px_rgba(15,23,42,0.55)] backdrop-blur-2xl sm:inset-x-4 sm:top-20 sm:w-full sm:rounded-[1.75rem] dark:border-slate-800 dark:bg-slate-900/95"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              <div className="border-b border-slate-200/80 p-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    <Search className="h-4 w-4" />
                  </div>
                  <Input
                    ref={inputRef}
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                    placeholder="Type a product, category, or SKU"
                    className="h-11 rounded-2xl border-transparent bg-slate-100 px-4 shadow-none focus-visible:ring-0 dark:bg-slate-800"
                    aria-label="Global search input"
                  />
                  <Button type="button" variant="ghost" className="h-11 rounded-2xl px-3" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-3">
                {results.length > 0 ? (
                  <div>
                    <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Suggestions</p>
                    <div className="space-y-1">
                      {results.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <span className="font-medium text-slate-800 dark:text-slate-100">{product.name}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{product.category}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {recentActions.length > 0 ? (
                  <div className={cn(results.length > 0 ? "mt-4" : "")}>
                    <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Recent</p>
                    <div className="space-y-1">
                      {recentActions.slice(0, 5).map((action) => (
                        <Link
                          key={`${action.label}-${action.href}`}
                          href={action.href}
                          onClick={() => setIsOpen(false)}
                          className="block rounded-2xl px-3 py-3 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          {action.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {results.length === 0 && recentActions.length === 0 ? (
                  <div className="px-3 py-10 text-center text-sm text-slate-500 dark:text-slate-400">No suggestions available yet.</div>
                ) : null}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
