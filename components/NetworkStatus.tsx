"use client";

import { useEffect, useState } from "react";

export default function NetworkStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (online) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 shadow-soft dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      You are offline. Actions may not sync until connection is restored.
    </div>
  );
}