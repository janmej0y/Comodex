"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Download, Filter, ListFilter, Pencil, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import ErrorAlert from "@/components/ErrorAlert";
import PageHeader from "@/components/PageHeader";
import ProductModal from "@/components/ProductModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableRoot, Td, Th } from "@/components/ui/Table";
import { ADJUST_STOCK, GET_PRODUCTS, UPSERT_PRODUCT } from "@/lib/graphql";
import { normalizeError, reportError } from "@/lib/error-utils";
import { trackEvent } from "@/lib/telemetry";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { dateFormatter, inrFormatter } from "@/lib/utils";
import { Role } from "@/types/auth";
import { Product } from "@/types/product";

type SortKey = "id" | "name" | "category" | "unitPrice" | "quantity" | "updatedAt";
type SortDir = "asc" | "desc";

interface ProductsResponse {
  products: Product[];
}

interface UpsertResponse {
  upsertProduct: Product;
}

interface AdjustResponse {
  adjustStock: Product;
}

interface ColumnState {
  id: boolean;
  name: boolean;
  category: boolean;
  unitPrice: boolean;
  quantity: boolean;
  updatedAt: boolean;
}

interface SavedView {
  name: string;
  search: string;
  category: string;
  lowStockOnly: boolean;
  sortKey: SortKey;
  sortDir: SortDir;
  columns: ColumnState;
}

const DEFAULT_COLUMNS: ColumnState = {
  id: true,
  name: true,
  category: true,
  unitPrice: true,
  quantity: true,
  updatedAt: true
};

