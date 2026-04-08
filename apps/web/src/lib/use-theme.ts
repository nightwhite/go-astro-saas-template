import { useEffect, useMemo, useState } from "react";
import {
  THEME_CHANGE_EVENT,
  applyTheme,
  getInitialTheme,
  getStoredTheme,
  getSystemTheme,
  setTheme as persistTheme,
  type ThemeMode,
  type ResolvedTheme,
} from "@/lib/theme";

interface UseThemeResult {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
}

export function useTheme(defaultTheme: ThemeMode = "dark"): UseThemeResult {
  const [theme, setThemeState] = useState<ThemeMode>(() => getInitialTheme(defaultTheme));
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMediaChange = () => {
      const nextSystem = getSystemTheme();
      setSystemTheme(nextSystem);
      const nextTheme = getStoredTheme() ?? defaultTheme;
      if (nextTheme === "system") applyTheme("system");
    };
    media.addEventListener("change", onMediaChange);
    return () => media.removeEventListener("change", onMediaChange);
  }, [defaultTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "theme") return;
      const nextTheme = getStoredTheme() ?? defaultTheme;
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    };
    const onThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ mode?: ThemeMode }>;
      const mode = customEvent.detail?.mode;
      if (!mode) return;
      setThemeState(mode);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
    };
  }, [defaultTheme]);

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  return useMemo(
    () => ({
      theme,
      resolvedTheme,
      systemTheme,
      setTheme: (nextTheme: ThemeMode) => {
        persistTheme(nextTheme, defaultTheme);
        setThemeState(nextTheme);
      },
    }),
    [defaultTheme, resolvedTheme, systemTheme, theme],
  );
}

