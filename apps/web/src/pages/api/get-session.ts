export const prerender = false;

// Same-origin session bootstrap endpoint, modeled after the reference Next.js template.
// Browser/React islands fetch `/api/get-session` to get `{ session, config }` and avoid CORS/cookie issues.
export async function GET({ request }: { request: Request }) {
  const base = import.meta.env.APP_BASE_URL || "http://127.0.0.1:8080";

  const upstream = new URL("/api/v1/auth/me", base);
  const incoming = new Headers(request.headers);
  incoming.delete("host");
  incoming.delete("origin");

  let session: any = null;
  let backendReady = false;
  const tokenCookieName = import.meta.env.APP_SESSION_COOKIE_NAME || "go_astro_session";
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenCookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${tokenCookieName}=`));
  const selectedTeamCookieName = "go_astro_selected_team";
  const selectedTeamCookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${selectedTeamCookieName}=`));
  const selectedTeamFromCookie = selectedTeamCookie ? decodeURIComponent(selectedTeamCookie.split("=").slice(1).join("=")) : "";
  const sessionToken = tokenCookie ? decodeURIComponent(tokenCookie.split("=").slice(1).join("=")) : "";
  try {
    const resp = await fetch(upstream.toString(), {
      method: "GET",
      headers: incoming,
      // Forward cookies from the browser to API via Astro.
      credentials: "include",
    });

    if (resp.ok) {
      backendReady = true;
      const body = (await resp.json().catch(() => null)) as { data?: any } | null;
      const user = body?.data?.user ?? null;
      if (user) {
        // Keep the shape compatible with the reference `{ session, config }`.
        session = { user };
        if (body?.data?.permissions) session.permissions = body.data.permissions;
        if (sessionToken) {
          try {
            const teamsResp = await fetch(new URL("/api/v1/teams", base).toString(), {
              method: "GET",
              headers: incoming,
              credentials: "include",
            });
            if (!teamsResp.ok) {
              throw new Error("failed to fetch teams");
            }
            const teamsBody = (await teamsResp.json().catch(() => null)) as {
              data?: {
                teams?: Array<{ id: string; name: string; slug: string; owner_user_id?: string }>;
              };
            } | null;
            const teams = teamsBody?.data?.teams ?? [];
            session.teams = teams.map((team) => ({
              id: team.id,
              name: team.name,
              slug: team.slug,
              role: team.owner_user_id === user.id ? "owner" : "member",
              role_name: team.owner_user_id === user.id ? "Owner" : "Member",
            }));
            const selected = selectedTeamFromCookie && teams.some((team) => team.id === selectedTeamFromCookie)
              ? selectedTeamFromCookie
              : teams[0]?.id || "";
            session.selectedTeam = selected || undefined;
          } catch {
            // Keep auth payload available even if teams endpoint is unavailable.
          }
        }
      }
    } else {
      backendReady = resp.status !== 502 && resp.status !== 503;
    }
  } catch {
    // During dev startup API can be temporarily unavailable; return empty session + config.
    session = null;
  }

  // Minimal config surface; can be extended to mirror reference flags without adding coupling.
  const config = {
    siteName: import.meta.env.APP_NAME || "go-astro-template",
    backendReady,
    webOrigin: import.meta.env.APP_WEB_ORIGIN || "",
    flags: {
      disableCreditBillingSystem: false,
      enablePasskey: true,
      enableGoogleSSO: true,
    },
  };

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  if (session?.selectedTeam) {
    headers.append(
      "Set-Cookie",
      `${selectedTeamCookieName}=${encodeURIComponent(session.selectedTeam)}; Path=/; HttpOnly; SameSite=Lax`,
    );
  }

  return new Response(JSON.stringify({ session, config }), { status: 200, headers });
}
