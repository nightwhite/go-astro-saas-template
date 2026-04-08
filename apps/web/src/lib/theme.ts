export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const THEME_CHANGE_EVENT = "go-astro-theme-change";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function getSystemTheme(): ResolvedTheme {
  if (!isBrowser()) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") return getSystemTheme();
  return mode;
}

export function getStoredTheme(): ThemeMode | null {
  if (!isBrowser()) return null;
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(value) ? value : null;
  } catch {
    return null;
  }
}

export function applyTheme(mode: ThemeMode): ResolvedTheme {
  if (!isBrowser()) return mode === "system" ? "dark" : mode;
  const resolved = resolveTheme(mode);
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
  root.setAttribute("data-theme", mode);
  return resolved;
}

export function getInitialTheme(defaultTheme: ThemeMode = "dark"): ThemeMode {
  return getStoredTheme() ?? defaultTheme;
}

export function setTheme(mode: ThemeMode, defaultTheme: ThemeMode = "dark"): ResolvedTheme {
  const nextMode = isThemeMode(mode) ? mode : defaultTheme;
  const resolved = applyTheme(nextMode);
  if (isBrowser()) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch {
      // Ignore localStorage write errors in private mode.
    }
    window.dispatchEvent(
      new CustomEvent(THEME_CHANGE_EVENT, {
        detail: { mode: nextMode, resolved },
      }),
    );
  }
  return resolved;
}

