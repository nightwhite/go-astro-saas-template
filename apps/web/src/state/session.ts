import { create } from "zustand";

type User = {
  id: string;
  email: string;
  display_name?: string;
  role?: string;
  tenant_id?: string;
};

export type SessionTeam = {
  id: string;
  name: string;
  slug: string;
  role?: string;
  role_name?: string;
};

export type Session = {
  user: User;
  permissions?: string[];
  teams?: SessionTeam[];
  selectedTeam?: string;
} | null;

export type RuntimeConfig = {
  siteName: string;
  backendReady?: boolean;
  webOrigin?: string;
  flags?: {
    disableCreditBillingSystem?: boolean;
    enablePasskey?: boolean;
    enableGoogleSSO?: boolean;
  };
};

type SessionState = {
  session: Session;
  config: RuntimeConfig | null;
  isLoading: boolean;
  lastFetched: Date | null;
  fetchSession?: () => Promise<void>;
  refresh: () => Promise<void>;
  refetchSession: () => void;
  clearSession: () => void;
  setSession: (session: Session) => void;
  setConfig: (config: RuntimeConfig | null) => void;
  setSelectedTeam: (teamID: string | undefined) => void;
  clearSelectedTeam: () => void;
};

// Minimal session store to match the reference Navigation behavior.
// We only need `session` + `isLoading` now; richer auth state can be added later.
export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  config: null,
  isLoading: true,
  lastFetched: null,
  fetchSession: async () => {
    await get().refresh();
  },
  setSession: (session) => set({ session }),
  setConfig: (config) => set({ config }),
  setSelectedTeam: (teamID) =>
    set((state) => {
      if (!state.session) return state;
      return {
        ...state,
        session: {
          ...state.session,
          selectedTeam: teamID,
        },
      };
    }),
  clearSelectedTeam: () =>
    set((state) => {
      if (!state.session) return state;
      return {
        ...state,
        session: {
          ...state.session,
          selectedTeam: undefined,
        },
      };
    }),
  refetchSession: () => {
    void get().refresh();
  },
  clearSession: () => set({ session: null, isLoading: false, lastFetched: null }),
  refresh: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/get-session", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        set({ session: null, config: null, isLoading: false, lastFetched: null });
        return;
      }
      const body = (await res.json().catch(() => null)) as { session?: any; config?: any } | null;

      const nextSession = body?.session?.user ? (body.session as Session) : null;
      const nextConfig = (body?.config ?? null) as RuntimeConfig | null;

      set({
        session: nextSession,
        config: nextConfig,
        isLoading: false,
        lastFetched: new Date(),
      });
    } catch {
      set({ session: null, config: null, isLoading: false, lastFetched: null });
    }
  },
}));
