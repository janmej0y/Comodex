export interface NormalizedAppError {
  id: string;
  userMessage: string;
  developerMessage: string;
  recoverable: boolean;
  scope: string;
}

function createErrorId() {
  return `ERR-${Date.now().toString(36).toUpperCase()}`;
}

function detectUserMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : String(error ?? "");

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "You appear to be offline. Check your internet connection and try again.";
  }

  if (/invalid credentials/i.test(message)) {
    return "The email, password, or role is incorrect.";
  }

  if (/network|fetch|failed to fetch/i.test(message)) {
    return "We could not reach the server. Please try again in a moment.";
  }

  if (/not found/i.test(message)) {
    return "The requested item could not be found.";
  }

  return fallback;
}

export function normalizeError(error: unknown, scope: string, fallback = "Something went wrong. Please try again."): NormalizedAppError {
  const id = createErrorId();
  const developerMessage = error instanceof Error ? error.stack || error.message : String(error ?? "Unknown error");

  return {
    id,
    scope,
    recoverable: true,
    userMessage: detectUserMessage(error, fallback),
    developerMessage
  };
}

export function reportError(error: unknown, scope: string, extra?: Record<string, unknown>) {
  const normalized = normalizeError(error, scope);

  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem("dev-error-log") ?? "[]") as Array<{
        id: string;
        scope: string;
        developerMessage: string;
        extra?: Record<string, unknown>;
        at: string;
      }>;

      const next = [
        {
          id: normalized.id,
          scope: normalized.scope,
          developerMessage: normalized.developerMessage,
          extra,
          at: new Date().toISOString()
        },
        ...existing
      ].slice(0, 200);

      localStorage.setItem("dev-error-log", JSON.stringify(next));
    } catch {
      // noop
    }
  }

  console.error(`[${normalized.id}] [${scope}]`, {
    error,
    normalized,
    extra
  });

  return normalized;
}