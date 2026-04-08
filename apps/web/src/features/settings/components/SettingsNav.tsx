import { useLocationStore } from "@/state/location";
import { apiPost } from "@/lib/api/client";
import { useSessionStore } from "@/state/session";
import { t, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Lock, LogOut, Smartphone, User } from "lucide-react";

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard/settings") {
    return pathname === "/dashboard/settings";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SettingsNav({ locale }: { locale: Locale }) {
  const pathname = useLocationStore((state) => state.pathname);
  const clearSession = useSessionStore((state) => state.clearSession);
  const m = t(locale);
  const dm = m.dashboard;
  const items = [
    { title: m.common.profile, href: "/dashboard/settings", icon: User },
    { title: m.common.security, href: "/dashboard/settings/security", icon: Lock },
    { title: m.common.sessions, href: "/dashboard/settings/sessions", icon: Smartphone },
    { title: m.common.changePassword, href: "/forgot-password", icon: Lock },
  ];

  async function handleSignOut() {
    try {
      await apiPost<{ logged_out: boolean }>("/api/v1/auth/logout", {});
    } catch {
      // Ignore network errors and still clear local session state.
    } finally {
      clearSession();
      window.location.href = "/sign-in";
    }
  }

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="max-w-full overflow-x-auto">
        <div className="inline-flex min-w-max items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
          {items.map((item) => {
            const className = `inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition ${
              isActive(pathname, item.href)
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
            }`;
            if (item.href.startsWith("/dashboard/")) {
              const routerHref = item.href.slice("/dashboard".length) || "/";
              return (
                <Link key={item.href} href={routerHref} className={className}>
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            }
            return (
              <a key={item.href} href={item.href} className={className}>
                <item.icon className="h-4 w-4" />
                {item.title}
              </a>
            );
          })}
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="destructive"
            className="shrink-0 whitespace-nowrap bg-red-700/25 text-red-300 hover:bg-red-600/40"
          >
            <LogOut className="h-4 w-4" />
            {m.common.signOut}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dm.settingsNav.signOutTitle}</DialogTitle>
            <DialogDescription>{dm.settingsNav.signOutDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{dm.settingsNav.cancel}</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="destructive" onClick={() => void handleSignOut()}>
                {dm.settingsNav.confirmSignOut}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

