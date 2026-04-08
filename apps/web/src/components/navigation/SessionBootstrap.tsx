"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/state/session";
import { prefetchCSRFToken } from "@/lib/api/csrf";

export default function SessionBootstrap() {
  const refresh = useSessionStore((s) => s.refresh);

  useEffect(() => {
    void refresh();
    void prefetchCSRFToken();
  }, [refresh]);

  useEffect(() => {
    let lastRefresh = 0;
    const maybeRefresh = () => {
      const now = Date.now();
      if (now - lastRefresh < 8_000) return;
      lastRefresh = now;
      void refresh();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") maybeRefresh();
    };
    const onFocus = () => maybeRefresh();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return null;
}
