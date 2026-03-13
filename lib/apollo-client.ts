"use client";

import { ApolloClient, ApolloLink, InMemoryCache, Observable } from "@apollo/client";
import { createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { reportError } from "@/lib/error-utils";
import { Role } from "@/types/auth";
import { Product, ProductMovement, ProductTrendPoint } from "@/types/product";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let productsDb: Product[] = [
  {
    id: "P-101",
    name: "Arabica Coffee Beans",
    category: "Beverage",
    unitPrice: 1249.99,
    quantity: 250,
    updatedAt: new Date().toISOString()
  },
  {
    id: "P-102",
    name: "Premium Wheat Flour",
    category: "Grains",
    unitPrice: 425.75,
    quantity: 68,
    updatedAt: new Date().toISOString()
  },
  {
    id: "P-103",
    name: "Himalayan Rock Salt",
    category: "Spices",
    unitPrice: 310.2,
    quantity: 24,
    updatedAt: new Date().toISOString()
  },
  {
    id: "P-104",
    name: "Cold-Pressed Olive Oil",
    category: "Cooking",
    unitPrice: 895.5,
    quantity: 130,
    updatedAt: new Date().toISOString()
  }
];

let movementDb: ProductMovement[] = [
  {
    id: "M-1",
    productId: "P-101",
    type: "IN",
    quantity: 100,
    reason: "Supplier restock",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: "M-2",
    productId: "P-101",
    type: "OUT",
    quantity: 20,
    reason: "Branch transfer",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "M-3",
    productId: "P-103",
    type: "ADJUSTMENT",
    quantity: 4,
    reason: "Stock correction",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

function buildTrend(productId: string): ProductTrendPoint[] {
  const base = productsDb.find((product) => product.id === productId)?.quantity ?? 0;
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return labels.map((label, index) => ({
    label,
    value: Math.max(0, Math.round(base - 25 + index * 8 + ((index % 2 === 0 ? 1 : -1) * 3)))
  }));
}

const mockLink = new ApolloLink((operation) => {
  return new Observable((observer) => {
    const run = async () => {
      const delay = operation.operationName === "GetProducts" ? 80 : 110;
      await wait(delay);
      const { operationName, variables } = operation;

      if (operationName === "LoginUser") {
        const input = variables?.input as { email: string; password: string; role: Role };

        if (!input?.email || !input?.password || input.password.length < 6) {
          observer.error(new Error("Invalid credentials."));
          return;
        }

        observer.next({
          data: {
            login: {
              token: `mock-jwt-${Date.now()}`,
              user: {
                id: crypto.randomUUID(),
                name: input.email.split("@")[0] || "Operator",
                email: input.email,
                role: input.role
              }
            }
          }
        });
        observer.complete();
        return;
      }

      if (operationName === "GetProducts") {
        observer.next({ data: { products: productsDb } });
        observer.complete();
        return;
      }

      if (operationName === "GetProduct") {
        const product = productsDb.find((item) => item.id === variables?.id) ?? null;
        observer.next({ data: { product } });
        observer.complete();
        return;
      }

      if (operationName === "GetProductMovements") {
        const entries = movementDb
          .filter((item) => item.productId === variables?.productId)
          .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        observer.next({ data: { productMovements: entries } });
        observer.complete();
        return;
      }

      if (operationName === "GetProductTrend") {
        observer.next({ data: { productTrend: buildTrend(variables?.productId) } });
        observer.complete();
        return;
      }

      if (operationName === "UpsertProduct") {
        const input = variables?.input as Omit<Product, "updatedAt">;
        const now = new Date().toISOString();
        const existingIndex = productsDb.findIndex((item) => item.id === input.id);

        if (existingIndex >= 0) {
          const previousQuantity = productsDb[existingIndex].quantity;
          productsDb[existingIndex] = { ...productsDb[existingIndex], ...input, updatedAt: now };

          if (previousQuantity !== input.quantity) {
            movementDb = [
              {
                id: `M-${Date.now()}`,
                productId: input.id,
                type: "ADJUSTMENT",
                quantity: Math.abs(input.quantity - previousQuantity),
                reason: "Manual edit",
                createdAt: now
              },
              ...movementDb
            ];
          }

          observer.next({ data: { upsertProduct: productsDb[existingIndex] } });
        } else {
          const created: Product = { ...input, updatedAt: now };
          productsDb = [created, ...productsDb];
          movementDb = [
            {
              id: `M-${Date.now()}`,
              productId: input.id,
              type: "IN",
              quantity: input.quantity,
              reason: "Initial stock",
              createdAt: now
            },
            ...movementDb
          ];
          observer.next({ data: { upsertProduct: created } });
        }

        observer.complete();
        return;
      }

      if (operationName === "AdjustStock") {
        const input = variables?.input as { productId: string; delta: number; reason: string };
        const index = productsDb.findIndex((item) => item.id === input.productId);
        if (index < 0) {
          observer.error(new Error("Product not found."));
          return;
        }

        const now = new Date().toISOString();
        const updatedQty = Math.max(0, productsDb[index].quantity + input.delta);
        productsDb[index] = { ...productsDb[index], quantity: updatedQty, updatedAt: now };

        movementDb = [
          {
            id: `M-${Date.now()}`,
            productId: input.productId,
            type: "ADJUSTMENT",
            quantity: Math.abs(input.delta),
            reason: input.reason,
            createdAt: now
          },
          ...movementDb
        ];

        observer.next({ data: { adjustStock: productsDb[index] } });
        observer.complete();
        return;
      }

      observer.error(new Error(`Unknown operation: ${operationName}`));
    };

    run().catch((error) => observer.error(error));
  });
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((entry) => {
      const isUnauthorized = /unauthorized/i.test(entry.message);

      if (isUnauthorized && typeof window !== "undefined") {
        localStorage.removeItem("commodex-session");

        if (window.location.pathname !== "/") {
          window.location.replace("/");
        }

        return;
      }

      reportError(new Error(entry.message), "graphql", {
        operation: operation.operationName
      });
    });
  }

  if (networkError) {
    reportError(networkError, "network", {
      operation: operation.operationName
    });
  }
});

const backendGraphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;

const backendLink = backendGraphqlUrl
  ? ApolloLink.from([
      setContext((_, { headers }) => {
        const raw = typeof window !== "undefined" ? localStorage.getItem("commodex-session") : null;
        const token = raw ? (JSON.parse(raw) as { token?: string }).token : null;

        return {
          headers: {
            ...headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        };
      }),
      createHttpLink({ uri: backendGraphqlUrl, credentials: "include" })
    ])
  : null;

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, backendLink ?? mockLink]),
  cache: new InMemoryCache()
});
