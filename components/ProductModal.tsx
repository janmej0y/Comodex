"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import ErrorAlert from "@/components/ErrorAlert";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { normalizeError, reportError } from "@/lib/error-utils";

interface ProductFormInput {
  id: string;
  name: string;
  category: string;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  reorderLevel: number;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ProductFormInput) => Promise<void>;
}

interface FormState {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  unitPrice: string;
  quantity: string;
}

const emptyState: FormState = {
  id: "",
  name: "",
  category: "",
  imageUrl: "",
  unitPrice: "",
  quantity: ""
};

export default function ProductModal({ product, isOpen, onClose, onSubmit }: ProductModalProps) {
  const [form, setForm] = useState<FormState>(emptyState);
  const [error, setError] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!product) {
      setForm(emptyState);
      return;
    }

    setForm({
      id: product.id,
      name: product.name,
      category: product.category,
      imageUrl: product.imageUrl ?? "",
      unitPrice: String(product.unitPrice),
      quantity: String(product.quantity)
    });
  }, [product]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const isDirty = useMemo(() => {
    const baseline = product
      ? {
          id: product.id,
          name: product.name,
          category: product.category,
          imageUrl: product.imageUrl ?? "",
          unitPrice: String(product.unitPrice),
          quantity: String(product.quantity)
        }
      : emptyState;

    return JSON.stringify(baseline) !== JSON.stringify(form);
  }, [form, product]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isDirty) {
          const shouldClose = window.confirm("You have unsaved changes. Close anyway?");
          if (!shouldClose) {
            return;
          }
        }
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isDirty, isOpen, onClose]);

  const requestClose = () => {
    if (isDirty) {
      const shouldClose = window.confirm("You have unsaved changes. Close anyway?");
      if (!shouldClose) {
        return;
      }
    }

    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.id.trim() || !form.name.trim() || !form.category.trim()) {
      setError("ID, name, and category are required.");
      return;
    }

    const unitPrice = Number(form.unitPrice);
    const quantity = Number(form.quantity);

    if (Number.isNaN(unitPrice) || unitPrice <= 0 || Number.isNaN(quantity) || quantity < 0) {
      setError("Use valid price and quantity values.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        id: form.id.trim(),
        name: form.name.trim(),
        category: form.category.trim(),
        imageUrl: form.imageUrl.trim() || undefined,
        unitPrice,
        quantity,
        reorderLevel: product?.reorderLevel ?? 40
      });
      onClose();
    } catch (submitError) {
      const normalized = normalizeError(submitError, "product_modal_submit", "Unable to save product right now.");
      setError(normalized.userMessage);
      setErrorId(normalized.id);
      reportError(submitError, "product_modal_submit", { id: form.id });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={requestClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={product ? "Edit product" : "Add product"}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto border-l border-white/20 bg-white/80 p-4 shadow-2xl backdrop-blur-xl sm:p-6 dark:border-slate-700 dark:bg-slate-900/80"
            initial={reduceMotion ? false : { x: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 260 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {product ? "Edit Product" : "Add Product"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Maintain inventory in real-time.</p>
              </div>
              <Button onClick={requestClose} variant="secondary" className="px-2 py-2" aria-label="Close panel">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">Fields marked by context are required for inventory integrity.</p>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">ID</span>
                  <Input ref={firstInputRef} value={form.id} onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))} />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Category</span>
                  <Input
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Name</span>
                <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
              </label>

              <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Product Photo</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Optional. Upload a JPG, PNG, or WEBP up to 2 MB.</p>
                  </div>
                  {form.imageUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-3 py-2 text-xs"
                      onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:text-brand-200">
                    Upload Image
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.currentTarget.value = "";

                        if (!file) {
                          return;
                        }

                        if (file.size > 2 * 1024 * 1024) {
                          setError("Please upload an image smaller than 2 MB.");
                          return;
                        }

                        const reader = new FileReader();
                        reader.onload = () => {
                          setError(null);
                          setForm((prev) => ({
                            ...prev,
                            imageUrl: typeof reader.result === "string" ? reader.result : prev.imageUrl
                          }));
                        };
                        reader.onerror = () => setError("Image upload failed. Try another file.");
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>

                  <Input
                    value={form.imageUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                    placeholder="Or paste an image URL"
                  />
                </div>

                {form.imageUrl ? (
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.imageUrl} alt="Product preview" className="h-48 w-full object-cover" />
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Unit Price (INR)</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.unitPrice}
                    onChange={(event) => setForm((prev) => ({ ...prev, unitPrice: event.target.value }))}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Quantity</span>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={form.quantity}
                    onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
                  />
                </label>
              </div>

              {error ? <ErrorAlert title="Save failed" message={error} errorId={errorId ?? undefined} /> : null}

              <div className="flex gap-2">
                <Button type="button" variant="secondary" className="w-1/2" onClick={requestClose}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting} className="w-1/2">
                  {product ? "Save Changes" : "Create Product"}
                </Button>
              </div>
            </form>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
