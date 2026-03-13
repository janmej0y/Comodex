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
  unitPrice: string;
  quantity: string;
}

const emptyState: FormState = {
  id: "",
  name: "",
  category: "",
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
            className="fixed right-0 top-0 z-50 h-full w-full max-w-xl border-l border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80"
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
