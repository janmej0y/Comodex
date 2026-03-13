export interface AnalyticsEvent {
  name: string;
  meta?: Record<string, string | number | boolean>;
  at: string;
}

const lastSentByEvent = new Map<string, number>();

export function trackEvent(name: string, meta?: Record<string, string | number | boolean>) {
  const now = Date.now();
  const last = lastSentByEvent.get(name) ?? 0;
  const throttleMs = name === "products_search" ? 1200 : 300;

  if (now - last < throttleMs) {
    return;
  }

  lastSentByEvent.set(name, now);
  const event: AnalyticsEvent = { name, meta, at: new Date().toISOString() };

  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem("analytics-events") ?? "[]") as AnalyticsEvent[];
      localStorage.setItem("analytics-events", JSON.stringify([event, ...existing].slice(0, 200)));
    } catch {
      // noop
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", event);
  }
}
