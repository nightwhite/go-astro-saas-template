import { create } from "zustand";

type LocationState = {
  pathname: string;
  pathWithSearch: string;
};

function getPathname(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname || "/";
}

function getPathWithSearch(): string {
  if (typeof window === "undefined") return "/";
  const pathname = window.location.pathname || "/";
  return `${pathname}${window.location.search || ""}`;
}

export const useLocationStore = create<LocationState>(() => ({
  pathname: getPathname(),
  pathWithSearch: getPathWithSearch(),
}));

// Keep pathname updated for client-side navigation events.
if (typeof window !== "undefined") {
  const update = () =>
    useLocationStore.setState((state) => {
      const nextPathname = getPathname();
      const nextPathWithSearch = getPathWithSearch();
      if (state.pathname === nextPathname && state.pathWithSearch === nextPathWithSearch) {
        return state;
      }
      return {
        pathname: nextPathname,
        pathWithSearch: nextPathWithSearch,
      };
    });

  window.addEventListener("popstate", update);
  window.addEventListener("hashchange", update);
  // Astro ClientRouter navigation events.
  document.addEventListener("astro:after-swap", update as EventListener);
  document.addEventListener("astro:page-load", update as EventListener);
  window.addEventListener("click", (e) => {
    const target = e.target as HTMLElement | null;
    const link = target?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!link) return;
    const href = link.getAttribute("href") || "";
    if (!href.startsWith("/")) return;
    // Allow the browser to update location first.
    setTimeout(update, 0);
  });
}