const PAGE_SIZE = 7;
const LOW_STOCK_THRESHOLD = 40;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { token, isBootstrapping } = useAuth();
  const shouldSkipQuery = isBootstrapping || !token;
  const { data, loading, error, refetch } = useQuery<ProductsResponse>(GET_PRODUCTS, {
    skip: shouldSkipQuery
  });
  const [upsertProduct] = useMutation<UpsertResponse>(UPSERT_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }]
  });
  const [adjustStock] = useMutation<AdjustResponse>(ADJUST_STOCK, {
    refetchQueries: [{ query: GET_PRODUCTS }]
  });
  const { pushToast } = useToast();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [columns, setColumns] = useState<ColumnState>(DEFAULT_COLUMNS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savedViewName, setSavedViewName] = useState("My View");
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pageError, setPageError] = useState<{ message: string; id: string } | null>(null);
  const [bulkLoadingDelta, setBulkLoadingDelta] = useState<number | null>(null);

  const products = data?.products ?? [];

  useEffect(() => {
    try {
      const loaded = JSON.parse(localStorage.getItem("product-saved-views") ?? "[]") as SavedView[];
      setSavedViews(loaded);
    } catch {
      setSavedViews([]);
    }
  }, []);

  useEffect(() => {
    const lowStock = searchParams.get("lowStock");
    const categoryParam = searchParams.get("category");
    if (lowStock === "1") {
      setLowStockOnly(true);
    }
    if (categoryParam) {
      setCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName);

      if (event.key === "/" && !typing) {
        event.preventDefault();
        document.getElementById("products-search")?.focus();
      }

      if (event.key.toLowerCase() === "n" && !typing) {
        event.preventDefault();
        setEditingProduct(null);
        setIsModalOpen(true);
      }

      if (event.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isModalOpen]);

  const categories = useMemo(() => {
    const values = Array.from(new Set(products.map((item) => item.category)));
    return ["ALL", ...values.sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    const next = products.filter((product) => {
      const matchSearch =
        !term || [product.name, product.category, product.id].some((field) => field.toLowerCase().includes(term));
      const matchCategory = category === "ALL" || product.category === category;
      const matchStock = !lowStockOnly || product.quantity <= LOW_STOCK_THRESHOLD;
      return matchSearch && matchCategory && matchStock;
    });

    next.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDir === "asc" ? aValue - bValue : bValue - aValue;
      }

      return sortDir === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return next;
  }, [category, lowStockOnly, products, search, sortDir, sortKey]);

  const summary = useMemo(() => {
    const totalValue = filteredProducts.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const lowCount = filteredProducts.filter((item) => item.quantity <= LOW_STOCK_THRESHOLD).length;
    return { totalValue, lowCount };
  }, [filteredProducts]);

  const getOptimisticAdjusted = (productId: string, delta: number) => {
    const current = products.find((item) => item.id === productId);
    if (!current) {
      return null;
    }

    return {
      ...current,
      quantity: Math.max(0, current.quantity + delta),
      updatedAt: new Date().toISOString()
    };
  };

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const handleSubmit = async (input: Omit<Product, "updatedAt">) => {
    await upsertProduct({ variables: { input } });
    const action = editingProduct ? "Updated" : "Created";

    pushToast({ title: `${action} product`, message: `${input.name} is saved`, tone: "success" });
    trackEvent("product_upsert", { action: action.toLowerCase(), id: input.id });

    const recent = [{ label: `${action}: ${input.name}`, href: `/products/${input.id}` }];
    const existing = JSON.parse(localStorage.getItem("recent-actions") ?? "[]") as Array<{ label: string; href: string }>;
    localStorage.setItem("recent-actions", JSON.stringify([...recent, ...existing].slice(0, 12)));
  };

  const handleBulkAdjust = async (delta: number, reason: string) => {
    setBulkLoadingDelta(delta);
    const ids = [...selectedIds];

    try {
      await Promise.all(
        ids.map((productId) =>
          adjustStock({
            variables: { input: { productId, delta, reason } },
            optimisticResponse: (() => {
              const optimistic = getOptimisticAdjusted(productId, delta);
              return optimistic ? ({ adjustStock: optimistic } as { adjustStock: Product }) : undefined;
            })()
          })
        )
      );
    } catch (error) {
      const normalized = normalizeError(error, "products_bulk_adjust", "Bulk update failed. Try fewer rows.");
      setPageError({ message: normalized.userMessage, id: normalized.id });
      reportError(error, "products_bulk_adjust", { selectedIds: ids, delta, reason });
      setBulkLoadingDelta(null);
      return;
    }

    setSelectedIds([]);
    pushToast({
      title: "Bulk action complete",
      message: `${ids.length} products adjusted`,
      tone: "success",
      actionLabel: delta < 0 ? "Undo" : undefined,
      onAction:
        delta < 0
          ? () => {
              Promise.all(
                ids.map((productId) =>
                  adjustStock({
                    variables: { input: { productId, delta: Math.abs(delta), reason: "Undo bulk decrement" } }
                  })
                )
              )
                .then(() => pushToast({ title: "Undo complete", message: "Bulk decrement reverted", tone: "info" }))
                .catch((undoError) => {
                  const normalized = normalizeError(undoError, "products_bulk_undo", "Could not undo this change.");
                  setPageError({ message: normalized.userMessage, id: normalized.id });
                  reportError(undoError, "products_bulk_undo", { ids, delta });
                });
            }
          : undefined
    });
    trackEvent("products_bulk_adjust", { count: ids.length, delta });
    setBulkLoadingDelta(null);
  };

  const exportCsv = () => {
    try {
      const header = ["ID", "Name", "Category", "Unit Price", "Quantity", "Updated At"];
      const rows = filteredProducts.map((item) => [
        item.id,
        item.name,
        item.category,
        item.unitPrice.toFixed(2),
        String(item.quantity),
        item.updatedAt
      ]);

      const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      const normalized = normalizeError(error, "products_export", "Unable to export CSV right now.");
      setPageError({ message: normalized.userMessage, id: normalized.id });
      reportError(error, "products_export");
    }
  };

  const saveView = () => {
    const next: SavedView = {
      name: savedViewName || `View ${savedViews.length + 1}`,
      search,
      category,
      lowStockOnly,
      sortKey,
      sortDir,
      columns
    };

    const merged = [next, ...savedViews].slice(0, 10);
    setSavedViews(merged);
    localStorage.setItem("product-saved-views", JSON.stringify(merged));
    pushToast({ title: "Saved view", message: next.name, tone: "info" });
    trackEvent("products_saved_view", { name: next.name });
  };

  const applyView = (view: SavedView) => {
    setSearch(view.search);
    setCategory(view.category);
    setLowStockOnly(view.lowStockOnly);
    setSortKey(view.sortKey);
    setSortDir(view.sortDir);
    setColumns(view.columns);
    setPage(1);
    pushToast({ title: "Applied view", message: view.name, tone: "info" });
    trackEvent("products_apply_view", { name: view.name });
  };

  const selectAllOnPage = (checked: boolean) => {
    if (!checked) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedProducts.some((item) => item.id === id)));
      return;
    }

    const pageIds = paginatedProducts.map((item) => item.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
  };

  return (
    <ProtectedRoute roles={[Role.MANAGER, Role.STORE_KEEPER]}>
      <AppShell>
        <div className="space-y-4">
          <PageHeader
            title="Inventory Management"
            subtitle="Search, filter, and operate inventory at scale."
            actions={
              <>
                <Button variant="secondary" className="w-full sm:w-auto" onClick={exportCsv}>
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </>
            }
          />

          <Card className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">Visible SKUs</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{filteredProducts.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">Low Stock</p>
                <p className="text-xl font-semibold text-amber-600 dark:text-amber-300">{summary.lowCount}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">Visible Value</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{inrFormatter.format(summary.totalValue)}</p>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-5">
              <label className="relative md:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="products-search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by id, product, category"
                  className="pl-10"
                />
              </label>

              <Select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(1);
                }}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>

              <Button
                className="w-full justify-center"
                variant={lowStockOnly ? "primary" : "secondary"}
                onClick={() => {
                  setLowStockOnly((prev) => !prev);
                  setPage(1);
                }}
              >
                <Filter className="h-4 w-4" />
                Low Stock
              </Button>

              <Select
                value={`${sortKey}:${sortDir}`}
                onChange={(event) => {
                  const [key, dir] = event.target.value.split(":") as [SortKey, SortDir];
                  setSortKey(key);
                  setSortDir(dir);
                }}
              >
                <option value="updatedAt:desc">Latest Updated</option>
                <option value="name:asc">Name (A-Z)</option>
                <option value="name:desc">Name (Z-A)</option>
                <option value="quantity:asc">Quantity (Low to High)</option>
                <option value="quantity:desc">Quantity (High to Low)</option>
                <option value="unitPrice:asc">Price (Low to High)</option>
                <option value="unitPrice:desc">Price (High to Low)</option>
              </Select>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50">
              <button
                className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
                onClick={() => setShowAdvanced((prev) => !prev)}
              >
                <ListFilter className="h-4 w-4" />
                {showAdvanced ? "Hide Advanced Controls" : "Show Advanced Controls"}
              </button>
              {showAdvanced ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Input value={savedViewName} onChange={(event) => setSavedViewName(event.target.value)} className="w-full sm:w-44" />
                    <Button variant="secondary" onClick={saveView}>
                      Save View
                    </Button>
                    {savedViews.map((view) => (
                      <Button key={view.name} variant="ghost" onClick={() => applyView(view)} className="border border-slate-200 dark:border-slate-700">
                        {view.name}
                      </Button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                    <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                    {(Object.keys(columns) as Array<keyof ColumnState>).map((key) => (
                      <label key={key} className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={columns[key]}
                          onChange={(event) => setColumns((prev) => ({ ...prev, [key]: event.target.checked }))}
                        />
                        {key}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {selectedIds.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm dark:border-cyan-900 dark:bg-cyan-950/40">
                <Badge>{selectedIds.length} selected</Badge>
                <Button
                  variant="secondary"
                  loading={bulkLoadingDelta === 5}
                  onClick={() => handleBulkAdjust(5, "Bulk increment")}
                >
                  +5 Qty
                </Button>
                <Button
                  variant="secondary"
                  loading={bulkLoadingDelta === -5}
                  onClick={() => handleBulkAdjust(-5, "Bulk decrement")}
                >
                  -5 Qty
                </Button>
                <Button variant="ghost" onClick={() => setSelectedIds([])}>
                  Clear
                </Button>
              </div>
            ) : null}
          </Card>

          {error ? (
            <ErrorAlert
              title="Could not load products"
              message={normalizeError(error, "products_query", "Please retry in a moment.").userMessage}
              onRetry={() => refetch()}
            />
          ) : null}
          {pageError ? <ErrorAlert title="Action failed" message={pageError.message} errorId={pageError.id} onRetry={() => setPageError(null)} /> : null}

          <div className="space-y-3 md:hidden">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="space-y-3 p-4">
                  <div className="h-5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                </Card>
              ))
            ) : paginatedProducts.length === 0 ? (
              <Card className="space-y-4 p-5 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">No products match these filters.</p>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setSearch("");
                    setCategory("ALL");
                    setLowStockOnly(false);
                  }}
                >
                  Clear Filters
                </Button>
              </Card>
            ) : (
              paginatedProducts.map((product) => {
                const isSelected = selectedIds.includes(product.id);
                return (
                  <Card key={product.id} className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">{product.name}</p>
                          {product.quantity <= LOW_STOCK_THRESHOLD ? (
                            <Badge className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                              Low Stock
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{product.id}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(event) => {
                          if (!event.target.checked) {
                            setSelectedIds((prev) => prev.filter((id) => id !== product.id));
                            return;
                          }
                          setSelectedIds((prev) => Array.from(new Set([...prev, product.id])));
                        }}
                        aria-label={`Select ${product.name}`}
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Category</p>
                        <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{product.category}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Unit Price</p>
                        <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{inrFormatter.format(product.unitPrice)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Quantity</p>
                        <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{product.quantity}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Updated</p>
                        <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{dateFormatter.format(new Date(product.updatedAt))}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        className="w-full justify-center"
                        onClick={() => {
                          setEditingProduct(product);
                          setIsModalOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Link
                        href={`/products/${product.id}`}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-[0_10px_24px_-12px_rgba(2,132,199,0.75)] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110 dark:from-brand-500 dark:to-cyan-400 dark:text-slate-950"
                      >
                        View Details
                      </Link>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          <TableRoot className="hidden max-w-full md:block">
            <Table aria-label="Products inventory table">
              <thead className="sticky top-0 z-10 border-b border-slate-200/80 bg-slate-50/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
                <tr>
                  <Th>
                    <input
                      type="checkbox"
                      aria-label="Select rows on current page"
                      checked={paginatedProducts.length > 0 && paginatedProducts.every((item) => selectedIds.includes(item.id))}
                      onChange={(event) => selectAllOnPage(event.target.checked)}
                    />
                  </Th>
                  {columns.id && (
                    <Th>
                      <button onClick={() => toggleSort("id")}>ID</button>
                    </Th>
                  )}
                  {columns.name && (
                    <Th>
                      <button onClick={() => toggleSort("name")}>Product</button>
                    </Th>
                  )}
                  {columns.category && (
                    <Th>
                      <button onClick={() => toggleSort("category")}>Category</button>
                    </Th>
                  )}
                  {columns.unitPrice && (
                    <Th>
                      <button onClick={() => toggleSort("unitPrice")}>Unit Price</button>
                    </Th>
                  )}
                  {columns.quantity && (
                    <Th>
                      <button onClick={() => toggleSort("quantity")}>Quantity</button>
                    </Th>
                  )}
                  {columns.updatedAt && (
                    <Th>
                      <button onClick={() => toggleSort("updatedAt")}>Updated</button>
                    </Th>
                  )}
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      <Td colSpan={8} className="py-3">
                        <div className="h-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                      </Td>
                    </tr>
                  ))
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <Td colSpan={8} className="py-10 text-center text-slate-500 dark:text-slate-400">
                      <p className="mb-2">No products match these filters.</p>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSearch("");
                          setCategory("ALL");
                          setLowStockOnly(false);
                        }}
                      >
                        Clear Filters
                      </Button>
                    </Td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => {
                    const isSelected = selectedIds.includes(product.id);
                    return (
                      <tr
                        key={product.id}
                        className="border-b border-slate-100 text-sm last:border-none hover:bg-slate-50/80 dark:border-slate-800/70 dark:hover:bg-slate-800/50"
                      >
                        <Td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) => {
                              if (!event.target.checked) {
                                setSelectedIds((prev) => prev.filter((id) => id !== product.id));
                                return;
                              }
                              setSelectedIds((prev) => Array.from(new Set([...prev, product.id])));
                            }}
                            aria-label={`Select ${product.name}`}
                          />
                        </Td>
                        {columns.id && <Td className="font-medium text-slate-700 dark:text-slate-200">{product.id}</Td>}
                        {columns.name && (
                          <Td className="text-slate-900 dark:text-slate-100">
                            <Link href={`/products/${product.id}`} className="underline-offset-2 hover:underline">
                              {product.name}
                            </Link>
                          </Td>
                        )}
                        {columns.category && <Td className="text-slate-600 dark:text-slate-300">{product.category}</Td>}
                        {columns.unitPrice && <Td className="text-slate-600 dark:text-slate-300">{inrFormatter.format(product.unitPrice)}</Td>}
                        {columns.quantity && (
                          <Td className="text-slate-600 dark:text-slate-300">
                            {product.quantity}
                            {product.quantity <= LOW_STOCK_THRESHOLD ? (
                              <Badge className="ml-2 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                                Low
                              </Badge>
                            ) : null}
                          </Td>
                        )}
                        {columns.updatedAt && <Td className="text-slate-600 dark:text-slate-300">{dateFormatter.format(new Date(product.updatedAt))}</Td>}
                        <Td className="text-right">
                          <Button
                            variant="secondary"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsModalOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </Td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </TableRoot>

          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-slate-500 dark:text-slate-400">
              {filteredProducts.length === 0
                ? "Showing 0 of 0"
                : `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, filteredProducts.length)} of ${filteredProducts.length}`}
            </p>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
              <Button className="w-full sm:w-auto" variant="secondary" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
                Prev
              </Button>
              <Badge className="w-full justify-center">
                Page {page} / {totalPages}
              </Badge>
              <Button className="w-full sm:w-auto" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
                Next
              </Button>
            </div>
          </div>
        </div>

        <ProductModal
          product={editingProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
